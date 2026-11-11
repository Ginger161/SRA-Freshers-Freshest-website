import "server-only";
import { db } from "./db";

const API = "https://api.paystack.co";

const secret = () => {
  const s = process.env.PAYSTACK_SECRET_KEY;
  if (!s) throw new Error("PAYSTACK_SECRET_KEY not set");
  return s;
};

export async function initialize(opts: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}) {
  const res = await fetch(`${API}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: opts.email,
      amount: String(opts.amountKobo),
      currency: "NGN",
      reference: opts.reference,
      callback_url: opts.callbackUrl,
      metadata: opts.metadata,
    }),
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.status) throw new Error(json?.message || "Paystack initialize failed");
  return json.data as { authorization_url: string; access_code: string; reference: string };
}

export type FinalResult =
  | { state: "paid"; contestant_id: string; votes: number }
  | { state: "pending" | "failed" | "flagged" | "unknown" };

/**
 * Confirms a payment with Paystack and credits the votes exactly once.
 * Safe to call repeatedly — from the browser after checkout and from the webhook.
 */
export async function finalize(reference: string): Promise<FinalResult> {
  const { data: row } = await db().from("votes").select("*").eq("reference", reference).maybeSingle();
  if (!row) return { state: "unknown" };
  if (row.status === "paid") return { state: "paid", contestant_id: row.contestant_id, votes: row.votes };
  if (row.status === "flagged") return { state: "flagged" };

  const res = await fetch(`${API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret()}` },
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  const tx = json?.data;
  if (!res.ok || !tx) return { state: "pending" };

  if (tx.status !== "success") {
    if (["failed", "reversed"].includes(tx.status)) {
      await db().from("votes").update({ status: "failed" }).eq("reference", reference).eq("status", "pending");
      return { state: "failed" };
    }
    return { state: "pending" };
  }

  if (Number(tx.amount) !== row.amount_kobo || tx.currency !== "NGN") {
    await db()
      .from("votes")
      .update({ status: "flagged", paystack_id: tx.id, channel: tx.channel })
      .eq("reference", reference)
      .neq("status", "paid");
    return { state: "flagged" };
  }

  await db()
    .from("votes")
    .update({
      status: "paid",
      paid_at: tx.paid_at || tx.paidAt || new Date().toISOString(),
      paystack_id: tx.id,
      channel: tx.channel,
    })
    .eq("reference", reference)
    .in("status", ["pending", "failed"]);

  return { state: "paid", contestant_id: row.contestant_id, votes: row.votes };
}
