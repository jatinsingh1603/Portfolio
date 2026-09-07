import {
  multiply,
  rotationX,
  rotationY,
  translation,
  perspective,
  transformPoint,
} from "./mat4";
import type { Mat4 } from "./mat4";
import { stations } from "./topology";
import type { Tone, Vec3 } from "./topology";

/**
 * The world behind the page: a flight path the camera follows as the visitor
 * scrolls, the five system solids placed along it, gate rings the camera flies
 * through, and a hyperspace streak field around the whole route. Every
 * coordinate is deterministic and derived from scroll position, so the same
 * scroll always shows the same frame.
 */

/** Travel units across the whole page. */
export const TOTAL = 120;
/** Length of the repeating streak field ahead of the camera. */
export const FIELD = 64;

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];

/** Camera path: a gentle meander along −Z. */
export function pathAt(d: number): Vec3 {
  return [2.2 * Math.sin(d / 21), 0.25 + 0.7 * Math.sin(d / 15), -d];
}

export type Placement = {
  id: string;
  /** Distance along the path where the solid sits. */
  d: number;
  /** Offset from the path so the camera passes beside (or through) it. */
  offset: Vec3;
  scale: number;
  /** A gate is centred on the path and flown through. */
  gate?: boolean;
};

export const placements: Placement[] = [
  { id: "user", d: 11, offset: [2.9, 0.5, 0], scale: 2.6 },
  { id: "security", d: 32, offset: [0, 0, 0], scale: 5.6, gate: true },
  { id: "ai", d: 56, offset: [-3.4, 0.9, 0], scale: 4.2 },
  { id: "automation", d: 80, offset: [3.4, -0.4, 0], scale: 4.4 },
  { id: "result", d: 106, offset: [0.3, 0.3, 0], scale: 4.6 },
];

export function placementCenter(p: Placement): Vec3 {
  return add(pathAt(p.d), p.offset);
}

export type Segment = {
  a: Vec3;
  b: Vec3;
  color: [number, number, number];
  alpha: number;
};
export type Tones = Record<Tone, [number, number, number]>;

/** The five solids, transcribed from the topology and placed along the path. */
export function solidSegments(tones: Tones): Segment[] {
  const out: Segment[] = [];
  for (const p of placements) {
    const s = stations.find((st) => st.id === p.id);
    if (!s) continue;
    const c = placementCenter(p);
    const color = tones[s.tone];
    for (const [a, b] of s.edges) {
      out.push({
        a: add(c, scale(a, p.scale)),
        b: add(c, scale(b, p.scale)),
        color,
        alpha: p.gate ? 0.95 : 0.8,
      });
    }
  }
  return out;
}

/** Node dots on the solids. */
export function solidNodes(
  tones: Tones,
): { pos: Vec3; color: [number, number, number]; size: number }[] {
  const out: { pos: Vec3; color: [number, number, number]; size: number }[] =
    [];
  for (const p of placements) {
    const s = stations.find((st) => st.id === p.id);
    if (!s) continue;
    const c = placementCenter(p);
    for (const n of s.nodes)
      out.push({
        pos: add(c, scale(n, p.scale)),
        color: tones[s.tone],
        size: 3.2,
      });
    out.push({ pos: c, color: tones[s.tone], size: 6 });
  }
  return out;
}

function ring(
  center: Vec3,
  radius: number,
  segs: number,
  color: [number, number, number],
  alpha: number,
  tilt = 0,
): Segment[] {
  const pts: Vec3[] = [];
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    pts.push([
      center[0] + x,
      center[1] + y * Math.cos(tilt),
      center[2] + y * Math.sin(tilt),
    ]);
  }
  const out: Segment[] = [];
  for (let i = 0; i < segs; i++)
    out.push({
      a: pts[i] as Vec3,
      b: pts[(i + 1) % segs] as Vec3,
      color,
      alpha,
    });
  return out;
}

/** Tunnel rings the camera flies through, plus the bright security gate. */
export function ringSegments(tones: Tones): Segment[] {
  const out: Segment[] = [];
  for (let d = 18; d < TOTAL + 10; d += 22) {
    const c = pathAt(d);
    out.push(...ring(c, 7.2, 56, tones.steel, 0.42, 0.06));
    out.push(...ring(c, 7.9, 56, tones.steel, 0.2, 0.06));
  }
  const gate = placementCenter(placements[1] as Placement);
  out.push(...ring(gate, 3.6, 72, tones.accent, 0.95));
  out.push(...ring(gate, 4.1, 72, tones.accent, 0.5));
  out.push(...ring(gate, 4.7, 72, tones.accent, 0.22));
  // The finish: a bright ring at the result.
  const end = placementCenter(placements[4] as Placement);
  out.push(...ring(end, 3.2, 64, tones.bright, 0.5));
  return out;
}

/** Deterministic pseudo-random. */
export function hash(i: number): number {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export type Camera = { eye: Vec3; yaw: number; pitch: number; roll: number };

/** Camera at distance d, looking ahead along the path. */
export function cameraAt(d: number, look = 7): Camera {
  const eye = pathAt(d);
  const target = pathAt(d + look);
  const dx = target[0] - eye[0];
  const dy = target[1] - eye[1];
  const dz = target[2] - eye[2];
  const yaw = Math.atan2(dx, -dz);
  const pitch = Math.atan2(dy, Math.hypot(dx, dz));
  return {
    eye: [eye[0], eye[1] + 0.35, eye[2]],
    yaw,
    pitch,
    roll: Math.sin(d / 29) * 0.05,
  };
}

function rotationZ(rad: number): Mat4 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const m = new Float32Array(16);
  m[0] = c;
  m[1] = s;
  m[4] = -s;
  m[5] = c;
  m[10] = 1;
  m[15] = 1;
  return m;
}

/** World-space view: rotate the world by the inverse camera rotation, after translating it. */
export function viewMatrices(
  cam: Camera,
  aspect: number,
  fov = (58 * Math.PI) / 180,
) {
  const rot = multiply(
    rotationZ(-cam.roll),
    multiply(rotationX(-cam.pitch), rotationY(-cam.yaw)),
  );
  const view = multiply(
    rot,
    translation(-cam.eye[0], -cam.eye[1], -cam.eye[2]),
  );
  const proj = perspective(fov, aspect, 0.3, 90);
  return { mv: view, mvp: multiply(proj, view), rot, proj };
}

/** Camera-relative view for the streak field: rotation only. */
export function streakMatrices(rot: Mat4, proj: Mat4) {
  return { mv: rot, mvp: multiply(proj, rot) };
}

export function project(mvp: Mat4, p: Vec3) {
  const [cx, cy, , cw] = transformPoint(mvp, p[0], p[1], p[2]);
  if (cw <= 0) return { x: 0, y: 0, depth: 0, visible: false };
  return {
    x: (cx / cw + 1) / 2,
    y: (1 - cy / cw) / 2,
    depth: cw,
    visible: true,
  };
}
