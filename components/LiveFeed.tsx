"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Item = { id: string; user: string; at: string };
type Shown = Item & { leaving?: boolean };

const MAX = 5;
const POLL_MS = 6000;
const LIFE_MS = 14000;
const FRESH_ON_LOAD_MS = 10 * 60 * 1000;

const ago = (iso: string, now: number) => {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  return m === 1 ? "1 min ago" : `${m} mins ago`;
};

/** Stack of up to 5 "userXXXX just voted" toasts, fed by real confirmed payments. */
export default function LiveFeed() {
  const pathname = usePathname();
  const [shown, setShown] = useState<Shown[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const push = (items: Item[]) => {
      if (!items.length) return;
      setShown((cur) => [...items, ...cur].slice(0, MAX));
      for (const it of items) {
        timers.push(setTimeout(() => setShown((cur) => cur.map((x) => (x.id === it.id ? { ...x, leaving: true } : x))), LIFE_MS));
        timers.push(setTimeout(() => setShown((cur) => cur.filter((x) => x.id !== it.id)), LIFE_MS + 650));
      }
    };

    const poll = async () => {
      try {
        const r = await fetch("/api/feed", { cache: "no-store" });
        const { items } = (await r.json()) as { items: Item[] };
        if (!alive) return;
        if (seen.current === null) {
          seen.current = new Set(items.map((i) => i.id));
          const fresh = items.filter((i) => Date.now() - new Date(i.at).getTime() < FRESH_ON_LOAD_MS);
          // stagger the initial ones so they arrive like live events
          fresh.slice(0, 3).reverse().forEach((it, k) => timers.push(setTimeout(() => alive && push([it]), 900 + k * 1400)));
          return;
        }
        const fresh = items.filter((i) => !seen.current!.has(i.id));
        fresh.forEach((i) => seen.current!.add(i.id));
        fresh.reverse().forEach((it, k) => timers.push(setTimeout(() => alive && push([it]), k * 700)));
      } catch {
        /* offline — try next tick */
      }
    };

    poll();
    const id = setInterval(() => document.visibilityState === "visible" && poll(), POLL_MS);
    const tick = setInterval(() => setNow(Date.now()), 5000);
    return () => {
      alive = false;
      clearInterval(id);
      clearInterval(tick);
      timers.forEach(clearTimeout);
    };
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="feed" aria-live="polite" aria-label="Recent votes">
      {shown.map((it, i) => (
        <div
          key={it.id}
          className={`toast${it.leaving ? " out" : ""}`}
          style={{
            transform: `translateY(${-i * 46}px) scale(${1 - i * 0.035})`,
            filter: `brightness(${1 - i * 0.13})`,
            zIndex: MAX - i,
          }}
        >
          <span className="dot" aria-hidden="true" />
          <span className="who">
            <b>{it.user}</b> just voted
          </span>
          <time dateTime={it.at}>{ago(it.at, now)}</time>
        </div>
      ))}
    </div>
  );
}
