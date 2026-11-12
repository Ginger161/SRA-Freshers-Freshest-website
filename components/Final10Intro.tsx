"use client";

import { useRace } from "./RaceContext";
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
        <p className="f10-line">The top {RACE_SIZE} go live. Help your fresher race to the top.</p>
      </div>
    </section>
  );
}
