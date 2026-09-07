import type { Stage } from "@/content/schema";

/**
 * A project's own pipeline, transcribed from content/diagrams.ts — never
 * invented for effect. A horizontal stepper on wide screens (scrolling inside
 * a focusable, labelled region, never the page), a vertical one on phones.
 * Gate stages — the hard stops that must be satisfied before the pipeline
 * continues — carry the teal signal. Pure CSS; notes are always visible.
 */
export function PipelineDiagram({
  stages,
  title,
  description,
  compact = false,
}: {
  stages: Stage[];
  /** Accessible name; also the figure's caption. */
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <figure className="m-0">
      {/* A scrollable region must be keyboard-reachable (axe:
          scrollable-region-focusable); the lint rule predates that guidance. */}
      {/* eslint-disable jsx-a11y/no-noninteractive-tabindex */}
      <div
        className="pipeline-scroll"
        role="region"
        aria-label={`${title}, ${stages.length} stages`}
        tabIndex={0}
      >
        {/* eslint-enable jsx-a11y/no-noninteractive-tabindex */}
        <ol className={`pipeline ${compact ? "pipeline--compact" : ""}`}>
          {stages.map((stage, i) => (
            <li
              key={stage.label}
              className="pipeline__stage"
              data-gate={stage.gate ? "true" : undefined}
            >
              <span className="pipeline__index t-data">
                {String(i + 1).padStart(2, "0")}
                {stage.gate ? (
                  <span className="pipeline__gate"> gate</span>
                ) : null}
              </span>
              <span className="pipeline__label">{stage.label}</span>
              {stage.note ? (
                <span className="pipeline__note">{stage.note}</span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
      <figcaption className="t-caption mt-4 max-w-[70ch]">
        {description}
      </figcaption>
    </figure>
  );
}
