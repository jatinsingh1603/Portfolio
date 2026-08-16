export type Stage = {
  label: string;
  /** Short note set beside the node — the reason the stage exists. */
  note?: string;
  /** Renders as a gate: a hard stop that must be satisfied before continuing. */
  gate?: boolean;
};

const NODE_H = 44;
const GAP = 18;
const PAD = 12;
const WIDTH = 620;
const NODE_W = 210;
const NOTE_X = 226;

/**
 * A real artifact, generated from each project's own pipeline description —
 * not stock illustration. Drawn as inline SVG so it costs no request, themes
 * with CSS variables, and stays sharp at any width.
 */
export function PipelineDiagram({
  stages,
  title,
  description,
}: {
  stages: Stage[];
  /** Accessible name; also the figure's caption. */
  title: string;
  description: string;
}) {
  const height = PAD * 2 + stages.length * NODE_H + (stages.length - 1) * GAP;
  const titleId = title.replace(/\W+/g, "-").toLowerCase();

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-labelledby={`${titleId}-title ${titleId}-desc`}
        className="w-full"
        style={{ color: "var(--text-secondary)" }}
      >
        <title id={`${titleId}-title`}>{title}</title>
        <desc id={`${titleId}-desc`}>{description}</desc>

        {stages.map((stage, index) => {
          const y = PAD + index * (NODE_H + GAP);
          const isLast = index === stages.length - 1;
          const stroke = stage.gate ? "var(--accent)" : "var(--border-strong)";

          return (
            <g key={stage.label}>
              <rect
                x={0}
                y={y}
                width={NODE_W}
                height={NODE_H}
                rx={8}
                fill="none"
                stroke={stroke}
                strokeWidth={1}
              />
              <text
                x={14}
                y={y + NODE_H / 2 + 4}
                fontSize={11}
                fontWeight={500}
                fill={stage.gate ? "var(--accent)" : "var(--text)"}
                fontFamily="var(--font-geist-mono), monospace"
              >
                {String(index + 1).padStart(2, "0")}
              </text>
              <text
                x={40}
                y={y + NODE_H / 2 + 4}
                fontSize={12}
                fill={stage.gate ? "var(--accent)" : "var(--text)"}
              >
                {stage.label}
              </text>

              {stage.note ? (
                <text
                  x={NOTE_X}
                  y={y + NODE_H / 2 + 4}
                  fontSize={12}
                  fill="var(--text-secondary)"
                >
                  {stage.note}
                </text>
              ) : null}

              {!isLast ? (
                <line
                  x1={NODE_W / 2}
                  y1={y + NODE_H}
                  x2={NODE_W / 2}
                  y2={y + NODE_H + GAP}
                  stroke="var(--border-strong)"
                  strokeWidth={1}
                  strokeDasharray={stages[index + 1]?.gate ? "3 3" : undefined}
                />
              ) : null}
            </g>
          );
        })}
      </svg>
      <figcaption className="t-caption mt-4">{description}</figcaption>
    </figure>
  );
}
