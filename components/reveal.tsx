"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

/**
 * The site's entrance animation: opacity 0→1 with a 24px rise (planes also tip
 * back from 6°), fired once when the element leads into view. Hand-rolled: the
 * whole behaviour is ~30 lines and an animation library would be the largest
 * dependency on a page with a 120 KB budget.
 *
 * Reduced motion is handled here and in CSS, so it cannot be forgotten: the
 * observer is skipped and content renders visible immediately.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  style,
}: {
  children: React.ReactNode;
  /** Stagger in ms. Cap groups at 6 — past that, reveal as one unit. */
  delay?: number;
  as?: "div" | "section" | "li" | "tr" | "article" | "figure";
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { threshold: 0.01, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-reveal={shown ? "in" : "out"}
      style={{ ...(delay ? { transitionDelay: `${delay}ms` } : {}), ...style }}
      className={className}
    >
      {children}
    </Tag>
  );
}
