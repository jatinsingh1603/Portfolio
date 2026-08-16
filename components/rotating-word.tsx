"use client";

import { useEffect, useState } from "react";

/**
 * One word in the headline cycles once, then settles for good.
 *
 * Design: no pill, no fill, no border, no control. The word simply carries the
 * accent colour and cross-fades. The trailing punctuation lives inside the
 * sized slot, otherwise it sits at the far edge of the width reserved for the
 * longest option and visibly detaches from the current word.
 *
 * Why it stops instead of looping: WCAG 2.2.2 requires a pause mechanism for
 * anything that moves automatically for more than five seconds. A visible
 * pause button next to a headline is clutter, so the motion is made finite
 * instead — the whole sequence runs in under five seconds and ends on the
 * canonical word, which puts it inside the exception rather than needing a
 * control to satisfy it. Indefinite looping here would be an accessibility
 * failure, not a style choice.
 *
 * The words are the control types behind actual findings on this page, not job
 * titles.
 */
export function RotatingWord({
  words,
  suffix = "",
  intervalMs = 1600,
}: {
  /** Last entry is where it settles, so put the canonical word last. */
  words: readonly string[];
  suffix?: string;
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced || words.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => {
        const next = i + 1;
        if (next >= words.length - 1) window.clearInterval(id);
        return Math.min(next, words.length - 1);
      });
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [reduced, words.length, intervalMs]);

  // Reduced motion never animates: it renders the settled word immediately.
  const settled = words[words.length - 1] ?? "";
  const current = reduced ? settled : (words[index] ?? settled);
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span className="relative inline-grid align-baseline">
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {longest}
        {suffix}
      </span>
      <span className="col-start-1 row-start-1 text-left">
        <span key={current} className="word-swap inline-block">
          <span className="text-[var(--accent)]">{current}</span>
          {suffix}
        </span>
      </span>
    </span>
  );
}
