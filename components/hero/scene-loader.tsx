"use client";

import dynamic from "next/dynamic";
import type { SceneLabel } from "./system-scene";

/**
 * The WebGL scene is a progressive enhancement, so its code is split out of
 * the initial bundle and fetched after hydration. The server-rendered SVG in
 * the hero is what paints first; this overlays it once the engine is running.
 */
const SystemScene = dynamic(
  () => import("./system-scene").then((m) => m.SystemScene),
  { ssr: false },
);

export function SceneLoader({ labels }: { labels: SceneLabel[] }) {
  return <SystemScene labels={labels} />;
}
