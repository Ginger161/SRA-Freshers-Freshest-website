import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";

export const COOKIE = "ff_admin";

export const sessionValue = () =>
  crypto.createHmac("sha256", process.env.ADMIN_PASSWORD || "").update("freshest-fresher-admin").digest("hex");

export function passwordOk(pw: string) {
  const real = process.env.ADMIN_PASSWORD || "";
  if (!real) return false;
  const a = Buffer.from(pw);
  const b = Buffer.from(real);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function isAdmin() {
  if (!process.env.ADMIN_PASSWORD) return false;
  const c = (await cookies()).get(COOKIE)?.value;
  return !!c && c === sessionValue();
}
