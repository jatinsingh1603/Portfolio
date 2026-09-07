import {
  defaultCamera,
  matrices,
  project,
  spine,
  stations,
  worldEdges,
  worldNodes,
} from "@/lib/gl/topology";
import type { Vec3 } from "@/lib/gl/topology";

const W = 1600;
const H = 1000;

const toneVar: Record<string, string> = {
  steel: "var(--text-tertiary)",
  accent: "var(--accent)",
  accent2: "var(--accent-2)",
  low: "var(--sev-low)",
  bright: "var(--accent-hover)",
};

/**
 * The same five wireframe solids as the WebGL scene, projected through the
 * same camera on the server. It is the first thing painted (so the hero never
 * shows a blank box), the whole thing for reduced-motion and no-WebGL
 * visitors, and it needs no JavaScript at all.
 */
export function SystemSvg({
  className = "",
  labels: stationLabels,
}: {
  className?: string;
  labels: { id: string; label: string }[];
}) {
  const { mvp } = matrices(defaultCamera, W / H);
  const px = (p: Vec3) => {
    const s = project(mvp, p);
    return { x: s.x * W, y: s.y * H };
  };
  // Integer coordinates in a 1600-unit box: sub-pixel precision is invisible and
  // the markup is half the size, which matters because it is inline in the HTML.
  const f = (n: number) => String(Math.round(n));
  const curve = spine(10).map(px);
  const labels = new Map<string, string>(
    stationLabels.map((s) => [s.id, s.label]),
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <polyline
        points={curve.map((p) => `${f(p.x)},${f(p.y)}`).join(" ")}
        fill="none"
        stroke="var(--text-tertiary)"
        strokeOpacity={0.45}
        strokeWidth={2}
      />
      {stations.map((s, si) => {
        const c = px(s.center);
        const edges = worldEdges(s);
        const d = edges
          .map(([a, b]) => {
            const pa = px(a);
            const pb = px(b);
            return `M${f(pa.x)} ${f(pa.y)}L${f(pb.x)} ${f(pb.y)}`;
          })
          .join("");
        return (
          <g key={s.id}>
            <path
              d={d}
              fill="none"
              stroke={toneVar[s.tone]}
              strokeOpacity={0.5}
              strokeWidth={1.4}
            />
            {worldNodes(s).map((n, i) => {
              const p = px(n);
              return (
                <circle
                  key={i}
                  cx={f(p.x)}
                  cy={f(p.y)}
                  r={3}
                  fill={toneVar[s.tone]}
                  fillOpacity={0.85}
                />
              );
            })}
            <circle
              cx={f(c.x)}
              cy={f(c.y)}
              r={16}
              fill={toneVar[s.tone]}
              fillOpacity={0.12}
            />
            <circle cx={f(c.x)} cy={f(c.y)} r={7} fill={toneVar[s.tone]} />
            <text
              x={f(c.x + 20)}
              y={f(c.y - 22)}
              fill="var(--text-secondary)"
              fontFamily="var(--font-code), ui-monospace, monospace"
              fontSize={22}
              letterSpacing={2}
            >
              {String(si + 1).padStart(2, "0")} ·{" "}
              {(labels.get(s.id) ?? s.id).toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
