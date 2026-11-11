import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Anonymous "someone just voted" events. No names, contestants or amounts leave the server. */
export async function GET() {
  // local preview only (never set FEED_MOCK on Vercel)
  if (process.env.FEED_MOCK === "1") {
    const slot = Math.floor(Date.now() / 4000);
    const items = Array.from({ length: 5 }, (_, i) => {
      const n = slot - i;
      return { id: `mock${n}`, user: `user${String((n * 7919) % 10000).padStart(4, "0")}`, at: new Date(n * 4000).toISOString() };
    });
    return NextResponse.json({ items });
  }
  try {
    const { data } = await db()
      .from("votes")
      .select("reference, paid_at")
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(5);
    const items = (data ?? []).map((r) => {
      const h = crypto.createHash("sha256").update(r.reference).digest("hex");
      const id = h.slice(0, 10);
      const num = String(parseInt(h.slice(10, 18), 16) % 10000).padStart(4, "0");
      return { id, user: `user${num}`, at: r.paid_at };
    });
    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "public, s-maxage=4, stale-while-revalidate=6" } }
    );
  } catch {
    return NextResponse.json({ items: [] });
  }
}
