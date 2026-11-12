"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRace } from "./RaceContext";
import { RACE_MINUTES } from "@/lib/config";

const pad = (n: number) => String(n).padStart(2, "0");
export const clock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
};
const at = (t: number) =>
  new Date(t).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Lagos" });

export default function RaceBanner() {
  const r = useRace();
  const path = usePathname();
  if (!r || !r.ready || !r.now || path.startsWith("/admin")) return null;

  const toStart = r.raceAt - r.now;
  const toClose = r.closesAt - r.now;

  if (r.phase === "pre") {
    if (toClose <= 0 || toStart <= 0) return null;
    const soon = toStart <= 5 * 60 * 1000;
    return (
      <Link href="/#final10" className={`rbanner${soon ? " soon" : ""}`}>
        <span className="rb-tag">{soon ? "Starting soon" : `The Final ${RACE_MINUTES}`}</span>
        <span className="rb-text">
          Top 7 go live at {at(r.raceAt)}
        </span>
      </Link>
    );
  }
  if (r.phase === "race") {
    return (
      <Link href="/#race" className="rbanner live">
        <span className="rb-tag">
          <i />
          Live
        </span>
        <span className="rb-text">The Final {RACE_MINUTES} is on</span>
      </Link>
    );
  }
  if (r.phase === "frozen") {
    return (
      <Link href="/#race" className="rbanner">
        <span className="rb-tag">Voting closed</span>
      </Link>
    );
  }
  return (
    <Link href="/results" className="rbanner win">
      <span className="rb-tag">The winner is in</span>
      <span className="rb-text">See the results</span>
    </Link>
  );
}
