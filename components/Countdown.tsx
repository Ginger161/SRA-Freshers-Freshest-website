"use client";

import { CLOSES_AT, OPENS_AT, PRICE_NAIRA } from "@/lib/config";
import { usePhase } from "./usePhase";

const fmtDay = (d: Date) =>
  d.toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Lagos",
  });

const pad = (n: number) => String(n).padStart(2, "0");

export default function Countdown() {
  const { now, phase } = usePhase();

  const target = phase === "soon" ? OPENS_AT : CLOSES_AT;
  const left = now === null ? null : Math.max(0, target.getTime() - now);
  const d = left === null ? 0 : Math.floor(left / 86400000);
  const h = left === null ? 0 : Math.floor((left % 86400000) / 3600000);
  const m = left === null ? 0 : Math.floor((left % 3600000) / 60000);
  const s = left === null ? 0 : Math.floor((left % 60000) / 1000);

  const cells =
    d > 0
      ? [[d, "days"], [h, "hours"], [m, "minutes"], [s, "seconds"]]
      : [[h, "hours"], [m, "minutes"], [s, "seconds"]];

  const label = phase === "soon" ? "Voting opens in" : phase === "closed" ? "Voting has closed" : "Voting closes in";

  return (
    <>
      <div className="clock rise" style={{ ["--d" as string]: "0.75s" }}>
        <p className="eyebrow">{label}</p>
        {phase !== "closed" && (
          <div className="clock-grid" style={{ ["--n" as string]: cells.length }}>
            {cells.map(([v, u]) => (
              <div className="clock-cell" key={u as string}>
                <span className="clock-num">
                  <span key={`${u}-${v}`}>{left === null ? "--" : pad(v as number)}</span>
                </span>
                <span className="clock-unit">{u}</span>
              </div>
            ))}
          </div>
        )}
        <span className="clock-foot">{fmtDay(phase === "soon" ? OPENS_AT : CLOSES_AT)}</span>
      </div>

      {phase === "closed" ? (
        <a href="/results" className="btn btn-ghost rise" style={{ ["--d" as string]: "0.9s" }}>
          See the results
        </a>
      ) : (
        <a href="#contenders" className="btn btn-gold rise" style={{ ["--d" as string]: "0.9s" }}>
          Cast your vote <span className="sub">· ₦{PRICE_NAIRA} per vote</span>
        </a>
      )}
    </>
  );
}
