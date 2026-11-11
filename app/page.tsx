import Header from "@/components/Header";
import Countdown from "@/components/Countdown";
import ContestantGrid from "@/components/ContestantGrid";
import CountUp from "@/components/CountUp";
import Hand from "@/components/Hand";

const CONFETTI = [
  { l: "6%", d: "0s", t: "9s", x: "40px", c: "#E3C489" },
  { l: "18%", d: "3.1s", t: "11s", x: "-30px", c: "#B8924F" },
  { l: "31%", d: "6.2s", t: "10s", x: "25px", c: "#F4EAD5" },
  { l: "47%", d: "1.4s", t: "12s", x: "-45px", c: "#E3C489" },
  { l: "62%", d: "4.6s", t: "9.5s", x: "35px", c: "#B8924F" },
  { l: "74%", d: "7.7s", t: "11.5s", x: "-20px", c: "#E3C489" },
  { l: "86%", d: "2.3s", t: "10.5s", x: "30px", c: "#F4EAD5" },
  { l: "94%", d: "5.4s", t: "12.5s", x: "-35px", c: "#E3C489" },
];

const perkIcon = {
  ticket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#E3C489" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3z" />
      <path d="M14 6v12" strokeDasharray="2 2" />
    </svg>
  ),
  medal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#E3C489" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="9" r="6" />
      <path d="M8.5 14 7 22l5-3 5 3-1.5-8" />
    </svg>
  ),
  meal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#E3C489" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11h18a9 9 0 0 1-18 0z" />
      <path d="M12 3v4M8 5v2M16 5v2" />
    </svg>
  ),
};

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="confetti" aria-hidden="true">
            {CONFETTI.map((p, i) => (
              <i key={i} style={{ left: p.l, background: p.c, ["--d" as string]: p.d, ["--t" as string]: p.t, ["--x" as string]: p.x }} />
            ))}
          </div>

          <div className="hero-copy">
          <p className="eyebrow rise" style={{ ["--d" as string]: "0.1s" }}>
            Students Representative Assembly presents
          </p>
          <h1 className="title rise" style={{ ["--d" as string]: "0.25s" }}>
            <span className="row">
              <span className="f">F</span>
              <span className="w">RESHEST</span>
            </span>
            <span className="row">
              <span className="f">F</span>
              <span className="w">RESHER</span>
            </span>
          </h1>
          <svg className="flourish rise" style={{ ["--d" as string]: "0.5s" }} viewBox="0 0 220 24" aria-hidden="true">
            <path className="line" d="M86 12 H2" stroke="#B8924F" strokeWidth="1" />
            <path className="line" d="M134 12 H218" stroke="#B8924F" strokeWidth="1" />
            <path d="M110 3 C100 3 94 12 86 12 C94 12 100 21 110 21 C120 21 126 12 134 12 C126 12 120 3 110 3 Z" fill="none" stroke="#E3C489" strokeWidth="1.2" />
            <circle cx="110" cy="12" r="2.6" fill="#E3C489" />
          </svg>
          <p className="tagline rise" style={{ ["--d" as string]: "0.6s" }}>
            Contest 2026/27
          </p>
          <Countdown />
          </div>
          <Hand />
        </section>

        <section className="section wrap" aria-labelledby="prize-h">
          <div className="section-head" data-reveal>
            <p className="eyebrow" id="prize-h">
              What the winner takes home
            </p>
          </div>
          <div className="prize-row">
          <div className="prize" data-reveal>
            <svg className="crown" viewBox="0 0 64 44" aria-hidden="true">
              <path d="M4 14 L18 28 L32 6 L46 28 L60 14 L54 40 H10 Z" fill="rgba(227,196,137,0.12)" stroke="#E3C489" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="4" cy="12" r="3" fill="#E3C489" />
              <circle cx="32" cy="4" r="3" fill="#E3C489" />
              <circle cx="60" cy="12" r="3" fill="#E3C489" />
            </svg>
            <span className="prize-amt">
              <CountUp to={50000} prefix="₦" />
            </span>
            <span className="prize-sub">cash prize</span>
          </div>
          <div className="perks">
            <div className="perk" data-reveal style={{ ["--d" as string]: "0.05s" }}>
              {perkIcon.ticket}
              <div>
                <b>Free access to every SRA event</b>
                <span>All through your 100 level.</span>
              </div>
            </div>
            <div className="perk" data-reveal style={{ ["--d" as string]: "0.12s" }}>
              {perkIcon.medal}
              <div>
                <b>Award presentation</b>
                <span>Special recognition at the SRA Dinner.</span>
              </div>
            </div>
            <div className="perk" data-reveal style={{ ["--d" as string]: "0.19s" }}>
              {perkIcon.meal}
              <div>
                <b>A complimentary day of meals</b>
                <span>Breakfast, lunch and dinner, on the SRA.</span>
              </div>
            </div>
          </div>
          </div>
        </section>

        <section className="section wrap" id="contenders" aria-labelledby="contenders-h">
          <div className="section-head" data-reveal>
            <p className="eyebrow">The contenders</p>
            <h2 className="h2" id="contenders-h">
              Who wears the <em>crown?</em>
            </h2>
          </div>
          <ContestantGrid />
        </section>

        <section className="section wrap" id="how" aria-labelledby="how-h">
          <div className="section-head" data-reveal>
            <h2 className="h2" id="how-h" style={{ fontSize: "clamp(32px, 7vw, 48px)" }}>
              How voting works
            </h2>
          </div>
          <div className="steps">
            {[
              ["Pick your fresher", "Tap anyone above, or open the link they shared."],
              ["Choose how many votes", "Each vote is ₦100. Vote as many times as you like."],
              ["Pay with Paystack", "Card, bank transfer or USSD."],
            ].map(([t, s], i) => (
              <div className="step" key={t} data-reveal style={{ ["--d" as string]: `${i * 0.08}s` }}>
                <span className="step-n">{i + 1}</span>
                <div>
                  <b>{t}</b>
                  <span>{s}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="foot">
        <span className="serif">Organised by the Students Representative Assembly</span>
        <small>Veritas University, Abuja · © 2026 SRA</small>
      </footer>
    </>
  );
}
