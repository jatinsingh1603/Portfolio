"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import type { WorldLabel } from "./world-canvas";

type World = ComponentType<{ labels: WorldLabel[] }>;

/**
 * The world is a progressive enhancement, so not even its code is fetched
 * until there is a person to enhance for: the first scroll or pointer move,
 * or 2.5 s after load, whichever comes first. The page is complete before
 * then and stays complete if the chunk never arrives. Nothing is fetched
 * under reduced motion.
 */
export function WorldLoader({ labels }: { labels: WorldLabel[] }) {
  const [World, setWorld] = useState<World | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    let done = false;
    const load = () => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      window.removeEventListener("scroll", load);
      window.removeEventListener("pointermove", load);
      import("./world-canvas")
        .then((m) => setWorld(() => m.WorldCanvas))
        .catch(() => {
          /* The page stands on its own. */
        });
    };
    const arm = () => {
      window.addEventListener("scroll", load, { passive: true, once: true });
      window.addEventListener("pointermove", load, {
        passive: true,
        once: true,
      });
      timer = window.setTimeout(load, 2500);
    };
    let onLoad: (() => void) | null = null;
    if (document.readyState === "complete") arm();
    else {
      onLoad = () => arm();
      window.addEventListener("load", onLoad, { once: true });
    }
    return () => {
      done = true;
      window.clearTimeout(timer);
      if (onLoad) window.removeEventListener("load", onLoad);
      window.removeEventListener("scroll", load);
      window.removeEventListener("pointermove", load);
    };
  }, []);

  return World ? <World labels={labels} /> : null;
}
