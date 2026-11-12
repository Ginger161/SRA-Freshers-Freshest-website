import { isAdmin } from "@/lib/admin";
import { db, isRevealed, tally } from "@/lib/db";
import { byId, contestants } from "@/lib/contestants";
import { naira } from "@/lib/config";
import { login, logout, recheck, recheckPending, setRaceFrozen, setRaceMode, setRevealed } from "./actions";
import { phaseOf, settings } from "@/lib/race";
import { RACE_AT, RACE_MINUTES } from "@/lib/config";
import Logo from "@/components/Logo";
import { AutoRefresh, SubmitButton } from "@/components/AdminBits";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Freshest Fresher", robots: { index: false } };

const when = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("en-GB", { timeZone: "Africa/Lagos", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";

export default async function Admin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;

  if (!(await isAdmin())) {
    return (
      <main className="admin" style={{ maxWidth: 420, paddingTop: 80 }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Logo className="brand-logo" />
        </div>
        <form action={login} className="box" style={{ display: "grid", gap: 14 }}>
          <h2>Admin</h2>
          <label className="field">
            <span>Password</span>
            <input type="password" name="password" required autoComplete="current-password" />
          </label>
          {sp.e && <p className="err">Wrong password.</p>}
          <SubmitButton className="btn btn-gold" pending="Signing in…">
            Sign in
          </SubmitButton>
        </form>
      </main>
    );
  }

  const [rows, revealed, recent, pending] = await Promise.all([
    tally(),
    isRevealed(),
    db().from("votes").select("*").order("created_at", { ascending: false }).limit(60),
    db().from("votes").select("reference", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const race = await settings();
  const phase = phaseOf(Date.now(), race);
  const map = new Map(rows.map((r) => [r.contestant_id, r]));
  const board = contestants
    .map((c) => ({ c, t: map.get(c.id) }))
    .sort((a, b) => (b.t?.votes ?? 0) - (a.t?.votes ?? 0));
  const totalVotes = rows.reduce((s, r) => s + r.votes, 0);
  const totalKobo = rows.reduce((s, r) => s + r.amount_kobo, 0);
  const txns = rows.reduce((s, r) => s + r.txns, 0);

  return (
    <main className="admin">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div className="brand">
          <Logo className="brand-logo" />
          <span className="brand-text">
            <b>Freshest Fresher</b>
            <span>Admin</span>
          </span>
        </div>
        <div className="row-actions">
          <a className="btn btn-ghost" href="/api/admin/export">
            Export CSV
          </a>
          <form action={logout}>
            <SubmitButton pending="Signing out…">Sign out</SubmitButton>
          </form>
        </div>
      </div>

      <AutoRefresh />
      <div className="stats">
        <div className="stat"><span>Votes</span><b>{totalVotes.toLocaleString()}</b></div>
        <div className="stat"><span>Revenue</span><b>{naira(totalKobo / 100)}</b></div>
        <div className="stat"><span>Paid transactions</span><b>{txns.toLocaleString()}</b></div>
        <div className="stat"><span>Awaiting payment</span><b>{(pending.count ?? 0).toLocaleString()}</b></div>
      </div>

      <div className="box">
        <h2>The Final {RACE_MINUTES}</h2>
        <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--soft)" }}>
          Board is <b style={{ color: "var(--gold)" }}>{phase.toUpperCase()}</b> · mode <b>{race.mode}</b>
          {race.frozen ? " · frozen" : ""} · starts automatically at{" "}
          {RACE_AT.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Lagos" })}
        </p>
        <div className="row-actions">
          {(["on", "auto", "off"] as const).map((m) => (
            <form action={setRaceMode} key={m}>
              <input type="hidden" name="mode" value={m} />
              <SubmitButton className={`btn ${race.mode === m ? "btn-gold" : "btn-ghost"}`} pending="Switching…">
                {m === "on" ? "Start race now" : m === "auto" ? "Automatic" : "Hide race"}
              </SubmitButton>
            </form>
          ))}
          <form action={setRaceFrozen}>
            <input type="hidden" name="value" value={race.frozen ? "false" : "true"} />
            <SubmitButton pending="Saving…">{race.frozen ? "Unfreeze board" : "Freeze board"}</SubmitButton>
          </form>
        </div>
      </div>

      <div className="box">
        <h2>Results</h2>
        <div className="row-actions" style={{ marginBottom: 14 }}>
          <span style={{ color: "var(--soft)", fontSize: 14 }}>
            Public results page is <b style={{ color: revealed ? "#a9dcb1" : "var(--gold)" }}>{revealed ? "LIVE" : "hidden"}</b>
          </span>
          <form action={setRevealed}>
            <input type="hidden" name="value" value={revealed ? "false" : "true"} />
            <SubmitButton className={`btn ${revealed ? "btn-ghost" : "btn-gold"}`} pending={revealed ? "Hiding…" : "Revealing…"}>
              {revealed ? "Hide results" : "Reveal winners"}
            </SubmitButton>
          </form>
          <a href="/results" style={{ color: "var(--gold)", fontSize: 14 }}>/results</a>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>#</th><th>Contestant</th><th></th><th className="num">Votes</th><th className="num">Payments</th><th className="num">Amount</th></tr>
            </thead>
            <tbody>
              {board.map(({ c, t }, i) => (
                <tr key={c.id}>
                  <td>{i + 1}</td>
                  <td>{c.name}</td>
                  <td style={{ color: "var(--mute)" }}>{c.gender === "f" ? "Lady" : "Gent"}</td>
                  <td className="num"><b>{(t?.votes ?? 0).toLocaleString()}</b></td>
                  <td className="num">{(t?.txns ?? 0).toLocaleString()}</td>
                  <td className="num">{naira((t?.amount_kobo ?? 0) / 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="box">
        <h2>Check a payment</h2>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--mute)" }}>
          For &ldquo;I paid but it didn&rsquo;t count&rdquo;. Paste the FF- reference from their screen or Paystack receipt.
        </p>
        <form action={recheck} className="inline-form">
          <input name="ref" placeholder="FF-XXXXXXXXXXXX" defaultValue={sp.ref ?? ""} />
          <SubmitButton className="btn btn-gold" style={{ minHeight: 46, fontSize: 14 }} pending="Asking Paystack…">Re-check with Paystack</SubmitButton>
        </form>
        <form action={recheckPending} style={{ marginTop: 14 }}>
          <SubmitButton style={{ minHeight: 46, fontSize: 14 }} pending={`Checking ${(pending.count ?? 0).toLocaleString()} pending with Paystack…`}>
            Re-check all pending payments
          </SubmitButton>
        </form>
        {sp.swept && (
          <p style={{ marginTop: 12, fontSize: 14 }}>
            Done{sp.at ? ` at ${sp.at}` : ""}: checked {sp.swept} pending · <b style={{ color: "#a9dcb1" }}>{sp.recovered} recovered</b>
          </p>
        )}
        {sp.state && (
          <p style={{ marginTop: 12, fontSize: 14 }}>
            {sp.ref}: <span className={`tag ${sp.state === "paid" ? "paid" : sp.state === "unknown" ? "failed" : sp.state}`}>{sp.state}</span>
          </p>
        )}
      </div>

      <div className="box">
        <h2>Latest transactions</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Started</th><th>Reference</th><th>Status</th><th>Contestant</th><th className="num">Votes</th><th className="num">Amount</th><th>Email</th><th>Channel</th></tr>
            </thead>
            <tbody>
              {(recent.data ?? []).map((r) => (
                <tr key={r.reference}>
                  <td>{when(r.created_at)}</td>
                  <td style={{ fontFamily: "monospace" }}>{r.reference}</td>
                  <td><span className={`tag ${r.status}`}>{r.status}</span></td>
                  <td>{byId(r.contestant_id)?.name ?? r.contestant_id}</td>
                  <td className="num">{r.votes}</td>
                  <td className="num">{naira(r.amount_kobo / 100)}</td>
                  <td>{r.email}</td>
                  <td>{r.channel ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
