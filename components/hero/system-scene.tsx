"use client";

import { useEffect, useRef, useState } from "react";
import { Engine, tokenColor } from "@/lib/gl/engine";
import type { DrawBatch } from "@/lib/gl/engine";
import {
  alongSpine,
  defaultCamera,
  dust,
  matrices,
  project,
  spine,
  stations,
  worldEdges,
  worldNodes,
} from "@/lib/gl/topology";
import type { Tone, Vec3 } from "@/lib/gl/topology";

/** Point sizes are specified in CSS px at this depth; the shader divides by depth. */
const REF_DEPTH = 8;
const px = (size: number) => size * REF_DEPTH;

type Rgb = [number, number, number];
type Tones = Record<Tone, Rgb>;

function readTones(): Tones {
  return {
    steel: tokenColor("--text-tertiary"),
    accent: tokenColor("--accent"),
    accent2: tokenColor("--accent-2"),
    low: tokenColor("--sev-low"),
    bright: tokenColor("--accent-hover"),
  };
}

function buildStatic(tones: Tones, lite: boolean) {
  const pos: number[] = [];
  const col: number[] = [];
  const size: number[] = [];
  const dir: number[] = [];
  const lpos: number[] = [];
  const lcol: number[] = [];
  const ldir: number[] = [];

  const point = (p: Vec3, c: Rgb, a: number, s: number, d: Vec3) => {
    pos.push(p[0], p[1], p[2]);
    col.push(c[0], c[1], c[2], a);
    size.push(px(s));
    dir.push(d[0], d[1], d[2]);
  };
  const line = (a: Vec3, b: Vec3, c: Rgb, alpha: number, d: Vec3) => {
    lpos.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    lcol.push(c[0], c[1], c[2], alpha, c[0], c[1], c[2], alpha);
    ldir.push(d[0], d[1], d[2], d[0], d[1], d[2]);
  };
  const still: Vec3 = [0, 0, 0];

  // Spine: a two-line bundle so it reads as a pipeline rather than a hair.
  // It does not explode — the stations slide off it.
  const curve = spine(12);
  for (let i = 0; i < curve.length - 1; i++) {
    const a = curve[i] as Vec3;
    const b = curve[i + 1] as Vec3;
    line(a, b, tones.steel, 0.5, still);
    line(
      [a[0], a[1] - 0.04, a[2]],
      [b[0], b[1] - 0.04, b[2]],
      tones.steel,
      0.22,
      still,
    );
  }

  for (const s of stations) {
    const c = tones[s.tone];
    point(s.center, c, 0.9, s.tone === "bright" ? 7 : 5.5, s.explode);
    const edges = worldEdges(s);
    // Phones draw every other edge of the denser solids.
    edges.forEach((e, i) => {
      if (lite && edges.length > 40 && i % 2) return;
      line(e[0], e[1], c, s.tone === "steel" ? 0.55 : 0.42, s.explode);
    });
    if (!lite) for (const n of worldNodes(s)) point(n, c, 0.85, 2.6, s.explode);
  }

  for (const d of dust(lite ? 24 : 90)) point(d, tones.steel, 0.28, 1.4, still);

  const points: DrawBatch = {
    positions: new Float32Array(pos),
    colors: new Float32Array(col),
    sizes: new Float32Array(size),
    dirs: new Float32Array(dir),
    count: size.length,
  };
  const lines: DrawBatch = {
    positions: new Float32Array(lpos),
    colors: new Float32Array(lcol),
    dirs: new Float32Array(ldir),
    count: lpos.length / 3,
  };
  return { points, lines, curve };
}

/**
 * The hero's WebGL scene. Boots after first paint on an idle callback, fades in
 * over the server-rendered SVG, pauses off-screen and on hidden tabs, and is
 * skipped entirely under reduced motion or without WebGL. Five DOM labels are
 * projected through the same camera every frame so the station names stay real
 * text. Scrolling dollies the camera forward and explodes the assembly.
 */
export type SceneLabel = { id: string; label: string };

export function SystemScene({
  labels,
  className = "",
}: {
  /** Station labels in flow order, passed from the server so no content module ships to the browser. */
  labels: SceneLabel[];
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    // The server-rendered SVG is a sibling; the parent carries the crossfade.
    wrapRef.current?.parentElement?.classList.toggle("is-live", live);
  }, [live]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lite = window.matchMedia(
      "(max-width: 767px), (pointer: coarse)",
    ).matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    let engine: Engine | null = null;
    let raf = 0;
    let running = false;
    let visible = true;
    let frameToggle = false;
    let tones = readTones();
    let scene = buildStatic(tones, lite);
    const packetCount = lite ? 3 : 6;
    const packets = Array.from({ length: packetCount }, (_, i) => ({
      u: i / packetCount,
      speed: 0.07 + (i % 3) * 0.012,
    }));
    const packetBatch: DrawBatch = {
      positions: new Float32Array(packetCount * 3),
      colors: new Float32Array(packetCount * 4),
      sizes: new Float32Array(packetCount).fill(px(4.4)),
      count: packetCount,
    };

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let scroll = 0;
    let last = 0;
    let gateFlash = 0;

    const onPointer = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const onLeave = () => {
      pointer.tx = 0;
      pointer.ty = 0;
    };
    const onScroll = () => {
      const r = wrap.getBoundingClientRect();
      scroll = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
    };

    const frame = (now: number) => {
      raf = 0;
      if (!engine || engine.lost || !running) return;
      if (lite) {
        // 30 fps is plenty for a slow drift and halves the GPU time on phones.
        frameToggle = !frameToggle;
        if (frameToggle) {
          raf = requestAnimationFrame(frame);
          return;
        }
      }
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const t = now / 1000;

      engine.resize();
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      const cam = {
        ...defaultCamera,
        yaw:
          defaultCamera.yaw +
          Math.sin((t / 14) * Math.PI * 2) * 0.11 +
          pointer.x * 0.07,
        pitch:
          defaultCamera.pitch +
          Math.sin((t / 19) * Math.PI * 2) * 0.045 +
          pointer.y * 0.05,
        dolly: scroll * 3.4,
      };
      const { mv, mvp } = matrices(cam, engine.aspect);
      const fog: [number, number] = [4 - scroll * 2.5, 15 - scroll * 5];
      const explode = scroll * scroll * 2.2;

      engine.clear();
      engine.drawLines(scene.lines, mvp, mv, fog, explode);
      engine.drawPoints(scene.points, mvp, mv, fog, false, explode);

      // Packets: data moving USER → RESULT. They stall at the SECURITY gate —
      // the authorisation control — flash it, and take the amber reasoning
      // tone through the AI ENGINE before landing on the RESULT sheet.
      const gateU = 0.25;
      gateFlash = Math.max(0, gateFlash - dt * 2.5);
      packets.forEach((p, i) => {
        const nearGate = Math.abs(p.u - gateU) < 0.04;
        const before = p.u;
        p.u += dt * p.speed * (nearGate ? 0.3 : 1);
        if (before < gateU && p.u >= gateU) gateFlash = 1;
        if (p.u > 1) p.u -= 1;
        const pos = alongSpine(scene.curve, p.u);
        packetBatch.positions.set(pos, i * 3);
        const mix = Math.max(0, 1 - Math.abs(p.u - 0.5) / 0.2);
        const c = tones.bright;
        const c2 = tones.accent2;
        packetBatch.colors.set(
          [
            c[0] + (c2[0] - c[0]) * mix,
            c[1] + (c2[1] - c[1]) * mix,
            c[2] + (c2[2] - c[2]) * mix,
            0.9,
          ],
          i * 4,
        );
      });
      engine.drawPoints(packetBatch, mvp, mv, fog, true, explode * 0.4);

      // Labels follow their stations.
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      stations.forEach((s, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        const c: Vec3 = [
          s.center[0] + s.explode[0] * explode,
          s.center[1] + s.explode[1] * explode,
          s.center[2] + s.explode[2] * explode,
        ];
        const sp = project(mvp, c);
        if (
          !sp.visible ||
          sp.x < -0.1 ||
          sp.x > 1.1 ||
          sp.y < -0.1 ||
          sp.y > 1.1
        ) {
          el.style.opacity = "0";
          return;
        }
        const near = Math.max(0.3, 1 - (sp.depth + 1) * 0.35) * (1 - scroll);
        el.style.opacity = near.toFixed(2);
        // Keep the label inside the box: it hangs 14px right of the node.
        const x = Math.min(sp.x * w, w - el.offsetWidth - 16);
        el.style.transform = `translate(${x.toFixed(1)}px, ${(sp.y * h).toFixed(1)}px)`;
        if (i === 1) el.classList.toggle("is-flash", gateFlash > 0.5);
      });

      raf = requestAnimationFrame(frame);
    };

    const play = () => {
      if (running || !engine) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (visible && !document.hidden) play();
        else pause();
      },
      { threshold: 0.02 },
    );
    const onVisibility = () => {
      if (document.hidden) pause();
      else if (visible) play();
    };
    const themeObserver = new MutationObserver(() => {
      tones = readTones();
      scene = buildStatic(tones, lite);
    });

    let idle = 0;
    let timer = 0;
    const start = () => {
      try {
        engine = new Engine(canvas, { maxDpr: lite ? 1.5 : 2 });
      } catch {
        return; // No WebGL: the SVG stays.
      }
      engine.resize();
      onScroll();
      setLive(true);
      io.observe(wrap);
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("scroll", onScroll, { passive: true });
      if (finePointer && !lite) {
        wrap.addEventListener("pointermove", onPointer);
        wrap.addEventListener("pointerleave", onLeave);
      }
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    };

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    // Boot only after the page has fully loaded, then on an idle slice, so the
    // scene never competes with hydration or the largest paint.
    const boot = () => {
      if (w.requestIdleCallback)
        idle = w.requestIdleCallback(start, { timeout: 2000 });
      else timer = window.setTimeout(start, 300);
    };
    let onLoad: (() => void) | null = null;
    if (document.readyState === "complete") boot();
    else {
      onLoad = () => boot();
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      if (onLoad) window.removeEventListener("load", onLoad);
      if (idle) w.cancelIdleCallback?.(idle);
      window.clearTimeout(timer);
      pause();
      io.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      wrap.removeEventListener("pointermove", onPointer);
      wrap.removeEventListener("pointerleave", onLeave);
      engine?.dispose();
      engine = null;
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`absolute inset-0 ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="system-scene__canvas" />
      <div className="system-scene__labels" aria-hidden="true">
        {labels.map((s, i) => (
          <span
            key={s.id}
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            className="system-scene__label"
            data-tone={stations[i]?.tone}
          >
            <span className="system-scene__index">
              {String(i + 1).padStart(2, "0")}
            </span>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
