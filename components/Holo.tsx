"use client";

import { useRef } from "react";

/**
 * Gold-foil card surface. Follows the page light (--lx/--ly, driven by phone tilt or mouse);
 * on desktop the card under the cursor takes its own local light instead.
 */
export default function Holo({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--cx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    el.style.setProperty("--cy", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    el.classList.add("hot");
  };
  const leave = () => {
    const el = ref.current!;
    el.style.removeProperty("--cx");
    el.style.removeProperty("--cy");
    el.classList.remove("hot");
  };

  return (
    <div ref={ref} className={`holo ${className}`} onPointerMove={move} onPointerLeave={leave}>
      {children}
      <span className="holo-foil" aria-hidden="true" />
      <span className="holo-glare" aria-hidden="true" />
      <span className="holo-edge" aria-hidden="true" />
    </div>
  );
}
