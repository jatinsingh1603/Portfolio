"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The site's only entrance animation: opacity 0→1 with a 12px rise, fired once
 * when a section leads into view. Deliberately hand-rolled rather than pulled
 * from a motion library — the whole behaviour is ~20 lines, and the library
 * would cost ~34 KB gzipped against a 120 KB budget that has 20 KB of headroom.
 *
 * Reduced motion is handled here and nowhere else, so it cannot be forgotten:
 * the observer is skipped entirely and content renders visible immediately.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: React.ReactNode;
  /** Stagger index in ms. Cap groups at 5 — past that, reveal as one unit. */
  delay?: number;
  as?: "div" | "section" | "li" | "tr";
  className?: string;
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
        observer.disconnect(); // fires once
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-reveal={shown ? "in" : "out"}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
