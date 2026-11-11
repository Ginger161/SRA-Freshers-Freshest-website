"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * One light source for the whole page.
 * Pointer (desktop) or device tilt (phones) → --lx / --ly on <html>, both in -1..1, smoothed.
 * Spotlight beams, the dust, the headline foil and every card's sheen read these.
 */
export default function Ambient() {
  const pathname = usePathname();
  const dust = useRef<HTMLCanvasElement>(null);
  const rail = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    if (reduce) return;

    const lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4) });

    // target + current light position
    let tx = 0, ty = -0.2, cx = 0, cy = -0.2, wx = 99, wy = 99, lastP = -1;
    let gyro = false;

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || gyro) return;
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    let base: { b: number; g: number } | null = null;
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      gyro = true;
      if (!base) base = { b: e.beta, g: e.gamma };
      // drift the neutral point slowly so it follows how the phone is held
      base.b += (e.beta - base.b) * 0.004;
      base.g += (e.gamma - base.g) * 0.004;
      tx = Math.max(-1, Math.min(1, (e.gamma - base.g) / 22));
      ty = Math.max(-1, Math.min(1, (e.beta - base.b) / 22));
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("deviceorientation", onTilt, { passive: true });

    // iOS asks permission for motion; ask on the first tap
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    const askIOS = () => {
      DOE?.requestPermission?.().catch(() => {});
      window.removeEventListener("touchend", askIOS);
    };
    if (typeof DOE?.requestPermission === "function") window.addEventListener("touchend", askIOS, { once: true });

    // gold dust
    const cv = dust.current!;
    const ctx = cv.getContext("2d")!;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const N = window.innerWidth < 700 ? 34 : 60;
    let W = 0, H = 0;
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const motes = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.25 + Math.random() * 0.75, // depth: near motes are bigger, faster, shift more with tilt
      s: Math.random() * Math.PI * 2,
    }));

    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      lenis.raf(t);
      const dt = Math.min(50, t - last) / 1000;
      last = t;

      // only restyle when the light has actually moved (idle pages cost nothing)
      const nx = cx + (tx - cx) * 0.07;
      const ny = cy + (ty - cy) * 0.07;
      if (Math.abs(nx - wx) > 0.004 || Math.abs(ny - wy) > 0.004) {
        wx = nx;
        wy = ny;
        root.style.setProperty("--lx", nx.toFixed(3));
        root.style.setProperty("--ly", ny.toFixed(3));
      }
      cx = nx;
      cy = ny;

      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (Math.abs(p - lastP) > 0.001 && rail.current) {
        lastP = p;
        rail.current.style.transform = `scaleY(${p.toFixed(4)})`;
      }

      ctx.clearRect(0, 0, W, H);
      for (const m of motes) {
        m.y -= dt * 0.012 * m.z;
        m.s += dt * 0.6;
        if (m.y < -0.05) {
          m.y = 1.05;
          m.x = Math.random();
        }
        const x = (m.x + Math.sin(m.s) * 0.01 - cx * 0.03 * m.z) * W;
        const y = (m.y - cy * 0.02 * m.z) * H;
        const r = 0.6 + m.z * 1.9;
        const a = (0.25 + 0.55 * m.z) * (0.6 + 0.4 * Math.sin(m.s * 1.7));
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
        g.addColorStop(0, `rgba(243,223,178,${a})`);
        g.addColorStop(1, "rgba(227,196,137,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const vis = () => {
      cancelAnimationFrame(raf);
      if (document.visibilityState === "visible") {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", vis);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onTilt);
      window.removeEventListener("resize", resize);
      window.removeEventListener("touchend", askIOS);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    const scan = () => document.querySelectorAll("[data-reveal]:not(.in)").forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return (
    <div className="stage" aria-hidden="true">
      <div className="deco" />
      <div className="beam beam-l" />
      <div className="beam beam-r" />
      <div className="beam beam-c" />
      <div className="spotlight" />
      <canvas ref={dust} className="dust" />
      <div className="vignette" />
      <div className="grain" />
      <div className="rail">
        <i ref={rail} />
      </div>
    </div>
  );
}
