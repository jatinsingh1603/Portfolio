/**
 * A deliberately small WebGL 1 renderer for the hero: two programs (points and
 * lines), dynamic vertex buffers, depth fog and additive blending. Roughly 3 KB
 * gzipped, against the ~150 KB a scene-graph library would cost — the page has
 * a 120 KB JavaScript budget and this is the only 3D on it.
 *
 * Everything here is context-loss safe: `dispose()` releases GPU objects and
 * the caller re-creates the engine if the context comes back.
 */

const POINT_VS = `
attribute vec3 aPos;
attribute vec4 aCol;
attribute float aSize;
attribute vec3 aDir;
uniform mat4 uMVP;
uniform mat4 uMV;
uniform float uScale;
uniform float uExplode;
varying vec4 vCol;
varying float vDepth;
void main() {
  vec3 p = aPos + aDir * uExplode;
  vec4 mv = uMV * vec4(p, 1.0);
  gl_Position = uMVP * vec4(p, 1.0);
  float d = max(-mv.z, 0.1);
  gl_PointSize = aSize * uScale / d;
  vCol = aCol;
  vDepth = d;
}`;

const POINT_FS = `
precision mediump float;
varying vec4 vCol;
varying float vDepth;
uniform vec2 uFog;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float edge = smoothstep(0.5, 0.32, r);
  float fog = clamp((uFog.y - vDepth) / (uFog.y - uFog.x), 0.0, 1.0);
  float a = vCol.a * edge * fog;
  gl_FragColor = vec4(vCol.rgb * a, a);
}`;

const LINE_VS = `
attribute vec3 aPos;
attribute vec4 aCol;
attribute vec3 aDir;
uniform mat4 uMVP;
uniform mat4 uMV;
uniform float uExplode;
varying vec4 vCol;
varying float vDepth;
void main() {
  vec3 p = aPos + aDir * uExplode;
  vec4 mv = uMV * vec4(p, 1.0);
  gl_Position = uMVP * vec4(p, 1.0);
  vCol = aCol;
  vDepth = max(-mv.z, 0.1);
}`;

const LINE_FS = `
precision mediump float;
varying vec4 vCol;
varying float vDepth;
uniform vec2 uFog;
void main() {
  float fog = clamp((uFog.y - vDepth) / (uFog.y - uFog.x), 0.0, 1.0);
  float a = vCol.a * fog;
  gl_FragColor = vec4(vCol.rgb * a, a);
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

export type DrawBatch = {
  /** xyz per vertex. */
  positions: Float32Array;
  /** rgba per vertex, 0–1. */
  colors: Float32Array;
  /** Point size per vertex (points only), in CSS px at unit depth. */
  sizes?: Float32Array;
  /** xyz explode direction per vertex; omitted = static. */
  dirs?: Float32Array;
  count: number;
};

export class Engine {
  readonly gl: WebGLRenderingContext;
  private points: Program;
  private lines: Program;
  private posBuf: WebGLBuffer;
  private colBuf: WebGLBuffer;
  private sizeBuf: WebGLBuffer;
  private dirBuf: WebGLBuffer;
  private dpr = 1;
  width = 1;
  height = 1;
  lost = false;

  constructor(
    readonly canvas: HTMLCanvasElement,
    opts: { maxDpr?: number } = {},
  ) {
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
      // Software rendering (no GPU, or a blocklisted one) would burn the main
      // thread every frame for a decoration. Chrome returns null here in that
      // case, the constructor throws, and the server-rendered SVG stays.
      failIfMajorPerformanceCaveat: true,
    });
    if (!gl) throw new Error("webgl");
    // The caveat flag no longer catches SwiftShader in current Chrome, so ask
    // the driver directly. A CPU rasteriser would spend the main thread on a
    // decoration; the static SVG is the right hero for that machine.
    const debug = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = debug
      ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL))
      : "";
    if (/swiftshader|llvmpipe|software|mesa offscreen/i.test(renderer)) {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      throw new Error("software-gl");
    }
    this.gl = gl;
    this.points = link(
      gl,
      POINT_VS,
      POINT_FS,
      ["aPos", "aCol", "aSize", "aDir"],
      ["uMVP", "uMV", "uScale", "uFog", "uExplode"],
    );
    this.lines = link(
      gl,
      LINE_VS,
      LINE_FS,
      ["aPos", "aCol", "aDir"],
      ["uMVP", "uMV", "uFog", "uExplode"],
    );
    const mk = () => {
      const b = gl.createBuffer();
      if (!b) throw new Error("buffer");
      return b;
    };
    this.posBuf = mk();
    this.colBuf = mk();
    this.sizeBuf = mk();
    this.dirBuf = mk();
    this.dpr = Math.min(window.devicePixelRatio || 1, opts.maxDpr ?? 2);

    gl.enable(gl.BLEND);
    // Premultiplied-alpha additive-ish blend: colour adds, alpha accumulates.
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

  private upload(buf: WebGLBuffer, data: Float32Array) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
  }

  private bindDirs(loc: number, batch: DrawBatch) {
    const gl = this.gl;
    if (batch.dirs) {
      this.upload(this.dirBuf, batch.dirs);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
    } else {
      gl.disableVertexAttribArray(loc);
      gl.vertexAttrib3f(loc, 0, 0, 0);
    }
  }

  drawPoints(
    batch: DrawBatch,
    mvp: Float32Array,
    mv: Float32Array,
    fog: [number, number],
    additive = false,
    explode = 0,
  ) {
    if (!batch.count || !batch.sizes) return;
    const gl = this.gl;
    const p = this.points;
    // Premultiplied colour throughout; additive drops the destination fade so
    // overlapping packets brighten rather than occlude.
    if (additive) gl.blendFunc(gl.ONE, gl.ONE);
    else gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(p.program);
    gl.uniformMatrix4fv(p.uniforms.uMVP ?? null, false, mvp);
    gl.uniformMatrix4fv(p.uniforms.uMV ?? null, false, mv);
    // Point size is specified at depth 1; scale by dpr so it is CSS-px stable.
    gl.uniform1f(p.uniforms.uScale ?? null, this.dpr);
    gl.uniform2f(p.uniforms.uFog ?? null, fog[0], fog[1]);
    gl.uniform1f(p.uniforms.uExplode ?? null, explode);

    this.upload(this.posBuf, batch.positions);
    gl.enableVertexAttribArray(p.attribs.aPos ?? 0);
    gl.vertexAttribPointer(p.attribs.aPos ?? 0, 3, gl.FLOAT, false, 0, 0);
    this.upload(this.colBuf, batch.colors);
    gl.enableVertexAttribArray(p.attribs.aCol ?? 0);
    gl.vertexAttribPointer(p.attribs.aCol ?? 0, 4, gl.FLOAT, false, 0, 0);
    this.upload(this.sizeBuf, batch.sizes);
    gl.enableVertexAttribArray(p.attribs.aSize ?? 0);
    gl.vertexAttribPointer(p.attribs.aSize ?? 0, 1, gl.FLOAT, false, 0, 0);
    this.bindDirs(p.attribs.aDir ?? 0, batch);
    gl.drawArrays(gl.POINTS, 0, batch.count);
    if (additive) gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  drawLines(
    batch: DrawBatch,
    mvp: Float32Array,
    mv: Float32Array,
    fog: [number, number],
    explode = 0,
  ) {
    if (!batch.count) return;
    const gl = this.gl;
    const p = this.lines;
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(p.program);
    gl.uniformMatrix4fv(p.uniforms.uMVP ?? null, false, mvp);
    gl.uniformMatrix4fv(p.uniforms.uMV ?? null, false, mv);
    gl.uniform2f(p.uniforms.uFog ?? null, fog[0], fog[1]);
    gl.uniform1f(p.uniforms.uExplode ?? null, explode);
    this.upload(this.posBuf, batch.positions);
    gl.enableVertexAttribArray(p.attribs.aPos ?? 0);
    gl.vertexAttribPointer(p.attribs.aPos ?? 0, 3, gl.FLOAT, false, 0, 0);
    this.upload(this.colBuf, batch.colors);
    gl.enableVertexAttribArray(p.attribs.aCol ?? 0);
    gl.vertexAttribPointer(p.attribs.aCol ?? 0, 4, gl.FLOAT, false, 0, 0);
    this.bindDirs(p.attribs.aDir ?? 0, batch);
    gl.lineWidth(1);
    gl.drawArrays(gl.LINES, 0, batch.count);
  }

  dispose() {
    const gl = this.gl;
    gl.deleteBuffer(this.posBuf);
    gl.deleteBuffer(this.colBuf);
    gl.deleteBuffer(this.sizeBuf);
    gl.deleteBuffer(this.dirBuf);
    gl.deleteProgram(this.points.program);
    gl.deleteProgram(this.lines.program);
    const ext = gl.getExtension("WEBGL_lose_context");
    ext?.loseContext();
  }
}

/** Parses a CSS colour (#rgb, #rrggbb, rgb(), rgba()) into 0–1 floats. */
export function cssColor(input: string): [number, number, number] {
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
    const [r = 0, g = 0, b = 0] = rgb[1]
      .split(/[\s,\/]+/)
      .map((n) => Number(n));
    return [r / 255, g / 255, b / 255];
  }
  return [1, 1, 1];
}

/** Reads a CSS custom property from :root as 0–1 floats. */
export function tokenColor(name: string): [number, number, number] {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    name,
  );
  return cssColor(value || "#ffffff");
}
