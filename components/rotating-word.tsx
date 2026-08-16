"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";

/**
 * One word in the headline cycles continuously.
 *
 * Design: no pill, no fill, no border, no visible control. The word simply
 * carries the accent colour and cross-fades. The trailing punctuation lives inside the
 * sized slot, otherwise it sits at the far edge of the width reserved for the
 * longest option and visibly detaches from the current word.
 *
 * WCAG 2.2.2 requires a pause mechanism for anything moving automatically for
 * more than five seconds, and this loops indefinitely — so the control is not
 * optional. It is visually hidden until focused, exactly like a skip link:
 * invisible to sighted users, but reachable by keyboard and announced by a
 * screen reader. That satisfies the requirement without putting a button next
 * to the headline. Deleting it outright would be a straight failure.
 *
 * The words are the control types behind actual findings on this page, not job
 * titles.
 */
export function RotatingWord({
  words,
  suffix = "",
  intervalMs = 2600,
}: {
  words: readonly string[];
  suffix?: string;
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced || paused || words.length < 2) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      intervalMs,
    );
    return () => window.clearInterval(id);
  }, [reduced, paused, words.length, intervalMs]);

  // Reduced motion never animates: it renders the canonical word and stays.
  const canonical = words[words.length - 1] ?? "";
  const current = reduced ? canonical : (words[index] ?? canonical);
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span className="relative inline-grid align-baseline">
      {!reduced && words.length > 1 ? (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          /* sr-only until focused, then it appears above the headline rather
             than displacing it. */
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:-top-12 focus-visible:left-0 focus-visible:z-10 focus-visible:inline-flex focus-visible:h-11 focus-visible:items-center focus-visible:gap-2 focus-visible:rounded-full focus-visible:border focus-visible:border-[var(--border-strong)] focus-visible:bg-[var(--bg)] focus-visible:px-4 focus-visible:text-[0.9375rem] focus-visible:font-normal focus-visible:tracking-normal"
        >
          {paused ? (
            <Play size={16} strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Pause size={16} strokeWidth={1.5} aria-hidden="true" />
          )}
          {paused ? "Resume rotating words" : "Pause rotating words"}
        </button>
      ) : null}
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
