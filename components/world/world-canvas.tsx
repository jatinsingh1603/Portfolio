"use client";

import { useEffect, useRef } from "react";
import { Engine, glowSegments, streakField, tokenColor } from "@/lib/gl/engine";
import {
  FIELD,
  TOTAL,
  cameraAt,
  hash,
  pathAt,
  placementCenter,
  placements,
  project,
  ringSegments,
  solidNodes,
  solidSegments,
  streakMatrices,
  viewMatrices,
} from "@/lib/gl/world";
import type { Tones } from "@/lib/gl/world";
import type { Vec3 } from "@/lib/gl/topology";

export type WorldLabel = { id: string; label: string };

const REF_DEPTH = 8;
const px = (size: number) => size * REF_DEPTH;

function readTones(): Tones {
  return {
    steel: tokenColor("--text-tertiary"),
    accent: tokenColor("--accent"),
    accent2: tokenColor("--accent-2"),
    low: tokenColor("--sev-low"),
    bright: tokenColor("--accent-hover"),
  };
}

/**
 * The world behind the page. A fixed full-viewport canvas: the camera flies
 * along a path as the document scrolls, through gate rings and past the five
 * system solids, inside a hyperspace field of streaks that stretch with scroll
 * velocity. Boots after load on an idle slice, pauses when hidden, and is
 * never mounted under reduced motion or on software-rendered WebGL — the page
 * is complete without it.
 */
export function WorldCanvas({ labels }: { labels: WorldLabel[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);

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
    let frameToggle = false;
    let tones = readTones();
    let statics: ReturnType<typeof buildStatics> | null = null;
    // Additive light only on the dark ground; on paper it would wash out.
    const isDark = () =>
      document.documentElement.getAttribute("data-theme") !== "light";
    let additive = isDark();

    function buildStatics(e: Engine, t: Tones) {
      const solids = glowSegments(solidSegments(t));
      const rings = glowSegments(ringSegments(t));
      const nodes = solidNodes(t);
      const npos = new Float32Array(nodes.length * 3);
      const ncol = new Float32Array(nodes.length * 4);
      const nsize = new Float32Array(nodes.length);
      nodes.forEach((n, i) => {
        npos.set(n.pos, i * 3);
        ncol.set([n.color[0], n.color[1], n.color[2], 0.9], i * 4);
        nsize[i] = px(n.size);
      });
      const streaks = streakField(
        lite ? 700 : 2200,
        9.5,
        FIELD,
        [
          { color: t.steel, alpha: 0.62, weight: 5 },
          { color: tokenColor("--text-secondary"), alpha: 0.7, weight: 3 },
          { color: tokenColor("--text"), alpha: 0.55, weight: 1.2 },
          { color: t.accent, alpha: 0.8, weight: 1.2 },
          { color: t.accent2, alpha: 0.7, weight: 0.6 },
        ],
        hash,
      );
      return {
        solids: {
          pos: e.buffer(solids.positions),
          other: e.buffer(solids.others),
          side: e.buffer(solids.sides),
          col: e.buffer(solids.colors),
          count: solids.count,
        },
        rings: {
          pos: e.buffer(rings.positions),
          other: e.buffer(rings.others),
          side: e.buffer(rings.sides),
          col: e.buffer(rings.colors),
          count: rings.count,
        },
        nodes: {
          pos: e.buffer(npos),
          col: e.buffer(ncol),
          size: e.buffer(nsize),
          count: nodes.length,
        },
        streaks: {
          base: e.buffer(streaks.bases),
          seed: e.buffer(streaks.seeds),
          side: e.buffer(streaks.sides),
          col: e.buffer(streaks.colors),
          count: streaks.count,
        },
      };
    }

    // Packets travel the path; their buffers are the only per-frame upload.
    const packetCount = lite ? 5 : 9;
    const packets = Array.from({ length: packetCount }, (_, i) => ({
      d: (i / packetCount) * TOTAL,
      speed: 7 + (i % 3) * 1.6,
    }));
    const ppos = new Float32Array(packetCount * 3);
    const pcol = new Float32Array(packetCount * 4);
    const psize = new Float32Array(packetCount).fill(px(5.2));
    let packetBuf: {
      pos: WebGLBuffer;
      col: WebGLBuffer;
      size: WebGLBuffer;
      count: number;
    } | null = null;

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let target = 0;
    let d = 0;
    let velocity = 0;
    let last = 0;
    let gateFlash = 0;

    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target =
        max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) * TOTAL : 0;
    };

    const frame = (now: number) => {
      raf = 0;
      if (!engine || engine.lost || !running || !statics || !packetBuf) return;
      if (lite) {
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
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      // Glide toward the scroll target; velocity stretches the streaks.
      const prev = d;
      d += (target - d) * (1 - Math.exp(-dt * 5.5));
      velocity += ((d - prev) / dt - velocity) * 0.15;
      const stretch = Math.min(3.2, Math.abs(velocity) * 0.09);

      const cam = cameraAt(d);
      cam.yaw += pointer.x * 0.06 + Math.sin(t / 11) * 0.015;
      cam.pitch += pointer.y * 0.04 + Math.sin(t / 13) * 0.01;
      const { mv, mvp, rot, proj } = viewMatrices(cam, engine.aspect);
      const fog: [number, number] = [5, 60];

      engine.clear();
      const sm = streakMatrices(rot, proj);
      engine.drawStreaks(
        statics.streaks,
        sm.mvp,
        sm.mv,
        [3, FIELD * 0.9],
        3.2,
        d + t * 1.6,
        stretch,
        FIELD,
        additive,
      );
      engine.drawGlow(statics.rings, mvp, mv, fog, 2.6, additive);
      engine.drawGlow(statics.solids, mvp, mv, fog, 3.0, additive);
      engine.drawPoints(statics.nodes, mvp, mv, fog, additive);

      // Packets: stall and flash at the security gate.
      gateFlash = Math.max(0, gateFlash - dt * 2.5);
      const gate = placements[1];
      packets.forEach((p, i) => {
        const nearGate = gate ? Math.abs(p.d - gate.d) < 2.2 : false;
        const before = p.d;
        p.d += dt * p.speed * (nearGate ? 0.28 : 1);
        if (gate && before < gate.d && p.d >= gate.d) gateFlash = 1;
        if (p.d > TOTAL + 4) p.d -= TOTAL + 4;
        const pos = pathAt(p.d);
        ppos.set([pos[0], pos[1] + 0.35, pos[2]], i * 3);
        const past = gate ? Math.max(0, Math.min(1, (p.d - gate.d) / 20)) : 0;
        const c = tones.bright;
        const c2 = tones.accent2;
        pcol.set(
          [
            c[0] + (c2[0] - c[0]) * past,
            c[1] + (c2[1] - c[1]) * past,
            c[2] + (c2[2] - c[2]) * past,
            0.95,
          ],
          i * 4,
        );
      });
      engine.update(packetBuf.pos, ppos);
      engine.update(packetBuf.col, pcol);
      engine.drawPoints(packetBuf, mvp, mv, fog, true);

      // Labels follow the solids while they are ahead of the camera.
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      placements.forEach((p, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        const c: Vec3 = placementCenter(p);
        const sp = project(mvp, c);
        const ahead = p.d - d;
        if (
          !sp.visible ||
          ahead < -2 ||
          ahead > 46 ||
          sp.x < 0.02 ||
          sp.x > 0.9 ||
          sp.y < 0.05 ||
          sp.y > 0.95
        ) {
          el.style.opacity = "0";
          return;
        }
        const near =
          Math.max(0.25, 1 - ahead / 46) * (ahead < 4 ? ahead / 4 + 0.3 : 1);
        el.style.opacity = Math.min(1, near).toFixed(2);
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
    const onVisibility = () => (document.hidden ? pause() : play());
    const themeObserver = new MutationObserver(() => {
      if (!engine) return;
      tones = readTones();
      additive = isDark();
      statics = buildStatics(engine, tones);
    });

    let idle = 0;
    let timer = 0;
    const start = () => {
      try {
        engine = new Engine(canvas, {
          maxDpr: lite ? 1.5 : 2,
          // `?world=force` lets a software-rendered browser (CI screenshots,
          // a reviewer's VM) see the world anyway. Never set by the site.
          allowSoftware:
            new URLSearchParams(window.location.search).get("world") ===
            "force",
        });
      } catch {
        return; // No usable WebGL: the page stands on its own.
      }
      engine.resize();
      statics = buildStatics(engine, tones);
      packetBuf = {
        pos: engine.buffer(ppos, true),
        col: engine.buffer(pcol, true),
        size: engine.buffer(psize),
        count: packetCount,
      };
      onScroll();
      d = target;
      document.documentElement.classList.add("world-live");
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      if (finePointer && !lite)
        window.addEventListener("pointermove", onPointer, { passive: true });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      play();
    };

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
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
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.classList.remove("world-live");
      engine?.dispose();
      engine = null;
    };
  }, []);

  return (
    <div ref={wrapRef} className="world" aria-hidden="true">
      <canvas ref={canvasRef} className="world__canvas" />
      <div className="world__labels">
        {labels.map((s, i) => (
          <span
            key={s.id}
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            className="world__label"
            data-tone={i === 1 ? "accent" : undefined}
          >
            <span className="world__index">
              {String(i + 1).padStart(2, "0")}
            </span>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
