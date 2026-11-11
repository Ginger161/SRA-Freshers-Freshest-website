import { NextResponse } from "next/server";
import crypto from "crypto";
import { byId } from "@/lib/contestants";
import { MAX_VOTES, PRICE_KOBO, phaseAt, SITE_URL } from "@/lib/config";
import { db } from "@/lib/db";
import { initialize } from "@/lib/paystack";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const contestant = byId(String(body?.contestantId ?? ""));
  const votes = Math.floor(Number(body?.votes));
  const email = String(body?.email ?? "").trim().toLowerCase();

  const phase = phaseAt(Date.now());
  if (phase === "soon") return NextResponse.json({ error: "Voting hasn't opened yet." }, { status: 400 });
  if (phase === "closed") return NextResponse.json({ error: "Voting has closed." }, { status: 400 });
  if (!contestant) return NextResponse.json({ error: "Contestant not found." }, { status: 400 });
  if (!Number.isFinite(votes) || votes < 1 || votes > MAX_VOTES)
    return NextResponse.json({ error: `Choose between 1 and ${MAX_VOTES.toLocaleString()} votes.` }, { status: 400 });
  if (!EMAIL.test(email) || email.length > 200)
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });

  const reference = "FF-" + crypto.randomBytes(6).toString("hex").toUpperCase();
  const amountKobo = votes * PRICE_KOBO;

  const { error } = await db().from("votes").insert({
    reference,
    contestant_id: contestant.id,
    votes,
    amount_kobo: amountKobo,
    email,
  });
  if (error) return NextResponse.json({ error: "Couldn't start payment. Try again." }, { status: 500 });

  const origin = req.headers.get("origin") || SITE_URL;
  try {
    const p = await initialize({
      email,
      amountKobo,
      reference,
      callbackUrl: `${origin}/c/${contestant.id}?ref=${reference}`,
      metadata: {
        contestant_id: contestant.id,
        votes,
        custom_fields: [
          { display_name: "Contestant", variable_name: "contestant", value: contestant.name },
          { display_name: "Votes", variable_name: "votes", value: String(votes) },
        ],
      },
    });
    return NextResponse.json({ reference, accessCode: p.access_code, authorizationUrl: p.authorization_url });
  } catch {
    await db().from("votes").delete().eq("reference", reference).eq("status", "pending");
    return NextResponse.json({ error: "Payment service is busy. Try again." }, { status: 502 });
  }
}
