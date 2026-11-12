"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { COOKIE, isAdmin, passwordOk, sessionValue } from "@/lib/admin";
import { db } from "@/lib/db";
import { finalize } from "@/lib/paystack";

export async function login(form: FormData) {
  if (!passwordOk(String(form.get("password") || ""))) redirect("/admin?e=1");
  (await cookies()).set(COOKIE, sessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 3,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(COOKIE);
  redirect("/admin");
}

export async function setRevealed(form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const value = form.get("value") === "true";
  await db().from("settings").upsert({ key: "revealed", value });
  revalidatePath("/admin");
  revalidatePath("/results");
  redirect("/admin");
}

export async function recheck(form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const ref = String(form.get("ref") || "").trim().toUpperCase();
  const r = /^FF-[0-9A-F]{12}$/.test(ref) ? await finalize(ref) : { state: "unknown" };
  redirect(`/admin?ref=${encodeURIComponent(ref)}&state=${r.state}`);
}

/** Asks Paystack about every unfinished payment from the last 2 days and credits the ones that went through. */
export async function recheckPending() {
  if (!(await isAdmin())) redirect("/admin");
  const since = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  const { data } = await db()
    .from("votes")
    .select("reference")
    .eq("status", "pending")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(300);
  let paid = 0;
  const list = data ?? [];
  for (let i = 0; i < list.length; i += 10) {
    const res = await Promise.all(list.slice(i, i + 10).map((r) => finalize(r.reference).catch(() => null)));
    paid += res.filter((x) => x?.state === "paid").length;
  }
  const at = new Date().toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Lagos" });
  revalidatePath("/admin");
  redirect(`/admin?swept=${list.length}&recovered=${paid}&at=${encodeURIComponent(at)}`);
}

export async function setRaceMode(form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const mode = String(form.get("mode"));
  if (["auto", "on", "off"].includes(mode)) await db().from("settings").upsert({ key: "race_mode", value: mode });
  revalidatePath("/admin");
  redirect("/admin");
}

export async function setRaceFrozen(form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  await db().from("settings").upsert({ key: "race_frozen", value: form.get("value") === "true" });
  revalidatePath("/admin");
  redirect("/admin");
}
