import Header from "@/components/Header";
import { contestants } from "@/lib/contestants";
import { isRevealed, tally } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Results · Freshest Fresher 2026/27" };

export default async function Results() {
  let revealed = false;
  let rows: Awaited<ReturnType<typeof tally>> = [];
  try {
    revealed = await isRevealed();
    if (revealed) rows = await tally();
  } catch {}

  const votes = new Map(rows.map((r) => [r.contestant_id, r.votes]));
  const ranked = (g: "m" | "f") =>
    contestants
      .filter((c) => c.gender === g)
      .map((c) => ({ c, v: votes.get(c.id) ?? 0 }))
      .sort((a, b) => b.v - a.v);

  return (
    <>
      <Header />
      <main className="wrap" style={{ paddingTop: 40 }}>
        <div className="section-head">
          <p className="eyebrow">Freshest Fresher 2026/27</p>
          <h1 className="h2">{revealed ? <>The <em>results</em></> : "Results aren’t out yet."}</h1>
        </div>
        {revealed && (
          <div className="results">
            {(["f", "m"] as const).map((g) => (
              <section key={g} data-reveal>
                <p className="eyebrow" style={{ marginBottom: 12 }}>
                  {g === "f" ? "Ladies" : "Gentlemen"}
                </p>
                {ranked(g).map(({ c, v }, i) => (
                  <div className="rank" key={c.id}>
                    <span className="pos">{i + 1}</span>
                    <span className="nm">
                      <b>{c.name}</b>
                      <span>{c.dept}</span>
                    </span>
                    <span className="v">{v.toLocaleString()}</span>
                  </div>
                ))}
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
