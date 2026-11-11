import { NextResponse } from "next/server";
import crypto from "crypto";
import { finalize } from "@/lib/paystack";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.PAYSTACK_SECRET_KEY || "";
  const sig = req.headers.get("x-paystack-signature") || "";
  const expected = crypto.createHmac("sha512", secret).update(raw).digest("hex");
  if (!secret || sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return new NextResponse("bad signature", { status: 401 });
  }

  const event = JSON.parse(raw);
  if (event?.event === "charge.success" && typeof event?.data?.reference === "string") {
    // finalize re-checks the transaction with Paystack before crediting anything
    await finalize(event.data.reference).catch(() => null);
  }
  return NextResponse.json({ ok: true });
}
