import {
  multiply,
  perspective,
  rotationX,
  rotationY,
  transformPoint,
  translation,
} from "./mat4";
import type { Mat4 } from "./mat4";

/**
 * The hero object: five wireframe solids along an S-curve that recedes into
 * depth — USER → SECURITY → AI ENGINE → AUTOMATION → RESULT. Each solid has a
 * silhouette that argues its stage: a small octahedron (a request), a ring
 * gate (the authorisation control), nested gyroscope rings around an
 * icosahedron core (reasoning), a hexagonal lattice of ordered lanes
 * (automation), and a ruled sheet tilted to face the camera (the report).
 *
 * Every coordinate is deterministic, so the server renders the same object as
 * an SVG before WebGL takes over and reduced-motion visitors see it, still.
 */
export type Vec3 = [number, number, number];
export type Tone = "steel" | "accent" | "accent2" | "low" | "bright";

export type Station = {
  id: string;
  center: Vec3;
  tone: Tone;
  /** Line segments in local space (pairs of points). */
  edges: [Vec3, Vec3][];
  /** Node points in local space. */
  nodes: Vec3[];
  /** Direction this station slides when the assembly explodes on scroll. */
  explode: Vec3;
};

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];

function rotY(p: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
}
function rotX(p: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
}
function rotZ(p: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
}

function octahedron(r: number): { edges: [Vec3, Vec3][]; nodes: Vec3[] } {
  const v: Vec3[] = [
    [r, 0, 0],
    [-r, 0, 0],
    [0, r, 0],
    [0, -r, 0],
    [0, 0, r],
    [0, 0, -r],
  ];
  const edges: [Vec3, Vec3][] = [];
  for (const a of [0, 1])
    for (const b of [2, 3])
      for (const c of [4, 5]) {
        edges.push([v[a] as Vec3, v[b] as Vec3]);
        edges.push([v[b] as Vec3, v[c] as Vec3]);
        edges.push([v[c] as Vec3, v[a] as Vec3]);
      }
  // Dedupe (each edge is pushed twice above).
  const seen = new Set<string>();
  const out: [Vec3, Vec3][] = [];
  for (const e of edges) {
    const k = [e[0].join(), e[1].join()].sort().join("|");
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(e);
  }
  return { edges: out, nodes: v };
}

function ring(
  r: number,
  segs: number,
  orient: (p: Vec3) => Vec3,
): [Vec3, Vec3][] {
  const pts: Vec3[] = [];
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    pts.push(orient([Math.cos(a) * r, Math.sin(a) * r, 0]));
  }
  const edges: [Vec3, Vec3][] = [];
  for (let i = 0; i < segs; i++) {
    edges.push([pts[i] as Vec3, pts[(i + 1) % segs] as Vec3]);
  }
  return edges;
}

function icosahedron(r: number): { edges: [Vec3, Vec3][]; nodes: Vec3[] } {
  const t = (1 + Math.sqrt(5)) / 2;
  const raw: Vec3[] = [
    [-1, t, 0],
    [1, t, 0],
    [-1, -t, 0],
    [1, -t, 0],
    [0, -1, t],
    [0, 1, t],
    [0, -1, -t],
    [0, 1, -t],
    [t, 0, -1],
    [t, 0, 1],
    [-t, 0, -1],
    [-t, 0, 1],
  ];
  const n = Math.sqrt(1 + t * t);
  const v = raw.map((p) => scale(p, r / n));
  const edges: [Vec3, Vec3][] = [];
  for (let i = 0; i < v.length; i++) {
    for (let j = i + 1; j < v.length; j++) {
      const a = v[i] as Vec3;
      const b = v[j] as Vec3;
      const d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
      if (Math.abs(d - (2 * r) / n) < 1e-3) edges.push([a, b]);
    }
  }
  return { edges, nodes: v };
}

function hexLattice(r: number, layers: number, gap: number) {
  const edges: [Vec3, Vec3][] = [];
  const nodes: Vec3[] = [];
  for (let l = 0; l < layers; l++) {
    const y = (l - (layers - 1) / 2) * gap;
    const pts: Vec3[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + (l % 2 ? Math.PI / 6 : 0);
      pts.push([Math.cos(a) * r, y, Math.sin(a) * r]);
    }
    for (let i = 0; i < 6; i++) {
      edges.push([pts[i] as Vec3, pts[(i + 1) % 6] as Vec3]);
      if (l > 0)
        edges.push([pts[i] as Vec3, [pts[i]![0], y - gap, pts[i]![2]]]);
    }
    if (l === 0 || l === layers - 1) nodes.push(...pts);
  }
  return { edges, nodes };
}

function sheet(w: number, h: number, rows: number, cols: number) {
  const edges: [Vec3, Vec3][] = [];
  const nodes: Vec3[] = [];
  const tilt = (p: Vec3) => rotY(rotX(p, -0.12), 0.55);
  for (let i = 0; i <= rows; i++) {
    const y = -h / 2 + (i / rows) * h;
    edges.push([tilt([-w / 2, y, 0]), tilt([w / 2, y, 0])]);
  }
  for (let j = 0; j <= cols; j++) {
    const x = -w / 2 + (j / cols) * w;
    edges.push([tilt([x, -h / 2, 0]), tilt([x, h / 2, 0])]);
  }
  nodes.push(
    tilt([-w / 2, h / 2, 0]),
    tilt([w / 2, h / 2, 0]),
    tilt([-w / 2, -h / 2, 0]),
    tilt([w / 2, -h / 2, 0]),
  );
  return { edges, nodes };
}

const user = octahedron(0.34);
const gateOuter = ring(0.62, 28, (p) => rotY(p, 0.35));
const gateInner = ring(0.5, 28, (p) => rotY(p, 0.35));
const gateSpokes: [Vec3, Vec3][] = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2;
  return [
    rotY([Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0], 0.35),
    rotY([Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0], 0.35),
  ];
});
const engineCore = icosahedron(0.3);
const engineRings = [
  ...ring(0.62, 40, (p) => p),
  ...ring(0.62, 40, (p) => rotX(p, Math.PI / 2)),
  ...ring(0.62, 40, (p) => rotZ(rotX(p, Math.PI / 2), Math.PI / 2)),
];
const lanes = hexLattice(0.5, 3, 0.32);
const report = sheet(1.1, 0.8, 4, 6);

export const stations: Station[] = [
  {
    id: "user",
    center: [-3.6, 0.35, 2.1],
    tone: "steel",
    edges: user.edges,
    nodes: user.nodes,
    explode: [-1, 0.2, 0.6],
  },
  {
    id: "security",
    center: [-1.8, -0.35, 0.9],
    tone: "accent",
    edges: [...gateOuter, ...gateInner, ...gateSpokes],
    nodes: gateSpokes.map((e) => e[1]),
    explode: [-0.5, -0.5, 0.4],
  },
  {
    id: "ai",
    center: [0.1, 0.45, -0.3],
    tone: "accent2",
    edges: [...engineCore.edges, ...engineRings],
    nodes: engineCore.nodes,
    explode: [0, 0.8, 0],
  },
  {
    id: "automation",
    center: [1.9, -0.3, -1.6],
    tone: "low",
    edges: lanes.edges,
    nodes: lanes.nodes,
    explode: [0.5, -0.5, -0.4],
  },
  {
    id: "result",
    center: [3.7, 0.25, -3.0],
    tone: "bright",
    edges: report.edges,
    nodes: report.nodes,
    explode: [1, 0.2, -0.6],
  },
];

/** Catmull-Rom through the station centres, `per` samples per segment. */
export function spine(per = 12): Vec3[] {
  const c = stations.map((s) => s.center);
  const pts: Vec3[] = [];
  for (let i = 0; i < c.length - 1; i++) {
    const p0 = c[Math.max(0, i - 1)] as Vec3;
    const p1 = c[i] as Vec3;
    const p2 = c[i + 1] as Vec3;
    const p3 = c[Math.min(c.length - 1, i + 2)] as Vec3;
    for (let j = 0; j < per; j++) {
      const t = j / per;
      const t2 = t * t;
      const t3 = t2 * t;
      const v: Vec3 = [0, 0, 0];
      for (let k = 0; k < 3; k++) {
        v[k] =
          0.5 *
          (2 * (p1[k] ?? 0) +
            (-(p0[k] ?? 0) + (p2[k] ?? 0)) * t +
            (2 * (p0[k] ?? 0) -
              5 * (p1[k] ?? 0) +
              4 * (p2[k] ?? 0) -
              (p3[k] ?? 0)) *
              t2 +
            (-(p0[k] ?? 0) +
              3 * (p1[k] ?? 0) -
              3 * (p2[k] ?? 0) +
              (p3[k] ?? 0)) *
              t3);
      }
      pts.push(v);
    }
  }
  pts.push(c[c.length - 1] as Vec3);
  return pts;
}

/** Position along the spine at parameter u ∈ [0,1]. */
export function alongSpine(curve: Vec3[], u: number): Vec3 {
  const n = curve.length - 1;
  const f = Math.min(Math.max(u, 0), 1) * n;
  const i = Math.min(Math.floor(f), n - 1);
  const t = f - i;
  const a = curve[i] as Vec3;
  const b = curve[i + 1] as Vec3;
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

/** World-space edge and node helpers. */
export function worldEdges(s: Station): [Vec3, Vec3][] {
  return s.edges.map(([a, b]) => [add(s.center, a), add(s.center, b)]);
}
export function worldNodes(s: Station): Vec3[] {
  return s.nodes.map((n) => add(s.center, n));
}

/** Deterministic pseudo-random for a sparse depth field inside the scene. */
function hash(i: number): number {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}
export function dust(count: number): Vec3[] {
  const out: Vec3[] = [];
  for (let i = 0; i < count; i++) {
    out.push([
      (hash(i * 3 + 1) - 0.5) * 16,
      (hash(i * 3 + 2) - 0.5) * 6,
      -10 + hash(i * 3 + 3) * 14,
    ]);
  }
  return out;
}

export type Camera = {
  fov: number;
  eye: Vec3;
  yaw: number;
  pitch: number;
  /** Forward dolly along −Z, in world units. */
  dolly: number;
};

export const defaultCamera: Camera = {
  fov: (48 * Math.PI) / 180,
  eye: [-0.45, 0.35, 7.2],
  yaw: -0.34,
  pitch: 0.2,
  dolly: 0,
};

/** Portrait boxes see the whole object by scaling the model down. */
export function fitScale(aspect: number): number {
  return Math.min(1, Math.max(0.5, aspect / 1.6));
}

function scaling(k: number): Mat4 {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = k;
  m[15] = 1;
  return m;
}

/** Model-view and MVP for a camera. Rotation and fit are applied to the model. */
export function matrices(cam: Camera, aspect: number): { mv: Mat4; mvp: Mat4 } {
  const model = multiply(
    scaling(fitScale(aspect)),
    multiply(rotationX(cam.pitch), rotationY(cam.yaw)),
  );
  const view = translation(-cam.eye[0], -cam.eye[1], -cam.eye[2] + cam.dolly);
  const mv = multiply(view, model);
  const proj = perspective(cam.fov, aspect, 0.5, 40);
  return { mv, mvp: multiply(proj, mv) };
}

/** Projects a world point to normalised screen space (0–1, y down). */
export function project(
  mvp: Mat4,
  p: Vec3,
): { x: number; y: number; depth: number; visible: boolean } {
  const [cx, cy, cz, cw] = transformPoint(mvp, p[0], p[1], p[2]);
  if (cw <= 0) return { x: 0, y: 0, depth: 0, visible: false };
  return {
    x: (cx / cw + 1) / 2,
    y: (1 - cy / cw) / 2,
    depth: cz / cw,
    visible: true,
  };
}
