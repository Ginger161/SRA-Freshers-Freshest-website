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
  // round down to a milestone (…, 100, 200, 500, 1,000, 2,000, 5,000, 10,000, …) so totals stay vague
  if (n < 20) return { n, over: false };
  const mag = Math.pow(10, Math.floor(Math.log10(n)));
  const r = [5, 2, 1].map((k) => k * mag).find((m) => m <= n)!;
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
    /** per category: share of that category's votes */
    byGender: (["f", "m"] as const).map((g) => {
      const list = ranked.filter((r) => contestants.find((c) => c.id === r.id)?.gender === g);
      const t = list.reduce((s, r) => s + r.v, 0);
      return { g, rows: list.map((r) => ({ id: r.id, pct: t ? (r.v / t) * 100 : 0 })) };
    }),
  };
}
