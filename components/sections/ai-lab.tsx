import { Station } from "@/components/primitives";
import { aiScenarios, aiStages } from "@/content/labs";
import type { LabEvidence } from "@/content/schema";
import { AiLabClient } from "./ai-lab-client";

/**
 * Station 06. The same staged model — input, reasoning, a gated action, a
 * result — is shown running under four real automations. Data (stages,
 * scenarios, resolved source links) is resolved here in the server component;
 * the interactive scenario selector and the animated chain live in a small
 * client sibling that receives everything as plain props.
 */

/** A scenario's source is either a project (→ its sheet) or the role (→ résumé). */
function sourceHref(source: LabEvidence): string {
  return source.source === "project" ? `/projects/${source.ref}` : "/resume";
}

/**
 * Colour law on the chain: AI/LLM (index 1) and Reasoning (index 2) are
 * machine reasoning → amber; the Security action (index 4) is the security
 * signal → teal. Every other stage keeps the hairline border.
 */
const TONE_BY_INDEX: Record<number, "amber" | "teal"> = {
  1: "amber",
  2: "amber",
  4: "teal",
};

export function AiLab() {
  const stages = aiStages.map((stage, index) => ({
    id: stage.id,
    index,
    label: stage.label,
    description: stage.description,
    tone: TONE_BY_INDEX[index] ?? null,
  }));

  const scenarios = aiScenarios.map((scenario) => ({
    id: scenario.id,
    label: scenario.label,
    steps: scenario.steps,
    sourceText: scenario.source.text,
    sourceHref: sourceHref(scenario.source),
  }));

  return (
    <Station
      index={6}
      id="ai-lab"
      eyebrow="AI automation lab"
      zone="amber"
      title="Where a prompt becomes a security action."
      lede="One staged model — input, reasoning, a gated action, a result — runs under every automation here, so a prompt turns into something a security team can act on."
    >
      <AiLabClient stages={stages} scenarios={scenarios} />
    </Station>
  );
}
