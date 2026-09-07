/**
 * A deliberately small WebGL 1 renderer for the world behind the page. Three
 * programs: soft points, glow lines (screen-space quads with a luminous core,
 * for the solids, rings and packets' trails) and streaks (the hyperspace
 * field, positioned entirely in the vertex shader from a static buffer so the
 * CPU does nothing per frame). Roughly 4 KB gzipped, code-split, against the
 * ~150 KB a scene-graph library would cost.
 *
 * Everything here is context-loss safe: `dispose()` releases GPU objects and
 * the caller re-creates the engine if the context comes back.
 */

const FOG = `
uniform vec2 uFog;
float fogAt(float depth) {
  return clamp((uFog.y - depth) / (uFog.y - uFog.x), 0.0, 1.0);
}`;

const POINT_VS = `
attribute vec3 aPos;
attribute vec4 aCol;
attribute float aSize;
uniform mat4 uMVP;
uniform mat4 uMV;
uniform float uScale;
varying vec4 vCol;
varying float vDepth;
void main() {
  vec4 mv = uMV * vec4(aPos, 1.0);
  gl_Position = uMVP * vec4(aPos, 1.0);
  float d = max(-mv.z, 0.1);
  gl_PointSize = min(aSize * uScale / d, 26.0 * uScale);
  vCol = aCol;
  vDepth = d;
}`;

const POINT_FS = `
precision mediump float;
varying vec4 vCol;
varying float vDepth;
${FOG}
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float edge = smoothstep(0.5, 0.18, r);
  float a = vCol.a * edge * fogAt(vDepth);
  gl_FragColor = vec4(vCol.rgb * a, a);
}`;

/* Glow lines: each segment is a screen-space quad. Every vertex knows both
   endpoints, which side it sits on and whether it is the head or the tail. */
const GLOW_VS = `
attribute vec3 aPos;
attribute vec3 aOther;
attribute vec2 aSide;
attribute vec4 aCol;
uniform mat4 uMVP;
uniform mat4 uMV;
uniform vec2 uViewport;
uniform float uWidth;
varying vec4 vCol;
varying float vDepth;
varying float vAcross;
void main() {
  vec4 a = uMVP * vec4(aPos, 1.0);
  vec4 b = uMVP * vec4(aOther, 1.0);
  if (a.w <= 0.05 || b.w <= 0.05) {
    gl_Position = vec4(4.0, 4.0, 4.0, 1.0);
    vCol = vec4(0.0); vDepth = 1.0; vAcross = 0.0;
    return;
  }
  vec2 sa = a.xy / a.w * uViewport * 0.5;
  vec2 sb = b.xy / b.w * uViewport * 0.5;
  vec2 dir = sb - sa;
  float len = max(length(dir), 0.001);
  vec2 n = vec2(-dir.y, dir.x) / len;
  vec4 mv = uMV * vec4(aPos, 1.0);
  float depth = max(-mv.z, 0.1);
  float width = uWidth * clamp(9.0 / depth, 0.5, 2.6);
  vec2 offset = n * aSide.x * width * 0.5;
  gl_Position = vec4(a.xy + offset / (uViewport * 0.5) * a.w, a.z, a.w);
  vCol = aCol;
  vDepth = depth;
  vAcross = aSide.x;
}`;

const GLOW_FS = `
precision mediump float;
varying vec4 vCol;
varying float vDepth;
varying float vAcross;
${FOG}
void main() {
  float x = abs(vAcross);
  float core = smoothstep(1.0, 0.0, x);
  float glow = core * core * (0.55 + 0.45 * smoothstep(0.45, 0.0, x));
  float a = vCol.a * glow * fogAt(vDepth);
  gl_FragColor = vec4(vCol.rgb * a, a);
}`;

/* Streaks: camera-relative hyperspace field. Each streak is six vertices of a
   quad; its position along the travel axis is computed here from the camera's
   distance, so the whole field lives in one static buffer. */
const STREAK_VS = `
attribute vec3 aBase;
attribute vec2 aSeed;
attribute vec2 aSide;
attribute vec4 aCol;
uniform mat4 uMVP;
uniform mat4 uMV;
uniform vec2 uViewport;
uniform float uWidth;
uniform float uTravel;
uniform float uStretch;
uniform float uField;
varying vec4 vCol;
varying float vDepth;
varying float vAcross;
void main() {
  float speed = aSeed.x;
  float len = aSeed.y * (1.0 + uStretch);
  // Wrap the head into (-uField, 0]: ahead of the camera, along -Z.
  float z = -mod(aBase.z + uTravel * speed, uField);
  vec3 head = vec3(aBase.x, aBase.y, z);
  vec3 tail = head + vec3(0.0, 0.0, len);
  vec3 p = aSide.y > 0.5 ? tail : head;
  vec3 o = aSide.y > 0.5 ? head : tail;
  vec4 a = uMVP * vec4(p, 1.0);
  vec4 b = uMVP * vec4(o, 1.0);
  if (a.w <= 0.05 || b.w <= 0.05) {
    gl_Position = vec4(4.0, 4.0, 4.0, 1.0);
    vCol = vec4(0.0); vDepth = 1.0; vAcross = 0.0;
    return;
  }
  vec2 sa = a.xy / a.w * uViewport * 0.5;
  vec2 sb = b.xy / b.w * uViewport * 0.5;
  vec2 dir = sb - sa;
  float slen = max(length(dir), 0.001);
  vec2 n = vec2(-dir.y, dir.x) / slen;
  vec4 mv = uMV * vec4(p, 1.0);
  float depth = max(-mv.z, 0.1);
  float width = uWidth * clamp(10.0 / depth, 0.35, 2.2);
  vec2 offset = n * aSide.x * width * 0.5;
  gl_Position = vec4(a.xy + offset / (uViewport * 0.5) * a.w, a.z, a.w);
  // The tail fades so a streak reads as motion, not a rod.
  vCol = vec4(aCol.rgb, aCol.a * (aSide.y > 0.5 ? 0.0 : 1.0));
  vDepth = depth;
  vAcross = aSide.x;
}`;

type Program = {
  program: WebGLProgram;
  attribs: Record<string, number>;
  uniforms: Record<string, WebGLUniformLocation | null>;
};

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("shader");
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`shader: ${log ?? "unknown"}`);
  }
  return shader;
}

function link(
  gl: WebGLRenderingContext,
  vs: string,
  fs: string,
  attribs: string[],
  uniforms: string[],
): Program {
  const program = gl.createProgram();
  if (!program) throw new Error("program");
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`link: ${gl.getProgramInfoLog(program) ?? "unknown"}`);
  }
  const a: Record<string, number> = {};
  for (const name of attribs) a[name] = gl.getAttribLocation(program, name);
  const u: Record<string, WebGLUniformLocation | null> = {};
  for (const name of uniforms) u[name] = gl.getUniformLocation(program, name);
  return { program, attribs: a, uniforms: u };
}

export type PointBatch = {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  count: number;
};

/** Six vertices per segment; see `glowSegments`. */
export type GlowBatch = {
  positions: Float32Array;
  others: Float32Array;
  sides: Float32Array;
  colors: Float32Array;
  count: number;
};

export type StreakBatch = {
  bases: Float32Array;
  seeds: Float32Array;
  sides: Float32Array;
  colors: Float32Array;
  count: number;
};

export type Rgb = [number, number, number];

const QUAD_SIDES: [number, number][] = [
  [-1, 0],
  [1, 0],
  [1, 1],
  [-1, 0],
  [1, 1],
  [-1, 1],
];

/** Builds a glow batch from world-space segments. */
export function glowSegments(
  segments: {
    a: [number, number, number];
    b: [number, number, number];
    color: Rgb;
    alpha: number;
  }[],
): GlowBatch {
  const n = segments.length * 6;
  const positions = new Float32Array(n * 3);
  const others = new Float32Array(n * 3);
  const sides = new Float32Array(n * 2);
  const colors = new Float32Array(n * 4);
  let v = 0;
  for (const s of segments) {
    for (const [side, end] of QUAD_SIDES) {
      const p = end ? s.b : s.a;
      const o = end ? s.a : s.b;
      positions.set(p, v * 3);
      others.set(o, v * 3);
      sides.set([side, end], v * 2);
      colors.set([s.color[0], s.color[1], s.color[2], s.alpha], v * 4);
      v++;
    }
  }
  return { positions, others, sides, colors, count: n };
}

/** Builds the static streak field: `count` streaks in a tube around the axis. */
export function streakField(
  count: number,
  radius: number,
  field: number,
  palette: { color: Rgb; alpha: number; weight: number }[],
  hash: (i: number) => number,
): StreakBatch {
  const n = count * 6;
  const bases = new Float32Array(n * 3);
  const seeds = new Float32Array(n * 2);
  const sides = new Float32Array(n * 2);
  const colors = new Float32Array(n * 4);
  const total = palette.reduce((s, p) => s + p.weight, 0);
  let v = 0;
  for (let i = 0; i < count; i++) {
    const angle = hash(i * 7 + 1) * Math.PI * 2;
    // Bias toward the tube wall so the centre stays clear for the words.
    const r = radius * (0.35 + 0.65 * Math.sqrt(hash(i * 7 + 2)));
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r * 0.75;
    const z = hash(i * 7 + 3) * field;
    const speed = 0.6 + hash(i * 7 + 4) * 1.1;
    const len = 1.2 + hash(i * 7 + 5) * 3.4;
    let pick = hash(i * 7 + 6) * total;
    let chosen = palette[0]!;
    for (const p of palette) {
      if (pick < p.weight) {
        chosen = p;
        break;
      }
      pick -= p.weight;
    }
    for (const [side, end] of QUAD_SIDES) {
      bases.set([x, y, z], v * 3);
      seeds.set([speed, len], v * 2);
      sides.set([side, end], v * 2);
      colors.set(
        [chosen.color[0], chosen.color[1], chosen.color[2], chosen.alpha],
        v * 4,
      );
      v++;
    }
  }
  return { bases, seeds, sides, colors, count: n };
}

export class Engine {
  readonly gl: WebGLRenderingContext;
  private points: Program;
  private glow: Program;
  private streak: Program;
  private buffers: WebGLBuffer[] = [];
  private dpr = 1;
  width = 1;
  height = 1;
  lost = false;

  constructor(
    readonly canvas: HTMLCanvasElement,
    opts: { maxDpr?: number; allowSoftware?: boolean } = {},
  ) {
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: true,
    });
    if (!gl) throw new Error("webgl");
    // The caveat flag no longer catches SwiftShader in current Chrome, so ask
    // the driver directly. A CPU rasteriser would spend the main thread on a
    // decoration; the static page is the right experience for that machine.
    const debug = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = debug
      ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL))
      : "";
    if (
      !opts.allowSoftware &&
      /swiftshader|llvmpipe|software|mesa offscreen/i.test(renderer)
    ) {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      throw new Error("software-gl");
    }
    this.gl = gl;
    this.points = link(
      gl,
      POINT_VS,
      POINT_FS,
      ["aPos", "aCol", "aSize"],
      ["uMVP", "uMV", "uScale", "uFog"],
    );
    this.glow = link(
      gl,
      GLOW_VS,
      GLOW_FS,
      ["aPos", "aOther", "aSide", "aCol"],
      ["uMVP", "uMV", "uViewport", "uWidth", "uFog"],
    );
    this.streak = link(
      gl,
      STREAK_VS,
      GLOW_FS,
      ["aBase", "aSeed", "aSide", "aCol"],
      [
        "uMVP",
        "uMV",
        "uViewport",
        "uWidth",
        "uTravel",
        "uStretch",
        "uField",
        "uFog",
      ],
    );
    this.dpr = Math.min(window.devicePixelRatio || 1, opts.maxDpr ?? 2);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);

    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      this.lost = true;
    });
  }

  /** Resizes the drawing buffer to the canvas's CSS box. Returns true if changed. */
  resize(): boolean {
    const w = Math.max(1, Math.round(this.canvas.clientWidth * this.dpr));
    const h = Math.max(1, Math.round(this.canvas.clientHeight * this.dpr));
    if (w === this.canvas.width && h === this.canvas.height) return false;
    this.canvas.width = w;
    this.canvas.height = h;
    this.width = w;
    this.height = h;
    this.gl.viewport(0, 0, w, h);
    return true;
  }

  get aspect() {
    return this.width / this.height;
  }

  clear() {
    const gl = this.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  /** A static buffer, uploaded once. */
  buffer(data: Float32Array, dynamic = false): WebGLBuffer {
    const gl = this.gl;
    const b = gl.createBuffer();
    if (!b) throw new Error("buffer");
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      data,
      dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW,
    );
    this.buffers.push(b);
    return b;
  }

  update(buf: WebGLBuffer, data: Float32Array) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
  }

  private attrib(loc: number, buf: WebGLBuffer, size: number) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  }

  drawPoints(
    b: { pos: WebGLBuffer; col: WebGLBuffer; size: WebGLBuffer; count: number },
    mvp: Float32Array,
    mv: Float32Array,
    fog: [number, number],
    additive = false,
  ) {
    if (!b.count) return;
    const gl = this.gl;
    const p = this.points;
    gl.blendFunc(gl.ONE, additive ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(p.program);
    gl.uniformMatrix4fv(p.uniforms.uMVP ?? null, false, mvp);
    gl.uniformMatrix4fv(p.uniforms.uMV ?? null, false, mv);
    gl.uniform1f(p.uniforms.uScale ?? null, this.dpr);
    gl.uniform2f(p.uniforms.uFog ?? null, fog[0], fog[1]);
    this.attrib(p.attribs.aPos ?? 0, b.pos, 3);
    this.attrib(p.attribs.aCol ?? 0, b.col, 4);
    this.attrib(p.attribs.aSize ?? 0, b.size, 1);
    gl.drawArrays(gl.POINTS, 0, b.count);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  drawGlow(
    b: {
      pos: WebGLBuffer;
      other: WebGLBuffer;
      side: WebGLBuffer;
      col: WebGLBuffer;
      count: number;
    },
    mvp: Float32Array,
    mv: Float32Array,
    fog: [number, number],
    widthPx: number,
    additive = false,
  ) {
    if (!b.count) return;
    const gl = this.gl;
    const p = this.glow;
    gl.blendFunc(gl.ONE, additive ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(p.program);
    gl.uniformMatrix4fv(p.uniforms.uMVP ?? null, false, mvp);
    gl.uniformMatrix4fv(p.uniforms.uMV ?? null, false, mv);
    gl.uniform2f(p.uniforms.uViewport ?? null, this.width, this.height);
    gl.uniform1f(p.uniforms.uWidth ?? null, widthPx * this.dpr);
    gl.uniform2f(p.uniforms.uFog ?? null, fog[0], fog[1]);
    this.attrib(p.attribs.aPos ?? 0, b.pos, 3);
    this.attrib(p.attribs.aOther ?? 0, b.other, 3);
    this.attrib(p.attribs.aSide ?? 0, b.side, 2);
    this.attrib(p.attribs.aCol ?? 0, b.col, 4);
    gl.drawArrays(gl.TRIANGLES, 0, b.count);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  drawStreaks(
    b: {
      base: WebGLBuffer;
      seed: WebGLBuffer;
      side: WebGLBuffer;
      col: WebGLBuffer;
      count: number;
    },
    mvp: Float32Array,
    mv: Float32Array,
    fog: [number, number],
    widthPx: number,
    travel: number,
    stretch: number,
    field: number,
    additive = false,
  ) {
    if (!b.count) return;
    const gl = this.gl;
    const p = this.streak;
    gl.blendFunc(gl.ONE, additive ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(p.program);
    gl.uniformMatrix4fv(p.uniforms.uMVP ?? null, false, mvp);
    gl.uniformMatrix4fv(p.uniforms.uMV ?? null, false, mv);
    gl.uniform2f(p.uniforms.uViewport ?? null, this.width, this.height);
    gl.uniform1f(p.uniforms.uWidth ?? null, widthPx * this.dpr);
    gl.uniform2f(p.uniforms.uFog ?? null, fog[0], fog[1]);
    gl.uniform1f(p.uniforms.uTravel ?? null, travel);
    gl.uniform1f(p.uniforms.uStretch ?? null, stretch);
    gl.uniform1f(p.uniforms.uField ?? null, field);
    this.attrib(p.attribs.aBase ?? 0, b.base, 3);
    this.attrib(p.attribs.aSeed ?? 0, b.seed, 2);
    this.attrib(p.attribs.aSide ?? 0, b.side, 2);
    this.attrib(p.attribs.aCol ?? 0, b.col, 4);
    gl.drawArrays(gl.TRIANGLES, 0, b.count);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  dispose() {
    const gl = this.gl;
    for (const b of this.buffers) gl.deleteBuffer(b);
    this.buffers = [];
    gl.deleteProgram(this.points.program);
    gl.deleteProgram(this.glow.program);
    gl.deleteProgram(this.streak.program);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

/** Parses a CSS colour (#rgb, #rrggbb, rgb(), rgba()) into 0–1 floats. */
export function cssColor(input: string): Rgb {
  const v = input.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
  if (hex?.[1]) {
    const h =
      hex[1].length === 3
        ? hex[1]
            .split("")
            .map((c) => c + c)
            .join("")
        : hex[1];
    return [
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255,
    ];
  }
  const rgb = /^rgba?\(([^)]+)\)$/i.exec(v);
  if (rgb?.[1]) {
    const [r = 0, g = 0, b = 0] = rgb[1].split(/[\s,/]+/).map((n) => Number(n));
    return [r / 255, g / 255, b / 255];
  }
  return [1, 1, 1];
}

/** Reads a CSS custom property from :root as 0–1 floats. */
export function tokenColor(name: string): Rgb {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    name,
  );
  return cssColor(value || "#ffffff");
}
