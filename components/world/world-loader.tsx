"use client";

import dynamic from "next/dynamic";
import type { WorldLabel } from "./world-canvas";

/**
 * The world is a progressive enhancement, so its code is split out of the
 * initial bundle and fetched after hydration. The page is complete before it
 * arrives and stays complete if it never does.
 */
const WorldCanvas = dynamic(
  () => import("./world-canvas").then((m) => m.WorldCanvas),
  { ssr: false },
);

export function WorldLoader({ labels }: { labels: WorldLabel[] }) {
  return <WorldCanvas labels={labels} />;
}
