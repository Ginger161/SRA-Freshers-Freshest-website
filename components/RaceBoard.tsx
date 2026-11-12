"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { contestants } from "@/lib/contestants";
import { RACE_MINUTES, RACE_SIZE } from "@/lib/config";
import { useRace } from "./RaceContext";
import { clock } from "./RaceBanner";

const Crown = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 44" aria-hidden="true">
    <path d="M4 14 L18 28 L32 6 L46 28 L60 14 L54 40 H10 Z" fill="#E3C489" stroke="#7a5b26" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

/** Live top-7 board. Positions only: every contestant has a fixed row that glides to its rank. */
export default function RaceBoard() {
  const r = useRace();
  const prev = useRef<Map<string, number> | null>(null);
  const [climbed, setClimbed] = useState<Record<string, { at: number; gain: number }>>({});
  const key = r?.top.join("|") ?? "";

  useEffect(() => {
    if (!r) return;
    const nowRank = new Map(r.top.map((id, i) => [id, i]));
    if (prev.current) {
      const next: Record<string, { at: number; gain: number }> = {};
      nowRank.forEach((i, id) => {
        const was = prev.current!.get(id) ?? RACE_SIZE;
        if (i < was) next[id] = { at: Date.now(), gain: was - i };
      });
      if (Object.keys(next).length) setClimbed((c) => ({ ...c, ...next }));
    }
    prev.current = nowRank;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!r || (r.phase !== "race" && r.phase !== "frozen")) return null;
  const live = r.phase === "race";
  const rank = new Map(r.top.map((id, i) => [id, i]));
  const t = Date.now();
  const left = r.closesAt - r.now;

  return (
    <section id="race" className={`race${live ? " is-live" : " is-frozen"}${live && left < 60000 ? " last-minute" : ""}`} aria-label="The final race">
      <div className="race-head">
        {live ? (
          <span className="race-live">
            <i />
            Live
          </span>
        ) : (
          <span className="race-closed">Voting closed</span>
        )}
        <h2 className="race-title">
          The <span>Final</span> <br className="desk-br" />
          {RACE_MINUTES}<em className="race-title-sub"> minutes</em>
        </h2>
        {live ? (
          <div className="race-clock" aria-live="off">
            {r.now ? clock(left) : "--:--"}
          </div>
        ) : null}
        {live && (
          <a href="#contenders" className="btn btn-gold race-cta">
            Push your fresher up
          </a>
        )}
      </div>

      <ol className="race-list" style={{ ["--n" as string]: RACE_SIZE }}>
        {contestants.map((c) => {
          const i = rank.get(c.id);
          const on = i !== undefined;
          const cl = climbed[c.id];
          const fresh = on && live && cl && t - cl.at < 2600;
          return (
            <li
              key={c.id}
              className={`race-row${on ? " on" : ""}${i === 0 ? " lead" : ""}${fresh ? " up" : ""}`}
              style={{ ["--i" as string]: on ? i : RACE_SIZE }}
              aria-hidden={!on}
            >
              <span className="race-rank">{on ? i + 1 : ""}</span>
              <span className="race-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.photoSm ?? c.photo} alt="" loading="lazy" />
                {i === 0 && <Crown className="race-crown" />}
              </span>
              <span className="race-name">
                <b>{c.name}</b>
                <small>{c.dept}</small>
              </span>
              {fresh && <span className="race-chip">▲{cl.gain}</span>}
              {live && (
                <Link href={`/c/${c.id}`} className="race-vote" tabIndex={on ? 0 : -1}>
                  Vote
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
