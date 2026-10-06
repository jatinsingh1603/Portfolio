"use client";

import { useEffect, useState } from "react";
import { DetectiveScore } from "@/components/detective-score";

/** Native scroll stays in charge. Only the visible opening scene needs a frame. */
export function CinematicMotion() {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPaused(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".cinematic");
    const hero = document.querySelector<HTMLElement>("#hero-scroll");
    const machine = document.querySelector<HTMLElement>(".reel-machine");
    if (!root || !hero || !machine) return;
    root.dataset.motion = paused ? "paused" : "active";

    const items = root.querySelectorAll<HTMLElement>("[data-film-reveal]");
    let reveals: IntersectionObserver | undefined;
    if (paused) items.forEach((item) => item.classList.add("is-visible"));
    else {
      reveals = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-visible");
            reveals?.unobserve(entry.target);
          }
        },
        { threshold: 0.06 },
      );
      items.forEach((item) => {
        if (!item.classList.contains("is-visible")) reveals?.observe(item);
      });
    }

    const board = root.querySelector<HTMLElement>(".investigation-board");
    const clues = root.querySelectorAll<HTMLElement>("[data-clue]");
    const chapters = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || !board) continue;
          const step =
            (entry.target as HTMLElement).dataset.storyChapter ?? "0";
          board.dataset.storyStep = step;
          clues.forEach((clue) =>
            clue.setAttribute(
              "aria-hidden",
              String(clue.dataset.clue !== step),
            ),
          );
        }
      },
      { rootMargin: "-30% 0px -45% 0px", threshold: 0 },
    );
    root
      .querySelectorAll("[data-story-chapter]")
      .forEach((chapter) => chapters.observe(chapter));

    const sceneName = root.querySelector("[data-scene-name]");
    const sceneIndex = root.querySelector("[data-scene-index]");
    const scenes = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          if (sceneName)
            sceneName.textContent = element.dataset.stationLabel ?? "The story";
          if (sceneIndex)
            sceneIndex.textContent = String(
              element.dataset.station ?? 1,
            ).padStart(2, "0");
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );
    document
      .querySelectorAll("[data-station]")
      .forEach((scene) => scenes.observe(scene));

    let frame = 0;
    let heroVisible = true;
    let previousStep = -1;
    const counter = root.querySelector("[data-reel-counter]");
    const measure = () => {
      frame = 0;
      if (!heroVisible) return;
      const rect = hero.getBoundingClientRect();
      const range = Math.max(1, hero.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / range));
      const step = paused ? 0 : Math.min(2, Math.floor(progress * 3));
      if (step !== previousStep) {
        machine.dataset.step = String(step);
        machine.style.setProperty("--reel-step", String(step));
        if (counter) counter.textContent = `0${step + 1}`;
        previousStep = step;
      }
      hero.style.setProperty(
        "--hero-shift",
        paused ? "0px" : `${progress * -18}px`,
      );
    };
    const onScroll = () => {
      if (heroVisible && !frame) frame = requestAnimationFrame(measure);
    };
    const heroObserver = new IntersectionObserver(([entry]) => {
      heroVisible = !!entry?.isIntersecting;
      if (heroVisible) onScroll();
    });
    heroObserver.observe(hero);
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      reveals?.disconnect();
      chapters.disconnect();
      scenes.disconnect();
      heroObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      delete root.dataset.motion;
    };
  }, [paused]);

  return (
    <>
      <div className="film-scene-label" aria-hidden="true">
        <span data-scene-index>01</span>
        <span data-scene-name>Opening scene</span>
      </div>
      <div
        className="film-controls"
        role="group"
        aria-label="Experience controls"
      >
        <DetectiveScore />
        <button
          id="motion-toggle"
          className="film-motion-toggle"
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
          title={paused ? "Resume visual motion" : "Pause visual motion"}
        >
          <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>
          {paused ? "Motion paused" : "Motion on"}
        </button>
      </div>
    </>
  );
}
