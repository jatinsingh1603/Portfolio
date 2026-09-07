"use client";

import { useCallback, useRef } from "react";
import type { PointerEvent } from "react";
import { prefersReducedMotion } from "./use-reduced-motion";

/**
 * Magnetic buttons: the control drifts a few pixels toward the pointer while
 * hovered and springs back on leave. Strength is a fraction of the offset,
 * capped so the label never leaves the hit area.
 */
export function useMagnetic(strength = 0.25, cap = 10) {
  const ref = useRef<HTMLElement | null>(null);
  const frame = useRef(0);

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const node = ref.current;
      if (!node || event.pointerType === "touch" || prefersReducedMotion())
        return;
      const rect = node.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const clamp = (v: number) => Math.max(-cap, Math.min(cap, v * strength));
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        node.style.transform = `translate(${clamp(dx).toFixed(1)}px, ${clamp(dy).toFixed(1)}px)`;
      });
    },
    [strength, cap],
  );

  const onPointerLeave = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    cancelAnimationFrame(frame.current);
    node.style.transform = "";
  }, []);

  return { ref, handlers: { onPointerMove, onPointerLeave } };
}
