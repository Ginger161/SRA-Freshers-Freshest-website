import "server-only";
import { db, tally } from "./db";
import { CLOSES_AT, RACE_AT, RACE_SIZE } from "./config";
import { contestants } from "./contestants";

export type RacePhase = "pre" | "race" | "frozen" | "revealed";
export type RaceMode = "auto" | "on" | "off";

export async function settings() {
  const { data } = await db().from("settings").select("key, value").in("key", ["revealed", "race_mode", "race_frozen"]);
  const m = new Map((data ?? []).map((r) => [r.key, r.value]));
  return {
    revealed: m.get("revealed") === true,
    mode: ((m.get("race_mode") as RaceMode) || "auto") as RaceMode,
    frozen: m.get("race_frozen") === true,
  };
}

export function phaseOf(now: number, s: { revealed: boolean; mode: RaceMode; frozen: boolean }): RacePhase {
  if (s.revealed) return "revealed";
  if (now >= CLOSES_AT.getTime()) return "frozen";
  if (s.mode === "off") return "pre";
  if (s.frozen) return "frozen";
  if (s.mode === "on" || now >= RACE_AT.getTime()) return "race";
  return "pre";
}

/** Contestant ids in rank order (paid votes only). Ties keep ballot order. */
export async function standings() {
  const rows = await tally();
  const votes = new Map(rows.map((r) => [r.contestant_id, r.votes]));
  return contestants
    .map((c, i) => ({ id: c.id, v: votes.get(c.id) ?? 0, i }))
    .sort((a, b) => b.v - a.v || a.i - b.i);
}

export async function raceState() {
  const now = Date.now();
  const s = await settings();
  const phase = phaseOf(now, s);
  const top =
    phase === "race" || phase === "frozen" ? (await standings()).slice(0, RACE_SIZE).map((r) => r.id) : [];
  return { phase, top, serverNow: now, raceAt: RACE_AT.getTime(), closesAt: CLOSES_AT.getTime(), mode: s.mode };
}

/** Rounded-down figure for "over X" copy. */
export function approx(n: number) {
  if (n < 100) return { n, over: false };
  const step = n < 1000 ? 100 : n < 10000 ? 500 : 1000;
  const r = Math.floor(n / step) * step;
  return { n: r, over: n > r };
}

export async function results() {
  const ranked = await standings();
  const total = ranked.reduce((s, r) => s + r.v, 0);
  const emails = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const { data } = await db().from("votes").select("email").eq("status", "paid").range(from, from + 999);
    if (!data?.length) break;
    data.forEach((d) => emails.add(String(d.email).toLowerCase()));
    if (data.length < 1000) break;
  }
  return {
    total,
    voters: emails.size,
    candidates: contestants.length,
    rows: ranked.map((r) => ({ id: r.id, pct: total ? (r.v / total) * 100 : 0 })),
  };
}
