"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";

/**
 * 0 when the element's top reaches the viewport bottom, 1 when its bottom
 * leaves the viewport top. Passive scroll listener, one rAF per frame at most.
 * Drives the hero camera and the section progress rail.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  enabled = true,
): number {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const total = rect.height + window.innerHeight;
      const passed = window.innerHeight - rect.top;
      setProgress(Math.min(1, Math.max(0, passed / total)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, enabled]);
  return progress;
}
