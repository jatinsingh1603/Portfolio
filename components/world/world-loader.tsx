"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import type { WorldLabel } from "./world-canvas";

type World = ComponentType<{ labels: WorldLabel[] }>;

/**
 * The world is a progressive enhancement, so not even its code is fetched
 * until there is a person to enhance for: the first scroll, pointer move,
 * touch or key press after load. It starts the moment someone starts
 * exploring, never on a timer — an automated audit or a visitor who only
 * reads the hero gets the complete page as delivered, with the static image.
 * Nothing is fetched under reduced motion.
 */
export function WorldLoader({ labels }: { labels: WorldLabel[] }) {
  const [World, setWorld] = useState<World | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const events = ["scroll", "pointermove", "touchstart", "keydown"] as const;
    let done = false;
    const off = () => {
      for (const e of events) window.removeEventListener(e, load);
    };
    const load = () => {
      if (done) return;
      done = true;
      off();
      import("./world-canvas")
        .then((m) => setWorld(() => m.WorldCanvas))
        .catch(() => {
          /* The page stands on its own. */
        });
    };
    const arm = () => {
      for (const e of events)
        window.addEventListener(e, load, { passive: true, once: true });
    };
    let onLoad: (() => void) | null = null;
    if (document.readyState === "complete") arm();
    else {
      onLoad = () => arm();
      window.addEventListener("load", onLoad, { once: true });
    }
    return () => {
      done = true;
      if (onLoad) window.removeEventListener("load", onLoad);
      off();
    };
  }, []);

  return World ? <World labels={labels} /> : null;
}
