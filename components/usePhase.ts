"use client";

import { useEffect, useState } from "react";
import { phaseAt, Phase } from "@/lib/config";

/** Current time (ticks every second after mount) and voting phase. `now` is null before hydration. */
export function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function usePhase(): { now: number | null; phase: Phase | null } {
  const now = useNow();
  return { now, phase: now === null ? null : phaseAt(now) };
}
