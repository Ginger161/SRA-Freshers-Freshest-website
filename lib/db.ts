import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function db() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set");
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

export async function isRevealed() {
  const { data } = await db().from("settings").select("value").eq("key", "revealed").maybeSingle();
  return data?.value === true;
}

export type Tally = { contestant_id: string; votes: number; txns: number; amount_kobo: number };

export async function tally(): Promise<Tally[]> {
  const { data, error } = await db().from("tally").select("*");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    contestant_id: r.contestant_id,
    votes: Number(r.votes),
    txns: Number(r.txns),
    amount_kobo: Number(r.amount_kobo),
  }));
}
