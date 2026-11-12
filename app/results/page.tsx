import Header from "@/components/Header";
import ShareButton from "@/components/ShareButton";
import { byId } from "@/lib/contestants";
import { isRevealed } from "@/lib/db";
import { approx, results } from "@/lib/race";

export const dynamic = "force-dynamic";
export const metadata = { title: "Results · Freshest Fresher 2026/27" };

const SHADES = ["#F3DFB2", "#E3C489", "#C9A464", "#B8924F", "#9C7A40", "#7E6333", "#665028"];
const OTHERS = "#4a4236";
const C = 2 * Math.PI * 70;

const fmt = (p: number) => (p >= 10 ? Math.round(p).toString() : p >= 1 ? p.toFixed(1).replace(/\.0$/, "") : p > 0 ? "<1" : "0");

export default async function Results() {
  let revealed = false;
  let data: Awaited<ReturnType<typeof results>> | null = null;
  try {
    revealed = await isRevealed();
    if (revealed) data = await results();
  } catch {}

  if (!revealed || !data || data.total === 0) {
    return (
      <>
        <Header />
        <main className="wrap" style={{ paddingTop: 60 }}>
          <div className="section-head">
            <p className="eyebrow">Freshest Fresher 2026/27</p>
            <h1 className="h2">Results aren&rsquo;t out yet.</h1>
          </div>
        </main>
      </>
    );
  }

  const top = data.rows.slice(0, 7);
  const rest = data.rows.slice(7);
  const restPct = rest.reduce((s, r) => s + r.pct, 0);
  const winner = byId(top[0].id)!;
  const votes = approx(data.total);
  const voters = approx(data.voters);

  const legend = [
    ...top.map((r, i) => ({ name: byId(r.id)!.name, pct: r.pct, color: SHADES[i], pos: String(i + 1) })),
    ...(rest.length ? [{ name: `${rest.length} others`, pct: restPct, color: OTHERS, pos: "" }] : []),
  ];
  let acc = 0;
  const segs = legend.map((l, i) => {
    const len = (l.pct / 100) * C;
    const s = { len: Math.max(0, len - 2), off: -acc, color: l.color, delay: 0.2 + i * 0.15 };
    acc += len;
    return s;
  });
  const maxPct = top[0].pct || 1;

  return (
    <>
      <Header />
      <main className="reveal">
        <p className="eyebrow">Freshest Fresher 2026/27</p>
        <p className="reveal-script">and the crown goes to</p>

        <div className="winner">
          <svg className="winner-crown" viewBox="0 0 64 44" aria-hidden="true">
            <path d="M4 14 L18 28 L32 6 L46 28 L60 14 L54 40 H10 Z" fill="#E3C489" stroke="#7a5b26" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="4" cy="12" r="3" fill="#F3DFB2" />
            <circle cx="32" cy="4" r="3" fill="#F3DFB2" />
            <circle cx="60" cy="12" r="3" fill="#F3DFB2" />
          </svg>
          <div className="winner-ring">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={winner.photo} alt={winner.name} />
          </div>
        </div>
        <h1 className="winner-name">{winner.name}</h1>
        <span className="cdept" style={{ marginTop: 6 }}>{winner.dept}</span>
        <div className="winner-pct">
          <b>{fmt(top[0].pct)}%</b>
          <span>of every vote cast</span>
        </div>

        <p className="summary" data-reveal>
          {votes.over ? "Over " : ""}
          <b>{votes.n.toLocaleString()} votes</b> came in from {voters.over ? "over " : ""}
          <b>{voters.n.toLocaleString()} voters</b> for <b>{data.candidates} candidates</b>.
        </p>

        <div className="share-wrap" data-reveal>
          <div className="donut">
            <svg viewBox="0 0 200 200" role="img" aria-label={legend.map((l) => `${l.name} ${fmt(l.pct)}%`).join(", ")}>
              <circle cx="100" cy="100" r="70" fill="none" stroke="#1d1912" strokeWidth="22" />
              {segs.map((s, i) => (
                <circle
                  key={i}
                  className="seg"
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke={s.color}
                  strokeWidth="22"
                  strokeDasharray={`${s.len} ${C}`}
                  strokeDashoffset={s.off}
                  style={{ animationDelay: `${s.delay}s` }}
                />
              ))}
            </svg>
            <div className="donut-label">
              <small>Share of</small>
              <span>the vote</span>
            </div>
          </div>
          <ol className="shares">
            {legend.map((l, i) => (
              <li key={i}>
                <div className="top">
                  <span className="pos">{l.pos}</span>
                  <span className="key" style={{ background: l.color }} />
                  <span className="nm">{l.name}</span>
                  <span className="pc">{fmt(l.pct)}%</span>
                </div>
                <div className="track">
                  <div className="bar" style={{ width: `${Math.min(100, (l.pct / maxPct) * 100)}%`, background: l.color, animationDelay: `${0.3 + i * 0.12}s` }} />
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div style={{ marginTop: 44, width: "100%", maxWidth: 420 }}>
          <ShareButton path="/results" text={`${winner.name} is the Freshest Fresher 2026/27`} className="btn btn-gold" label="Share the result" />
        </div>
      </main>
    </>
  );
}
