import { Station } from "@/components/primitives";
import { cyberLab } from "@/content/labs";
import { publicFindings } from "@/content/findings";
import { CyberLabClient, type CyberStageView } from "./cyber-lab-client";

/**
 * Station 05 — Cyber lab. An educational walk-through of the six-stage
 * methodology. The server resolves every evidence reference to a real route
 * (a project sheet, a finding sheet or the résumé) and hands the client a
 * plain, serialisable array; the client renders the ARIA tablist. Nothing
 * here scans, probes or exploits anything.
 */
export function CyberLab() {
  const stages: CyberStageView[] = cyberLab.map((stage) => ({
    id: stage.id,
    label: stage.label,
    headline: stage.headline,
    description: stage.description,
    tools: [...stage.tools],
    capabilities: [...stage.capabilities],
    evidence: stage.evidence.map((item) => ({
      source: item.source.toUpperCase(),
      ref: item.ref,
      text: item.text,
      href: hrefFor(item.source, item.ref),
    })),
  }));

  return (
    <Station
      index={5}
      id="cyber-lab"
      eyebrow="Cyber lab"
      title="Six stages, real tools, no live fire."
      lede="An educational walk-through of the methodology, stage by stage. Nothing here scans, probes or exploits anything — it only describes how the work is done."
      zone="teal"
    >
      <CyberLabClient stages={stages} />
    </Station>
  );
}

/** Resolve an evidence reference to an internal route, or null when none maps. */
function hrefFor(
  source: "role" | "project" | "finding" | "credential",
  ref: string,
): string | null {
  switch (source) {
    case "project":
      return `/projects/${ref}`;
    case "finding": {
      const finding = publicFindings.find((f) => f.id === ref);
      return finding ? `/security/${finding.slug}` : null;
    }
    case "role":
    case "credential":
      return "/resume";
    default:
      return null;
  }
}
