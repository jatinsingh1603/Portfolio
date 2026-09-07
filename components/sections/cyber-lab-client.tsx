"use client";

import { useRef, useState, type KeyboardEvent } from "react";

export type CyberEvidenceView = {
  source: string;
  ref: string;
  text: string;
  href: string | null;
};

export type CyberStageView = {
  id: string;
  label: string;
  headline: string;
  description: string;
  tools: string[];
  capabilities: string[];
  evidence: CyberEvidenceView[];
};

const PANEL_ID = "cyber-lab-panel";

/**
 * The six-stage methodology as an ARIA tablist: a horizontal track of tab
 * cards on md+, a vertical list on mobile, the row scrolling in its own
 * overflow container. Roving tabindex with Arrow/Home/End keys. Receives only
 * plain props — no content or primitive imports.
 */
export function CyberLabClient({ stages }: { stages: CyberStageView[] }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = stages.length;

  function select(index: number) {
    setActive(index);
    tabRefs.current[index]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        select((active - 1 + count) % count);
        break;
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        select((active + 1) % count);
        break;
      case "Home":
        event.preventDefault();
        select(0);
        break;
      case "End":
        event.preventDefault();
        select(count - 1);
        break;
      default:
        break;
    }
  }

  const activeStage = stages[active];

  return (
    <div>
      <div className="scroll-x pb-2">
        <div
          role="tablist"
          aria-label="Cyber lab methodology stages"
          aria-orientation="horizontal"
          className="flex flex-col gap-3 md:min-w-max md:flex-row"
        >
          {stages.map((stage, i) => {
            const selected = i === active;
            return (
              <button
                key={stage.id}
                ref={(node) => {
                  tabRefs.current[i] = node;
                }}
                type="button"
                role="tab"
                id={`cyber-tab-${stage.id}`}
                aria-selected={selected}
                aria-controls={PANEL_ID}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={onKeyDown}
                className="tab flex min-h-[44px] flex-col gap-2 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-4 md:min-w-[160px] md:flex-1"
              >
                <span className="tab__index t-label">
                  {String(i + 1).padStart(2, "0")}
                  <span aria-hidden="true">
                    {" "}
                    / {String(count).padStart(2, "0")}
                  </span>
                </span>
                <span className="t-h3">{stage.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeStage ? (
        <div
          id={PANEL_ID}
          role="tabpanel"
          aria-labelledby={`cyber-tab-${activeStage.id}`}
          // A tabpanel is focusable by design (ARIA APG) so keyboard users
          // reach its content after the tablist.
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          className="mt-8 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8"
        >
          <h3 className="t-h3">{activeStage.headline}</h3>
          <p className="t-body mt-4 text-[var(--text-secondary)]">
            {activeStage.description}
          </p>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <p className="t-label">Tools</p>
              <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tools">
                {activeStage.tools.map((tool) => (
                  <li key={tool}>
                    <span className="chip">{tool}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="t-label">Capabilities</p>
              <ul
                className="mt-3 flex flex-wrap gap-2"
                aria-label="Capabilities"
              >
                {activeStage.capabilities.map((capability) => (
                  <li key={capability}>
                    <span className="chip">{capability}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <p className="t-label">Evidence</p>
            <ul className="mt-3 flex flex-col gap-3">
              {activeStage.evidence.map((item, i) => (
                <li key={`${item.source}-${item.ref}-${i}`}>
                  <EvidenceBody item={item} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <p className="t-caption mt-4">
        Educational. Describes method only; nothing here scans, probes or
        exploits anything.
      </p>
    </div>
  );
}

function EvidenceBody({ item }: { item: CyberEvidenceView }) {
  const inner = (
    <>
      <span className="t-data text-[var(--text-tertiary)]">
        {item.source}
        <span aria-hidden="true"> · </span>
        {item.ref}
      </span>
      <span className="t-small mt-1 block text-[var(--text-secondary)]">
        {item.text}
      </span>
    </>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        className="block rounded-[var(--radius-chip)] border-l border-[var(--border-strong)] py-1 pl-4 transition-colors duration-[var(--dur-micro)] hover:border-[var(--accent)]"
      >
        {inner}
      </a>
    );
  }

  return (
    <div className="border-l border-[var(--border-strong)] py-1 pl-4">
      {inner}
    </div>
  );
}
