"use client";

import { useCallback, useRef } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { prefersReducedMotion } from "./use-reduced-motion";

/**
 * CSS-3D tilt for cards: the element rotates toward the pointer within a
 * perspective, and two custom properties (--mx, --my, 0–1) expose the pointer
 * position so a highlight can follow it in CSS. Costs one transform per move,
 * on the compositor; nothing on touch, nothing under reduced motion.
 */
export function usePointerTilt(maxDeg = 6) {
  const ref = useRef<HTMLElement | null>(null);
  const frame = useRef(0);

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const node = ref.current;
      if (!node || event.pointerType === "touch" || prefersReducedMotion())
        return;
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        node.style.setProperty("--mx", x.toFixed(3));
        node.style.setProperty("--my", y.toFixed(3));
        node.style.setProperty(
          "--tilt",
          `rotateX(${((0.5 - y) * maxDeg * 2).toFixed(2)}deg) rotateY(${((x - 0.5) * maxDeg * 2).toFixed(2)}deg)`,
        );
      });
    },
    [maxDeg],
  );

  const onPointerLeave = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    cancelAnimationFrame(frame.current);
    node.style.setProperty("--tilt", "rotateX(0deg) rotateY(0deg)");
  }, []);

  return {
    ref,
    handlers: { onPointerMove, onPointerLeave },
    style: { "--tilt": "rotateX(0deg) rotateY(0deg)" } as CSSProperties,
  };
}
