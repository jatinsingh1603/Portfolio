"use client";

import { useEffect } from "react";

/**
 * One client component for every ambient interaction on the page:
 *
 * - reveals: a single IntersectionObserver flips `[data-reveal]` elements
 *   from "out" to "in" the first time they lead into view;
 * - tilt: a delegated pointermove handler rotates `.plane` cards toward the
 *   pointer and moves their specular;
 * - magnetic: `.magnetic` wrappers drift a few pixels toward the pointer.
 *
 * Nothing here runs on touch or under reduced motion, and none of it costs a
 * React boundary per element — which is what keeps hydration cheap on slow
 * devices.
 */
export function Interactions() {
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const targets = document.querySelectorAll<HTMLElement>(
      '[data-reveal="out"]',
    );

    if (reduced) {
      targets.forEach((el) => el.setAttribute("data-reveal", "in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-reveal", "in");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.01, rootMargin: "0px 0px -6% 0px" },
    );
    targets.forEach((el) => observer.observe(el));

    const fine = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    if (!fine) return () => observer.disconnect();

    let plane: HTMLElement | null = null;
    let magnet: HTMLElement | null = null;
    let frame = 0;
    let last: PointerEvent | null = null;

    const resetPlane = () => {
      if (plane)
        plane.style.setProperty("--tilt", "rotateX(0deg) rotateY(0deg)");
      plane = null;
    };
    const resetMagnet = () => {
      if (magnet) magnet.style.transform = "";
      magnet = null;
    };

    const apply = () => {
      frame = 0;
      const e = last;
      if (!e) return;
      const target = e.target instanceof Element ? e.target : null;

      const nextPlane = target?.closest<HTMLElement>(".plane") ?? null;
      if (nextPlane !== plane) resetPlane();
      if (nextPlane) {
        plane = nextPlane;
        const rect = nextPlane.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        nextPlane.style.setProperty("--mx", x.toFixed(3));
        nextPlane.style.setProperty("--my", y.toFixed(3));
        nextPlane.style.setProperty(
          "--tilt",
          `rotateX(${((0.5 - y) * 10).toFixed(2)}deg) rotateY(${((x - 0.5) * 10).toFixed(2)}deg)`,
        );
      }

      const nextMagnet = target?.closest<HTMLElement>(".magnetic") ?? null;
      if (nextMagnet !== magnet) resetMagnet();
      if (nextMagnet) {
        magnet = nextMagnet;
        const rect = nextMagnet.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const clamp = (v: number) => Math.max(-8, Math.min(8, v * 0.22));
        nextMagnet.style.transform = `translate(${clamp(dx).toFixed(1)}px, ${clamp(dy).toFixed(1)}px)`;
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      last = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      resetPlane();
      resetMagnet();
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return null;
}
