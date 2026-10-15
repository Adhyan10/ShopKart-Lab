import { useEffect } from "react";

const TILT_SELECTOR = ".card, .hero-card";
const MAX_TILT_DEG = 9;

const clamp = (n) => Math.max(-1, Math.min(1, n));

// Feeds pointer position into CSS variables. All the visuals live in CSS:
//   --px/--py  pointer offset from screen centre (-1..1)  -> hero parallax layers
//   --gx/--gy  pointer position in px                      -> ambient light
//   --rx/--ry/--mx/--my on a hovered card                   -> tilt and glare
// Skipped on touch screens and for people who prefer reduced motion.
export default function useSpatial() {
  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || calm) return undefined;

    const root = document.documentElement;
    let frame = 0;
    let tilted = null;

    const resetTilt = (el) => ["--rx", "--ry", "--mx", "--my"].forEach((v) => el.style.removeProperty(v));

    const onMove = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        root.style.setProperty("--gx", `${e.clientX}px`);
        root.style.setProperty("--gy", `${e.clientY}px`);
        root.style.setProperty("--px", clamp((e.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
        root.style.setProperty("--py", clamp((e.clientY / window.innerHeight - 0.5) * 2).toFixed(3));

        const el = e.target instanceof Element ? e.target.closest(TILT_SELECTOR) : null;
        if (tilted && tilted !== el) resetTilt(tilted);
        tilted = el;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        el.style.setProperty("--rx", `${((0.5 - y) * MAX_TILT_DEG).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${((x - 0.5) * MAX_TILT_DEG).toFixed(2)}deg`);
        el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
        el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
      });
    };

    const onLeave = () => {
      if (tilted) resetTilt(tilted);
      tilted = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);
}
