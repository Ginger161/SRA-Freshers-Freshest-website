import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { byId } from "@/lib/contestants";

export const dynamic = "force-dynamic";

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const rows: Record<string, unknown>[] = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await db()
      .from("votes")
      .select("*")
      .order("created_at", { ascending: true })
      .range(from, from + 999);
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < 1000) break;
  }

  const head = ["reference", "status", "contestant", "votes", "amount_naira", "email", "channel", "created_at", "paid_at"];
  const lines = rows.map((r) =>
    [
      r.reference,
      r.status,
      byId(String(r.contestant_id))?.name ?? r.contestant_id,
      r.votes,
      Number(r.amount_kobo) / 100,
      r.email,
      r.channel,
      r.created_at,
      r.paid_at,
    ].map(esc).join(",")
  );
  return new Response([head.join(","), ...lines].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="freshest-fresher-votes.csv"`,
    },
  });
}
