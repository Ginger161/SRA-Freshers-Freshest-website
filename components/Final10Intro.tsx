"use client";

import { useRace } from "./RaceContext";
import { clock } from "./RaceBanner";
import { RACE_MINUTES, RACE_SIZE } from "@/lib/config";

const at = (t: number) =>
  new Date(t).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Lagos" });

/** Tells people what happens at the Final 10, before it starts. */
export default function Final10Intro() {
  const r = useRace();
  if (!r || !r.ready || r.phase !== "pre" || r.raceAt <= r.now) return null;
  return (
    <section id="final10" className="section wrap">
      <div className="f10" data-reveal>
        <p className="eyebrow">At {at(r.raceAt)}</p>
        <h2 className="h2">
          The <em>Final</em> {RACE_MINUTES}
        </h2>
        <div className="f10-clock">{r.now ? clock(r.raceAt - r.now) : "--:--"}</div>
        <ol className="f10-steps">
          <li>
            <b>The top {RACE_SIZE} go live</b>
            <span>For the last {RACE_MINUTES} minutes the leaderboard opens. Positions only, no vote counts.</span>
          </li>
          <li>
            <b>Every vote moves the board</b>
            <span>Cards overtake each other as votes land. Push your fresher up.</span>
          </li>
          <li>
            <b>{at(r.closesAt)}: the board freezes</b>
            <span>Votes paid before {at(r.closesAt)} count. The winner is revealed once every payment is verified.</span>
          </li>
        </ol>
      </div>
    </section>
  );
}
