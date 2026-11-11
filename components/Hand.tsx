"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { contestants, Contestant } from "@/lib/contestants";
import Holo from "./Holo";
import PortraitContent from "./Portrait";

/** Desktop hero: a fanned hand of five cards, drawn at random per visit so no contestant is favoured. */
export default function Hand() {
  const [hand, setHand] = useState<Contestant[] | null>(null);

  useEffect(() => {
    const pool = [...contestants];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setHand(pool.slice(0, 5));
  }, []);

  return (
    <div className="hand" aria-label="Some of the contestants">
      {hand?.map((c) => (
        <Link key={c.id} href={`/c/${c.id}`}>
          <Holo className="portrait">
            <PortraitContent c={c} eager />
            <span className="shade" aria-hidden="true" />
            <span className="plate">
              <span className="card-name">{c.name}</span>
              <span className="card-dept">{c.dept}</span>
            </span>
          </Holo>
        </Link>
      ))}
    </div>
  );
}
