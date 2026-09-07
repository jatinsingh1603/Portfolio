"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

type Stage = {
  id: string;
  index: number;
  label: string;
  description: string;
  tone: "amber" | "teal" | null;
};

type Scenario = {
  id: string;
  label: string;
  steps: string[];
  sourceText: string;
  sourceHref: string;
};

const toneColor = (tone: Stage["tone"]): string =>
  tone === "amber"
    ? "var(--accent-2)"
    : tone === "teal"
      ? "var(--accent)"
      : "var(--border-strong)";

const pad = (n: number): string => String(n + 1).padStart(2, "0");

/**
 * Fades its children in on mount. Remounted by a `key` on the caller, so
 * every scenario change crossfades the step text and the source line. Under
 * reduced motion the transition is neutralised in globals.css, so it simply
 * appears.
 */
function Fade({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <span
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transition: "opacity var(--dur-fast) var(--ease-out)",
      }}
    >
      {children}
    </span>
  );
}

/**
 * Scenario selector (an ARIA tablist with roving tabindex + arrow keys) over a
 * six-stage chain. Selecting a scenario crossfades every stage's step text and
 * the source line; a pulse travels the chain once when it reveals.
 */
export function AiLabClient({
  stages,
  scenarios,
}: {
  stages: Stage[];
  scenarios: Scenario[];
}) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const chainRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = chainRef.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      { threshold: 0.01, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const select = (index: number) => {
    setActive(index);
    tabRefs.current[index]?.focus();
  };

  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const count = scenarios.length;
    let next: number | null = null;
    if (event.key === "ArrowRight") next = (index + 1) % count;
    else if (event.key === "ArrowLeft") next = (index - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    if (next === null) return;
    event.preventDefault();
    select(next);
  };

  const current = scenarios[active];
  if (!current) return null;
  const state = revealed ? "in" : "out";

  return (
    <div>
      <div className="scroll-x pb-1">
        <div
          role="tablist"
          aria-label="Automation scenario"
          aria-orientation="horizontal"
          className="flex gap-3"
        >
          {scenarios.map((scenario, index) => (
            <button
              key={scenario.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`ai-lab-tab-${scenario.id}`}
              aria-selected={index === active}
              aria-controls="ai-lab-panel"
              tabIndex={index === active ? 0 : -1}
              onClick={() => select(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className="tab tab--amber panel flex min-h-[44px] shrink-0 items-center gap-3 px-4 py-3"
            >
              <span className="tab__index t-data">{pad(index)}</span>
              <span
                className="t-label"
                style={{ color: "var(--text-secondary)" }}
              >
                {scenario.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div
        ref={chainRef}
        id="ai-lab-panel"
        role="tabpanel"
        aria-labelledby={`ai-lab-tab-${current.id}`}
        data-reveal={state}
        className="mt-8"
      >
        <ol className="perspective m-0 grid list-none gap-3 p-0 md:grid-cols-6">
          {stages.map((stage) => {
            const step = current.steps[stage.index];
            const color = toneColor(stage.tone);
            return (
              <li
                key={stage.id}
                data-reveal={state}
                className="reveal-rotate panel flex flex-col gap-2 p-4"
                style={{
                  borderTopWidth: "2px",
                  borderTopColor: color,
                  transitionDelay: `${stage.index * 60}ms`,
                }}
              >
                {/* A border token is a line colour, never a text colour. */}
                <span
                  className="t-data"
                  style={{
                    color:
                      color === "var(--border-strong)"
                        ? "var(--text-tertiary)"
                        : color,
                  }}
                >
                  {pad(stage.index)}
                </span>
                <span className="t-label">{stage.label}</span>
                <span className="t-caption">{stage.description}</span>
                {step ? (
                  <Fade key={current.id} className="t-small mt-1 block">
                    {step}
                  </Fade>
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className="pulse-track mt-5 hidden md:block" aria-hidden="true" />

        <p className="t-small mt-6">
          <span className="t-label mr-2">Source</span>
          <Fade key={current.id}>
            <a
              href={current.sourceHref}
              className="text-[var(--accent)] underline-offset-4 hover:underline"
            >
              {current.sourceText}
            </a>
          </Fade>
        </p>
      </div>
    </div>
  );
}
