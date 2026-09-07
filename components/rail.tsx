"use client";

import { useEffect, useState } from "react";
import { STATION_COUNT } from "@/lib/stations";

/**
 * The depth gauge. On wide screens a fixed left rail with eleven ticks and an
 * accent fill that advances with scroll; everywhere a 2px progress bar. It
 * also publishes two custom properties the stylesheet reads: --progress and
 * --zone (the current station's hue, mixed faintly into the ground).
 *
 * Purely presentational: aria-hidden, one passive scroll listener, one rAF.
 */
export function Rail() {
  const [current, setCurrent] = useState<{ index: number; label: string }>({
    index: 1,
    label: "",
  });

  useEffect(() => {
    const root = document.documentElement;
    const stations = () =>
      [...document.querySelectorAll<HTMLElement>("[data-station]")].sort(
        (a, b) => Number(a.dataset.station) - Number(b.dataset.station),
      );
    let frame = 0;
    let lastIndex = 0;

    const measure = () => {
      frame = 0;
      const max = root.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      root.style.setProperty("--progress", progress.toFixed(4));

      const line = window.innerHeight * 0.42;
      let active: HTMLElement | null = null;
      for (const s of stations()) {
        if (s.getBoundingClientRect().top <= line) active = s;
      }
      const index = active ? Number(active.dataset.station) : 1;
      if (index !== lastIndex) {
        lastIndex = index;
        setCurrent({ index, label: active?.dataset.stationLabel ?? "" });
        root.style.setProperty(
          "--zone",
          active?.dataset.zone === "amber"
            ? "var(--accent-2)"
            : "var(--accent)",
        );
      }
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
  }, []);

  const ticks = Array.from({ length: STATION_COUNT }, (_, i) => i + 1);

  return (
    <>
      <div className="progress-bar" aria-hidden="true" />
      <aside className="rail" aria-hidden="true">
        <div className="rail__track">
          <div className="rail__fill" />
          {ticks.map((n) => (
            <div
              key={n}
              className="rail__tick"
              aria-current={n === current.index ? "true" : undefined}
              style={{ top: `${((n - 1) / (STATION_COUNT - 1)) * 100}%` }}
            >
              {String(n).padStart(2, "0")}
            </div>
          ))}
        </div>
      </aside>
      <div
        className="t-label pointer-events-none fixed top-[64px] right-[var(--gutter)] z-30 hidden [@media(max-width:1023px)]:block"
        aria-hidden="true"
      >
        {String(current.index).padStart(2, "0")} / {STATION_COUNT}
        {current.label ? ` · ${current.label}` : ""}
      </div>
    </>
  );
}
