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
const TOP = 6;

const fmt = (p: number) => (p >= 10 ? Math.round(p).toString() : p >= 1 ? p.toFixed(1).replace(/\.0$/, "") : p > 0 ? "<1" : "0");

const Crown = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 64 44" aria-hidden="true">
    <path d="M4 14 L18 28 L32 6 L46 28 L60 14 L54 40 H10 Z" fill="#E3C489" stroke="#7a5b26" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="4" cy="12" r="3" fill="#F3DFB2" />
    <circle cx="32" cy="4" r="3" fill="#F3DFB2" />
    <circle cx="60" cy="12" r="3" fill="#F3DFB2" />
  </svg>
);

function Breakdown({ title, rows, delay }: { title: string; rows: { id: string; pct: number }[]; delay: number }) {
  const top = rows.slice(0, TOP);
  const rest = rows.slice(TOP);
  const legend = [
    ...top.map((r, i) => ({ name: byId(r.id)!.name, pct: r.pct, color: SHADES[i], pos: String(i + 1) })),
    ...(rest.length ? [{ name: `${rest.length} others`, pct: rest.reduce((s, r) => s + r.pct, 0), color: OTHERS, pos: "" }] : []),
  ];
  let acc = 0;
  const segs = legend.map((l, i) => {
    const len = (l.pct / 100) * C;
    const s = { len: Math.max(0, len - 2), off: -acc, color: l.color, d: delay + 0.2 + i * 0.12 };
    acc += len;
    return s;
  });
  const max = top[0]?.pct || 1;
  return (
    <section className="bd" data-reveal>
      <p className="eyebrow">{title}</p>
      <div className="donut">
        <svg viewBox="0 0 200 200" role="img" aria-label={`${title}: ` + legend.map((l) => `${l.name} ${fmt(l.pct)}%`).join(", ")}>
          <circle cx="100" cy="100" r="70" fill="none" stroke="#1d1912" strokeWidth="22" />
          {segs.map((s, i) => (
            <circle key={i} className="seg" cx="100" cy="100" r="70" fill="none" stroke={s.color} strokeWidth="22" strokeDasharray={`${s.len} ${C}`} strokeDashoffset={s.off} style={{ animationDelay: `${s.d}s` }} />
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
              <div className="bar" style={{ width: `${Math.min(100, (l.pct / max) * 100)}%`, background: l.color, animationDelay: `${delay + 0.3 + i * 0.1}s` }} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default async function Results() {
  let revealed = false;
  let data: Awaited<ReturnType<typeof results>> | null = null;
  try {
    // RESULTS_PREVIEW: local preview only, never set on the live server
    revealed = process.env.RESULTS_PREVIEW === "1" || (await isRevealed());
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

  const ladies = data.byGender.find((x) => x.g === "f")!;
  const gents = data.byGender.find((x) => x.g === "m")!;
  const queen = byId(ladies.rows[0].id)!;
  const king = byId(gents.rows[0].id)!;
  const votes = approx(data.total);
  const voters = approx(data.voters);

  const winners = [
    { c: queen, pct: ladies.rows[0].pct, label: "Freshest Fresher · Lady", cls: "w-a" },
    { c: king, pct: gents.rows[0].pct, label: "Freshest Fresher · Gentleman", cls: "w-b" },
  ];

  return (
    <>
      <Header />
      <main className="reveal">
        <p className="eyebrow">Freshest Fresher 2026/27</p>
        <p className="reveal-script">and the crowns go to</p>

        <div className="duo">
          {winners.map((w, i) => (
            <div key={w.c.id} className={`duo-card ${w.cls}`}>
              <div className="winner">
                <Crown className="winner-crown" />
                <div className="winner-ring">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.c.photo} alt={w.c.name} />
                </div>
              </div>
              <span className="duo-label">{w.label}</span>
              <h2 className="winner-name">{w.c.name}</h2>
              <span className="cdept">{w.c.dept}</span>
              <div className="winner-pct">
                <b>{fmt(w.pct)}%</b>
                <span>of the {i === 0 ? "ladies'" : "gentlemen's"} votes</span>
              </div>
            </div>
          ))}
          <span className="duo-amp" aria-hidden="true">&amp;</span>
        </div>

        <p className="summary" data-reveal>
          {votes.over ? "Over " : ""}
          <b>{votes.n.toLocaleString()} votes</b> came in from {voters.over ? "over " : ""}
          <b>{voters.n.toLocaleString()} voters</b> for <b>{data.candidates} candidates</b>.
        </p>

        <div className="bds">
          <Breakdown title="Ladies" rows={ladies.rows} delay={0} />
          <Breakdown title="Gentlemen" rows={gents.rows} delay={0.2} />
        </div>

        <div style={{ marginTop: 44, width: "100%", maxWidth: 420 }}>
          <ShareButton
            path="/results"
            text={`${queen.name} and ${king.name} are the Freshest Freshers 2026/27`}
            className="btn btn-gold"
            label="Share the result"
          />
        </div>
      </main>
    </>
  );
}
