"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { contestants } from "@/lib/contestants";
import PortraitContent from "./Portrait";
import Holo from "./Holo";

type Tab = "all" | "m" | "f";
const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: `All · ${contestants.length}` },
  { id: "m", label: `Gentlemen · ${contestants.filter((c) => c.gender === "m").length}` },
  { id: "f", label: `Ladies · ${contestants.filter((c) => c.gender === "f").length}` },
];

export default function ContestantGrid() {
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return contestants.filter(
      (c) =>
        (tab === "all" || c.gender === tab) &&
        (!needle || c.name.toLowerCase().includes(needle) || c.dept.toLowerCase().includes(needle))
    );
  }, [tab, q]);

  const idx = TABS.findIndex((t) => t.id === tab);

  return (
    <>
      <div className="tabs" role="tablist" aria-label="Filter contestants" data-reveal>
        <span className="ind" aria-hidden="true" style={{ transform: `translateX(calc(${idx} * (100% + 4px)))` }} />
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <label className="search" data-reveal style={{ ["--d" as string]: "0.08s" }}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#A89B84" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className="sr-only">Search contestants</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or department" />
      </label>

      <div className="grid" key={tab}>
        {list.map((c, i) => (
          <Link key={c.id} href={`/c/${c.id}`} className="card" style={{ ["--d" as string]: `${Math.min(i, 12) * 0.045}s` }}>
            <Holo className="portrait">
              <PortraitContent c={c} />
              <span className="shade" aria-hidden="true" />
              <span className="no">No. {c.no}</span>
              <span className="plate">
                <span className="card-name">{c.name}</span>
                <span className="card-dept">{c.dept}</span>
              </span>
            </Holo>
          </Link>
        ))}
        {list.length === 0 && <p className="empty">No one matches “{q}”.</p>}
      </div>
    </>
  );
}
