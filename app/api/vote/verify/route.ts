import { NextResponse } from "next/server";
import { finalize } from "@/lib/paystack";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ref = new URL(req.url).searchParams.get("ref") || "";
  if (!/^FF-[0-9A-F]{12}$/.test(ref)) return NextResponse.json({ state: "unknown" }, { status: 400 });
  try {
    return NextResponse.json(await finalize(ref));
  } catch {
    return NextResponse.json({ state: "pending" });
  }
}
