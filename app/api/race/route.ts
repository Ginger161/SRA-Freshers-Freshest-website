import { NextResponse } from "next/server";
import { raceState } from "@/lib/race";
import { CLOSES_AT, RACE_AT } from "@/lib/config";
import { contestants } from "@/lib/contestants";

export const dynamic = "force-dynamic";

// one shared answer per 2s for every visitor (single server instance)
let cache: { at: number; body: Awaited<ReturnType<typeof raceState>> } | null = null;

/** Positions only, never vote counts. */
export async function GET() {
  // local preview only (never set RACE_MOCK on the live server)
  if (process.env.RACE_MOCK === "1") {
    const now = Date.now();
    const slot = Math.floor(now / 3500);
    const ids = contestants.map((c) => c.id).slice(0, 10);
    for (let k = 0; k < 2; k++) {
      const a = (slot * 7 + k * 3) % 9;
      const b = a + 1;
      [ids[a], ids[b]] = [ids[b], ids[a]];
    }
    return NextResponse.json({ phase: "race", top: ids.slice(0, 7), serverNow: now, raceAt: now - 60000, closesAt: now + 9 * 60000, mode: "on" });
  }
  try {
    if (!cache || Date.now() - cache.at > 2000) cache = { at: Date.now(), body: await raceState() };
    return NextResponse.json({ ...cache.body, serverNow: Date.now() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    const now = Date.now();
    return NextResponse.json(
      { phase: now >= CLOSES_AT.getTime() ? "frozen" : "pre", top: [], serverNow: now, raceAt: RACE_AT.getTime(), closesAt: CLOSES_AT.getTime(), mode: "auto" },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
