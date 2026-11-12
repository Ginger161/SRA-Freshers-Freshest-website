"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

export type RacePhase = "pre" | "race" | "frozen" | "revealed";
export type RaceState = {
  phase: RacePhase;
  top: string[];
  raceAt: number;
  closesAt: number;
  /** server-corrected "now", ticks every second */
  now: number;
  ready: boolean;
};

const Ctx = createContext<RaceState | null>(null);
export const useRace = () => useContext(Ctx);

/** One poller for the whole page; switches phase on the server's clock, not the phone's. */
export default function RaceProvider({ children, raceAt, closesAt }: { children: React.ReactNode; raceAt: number; closesAt: number }) {
  const [s, setS] = useState<Omit<RaceState, "now">>({ phase: "pre", top: [], raceAt, closesAt, ready: false });
  const [now, setNow] = useState(0);
  const offset = useRef(0);
  const phaseRef = useRef<RacePhase>("pre");

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const t0 = Date.now();
        const r = await fetch("/api/race", { cache: "no-store" });
        const j = await r.json();
        const t1 = Date.now();
        offset.current = j.serverNow - (t0 + t1) / 2;
        if (!alive) return;
        phaseRef.current = j.phase;
        setS({ phase: j.phase, top: j.top ?? [], raceAt: j.raceAt, closesAt: j.closesAt, ready: true });
      } catch {}
      if (!alive) return;
      const p = phaseRef.current;
      const sNow = Date.now() + offset.current;
      let wait = p === "race" ? 3000 : p === "revealed" ? 60000 : 15000;
      // wake exactly at the start / the close
      for (const edge of [raceAt, closesAt]) {
        const d = edge - sNow;
        if (d > 0 && d < wait) wait = d + 300;
      }
      timer = setTimeout(() => (document.visibilityState === "visible" ? poll() : (timer = setTimeout(poll, 3000))), wait);
    };
    poll();

    const tick = setInterval(() => setNow(Date.now() + offset.current), 1000);
    setNow(Date.now());
    const vis = () => document.visibilityState === "visible" && poll();
    document.addEventListener("visibilitychange", vis);
    return () => {
      alive = false;
      clearTimeout(timer);
      clearInterval(tick);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [raceAt, closesAt]);

  return <Ctx.Provider value={{ ...s, now }}>{children}</Ctx.Provider>;
}
