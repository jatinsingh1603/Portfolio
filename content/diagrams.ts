import type { Stage } from "@/components/pipeline-diagram";

/**
 * Each diagram is the project’s own pipeline, transcribed. Nothing here is
 * invented for visual effect — if a stage is not described in content/projects.ts
 * it does not appear.
 */
export const diagrams: Record<
  string,
  { title: string; description: string; stages: Stage[] }
> = {
  "tprm-platform": {
    title: "TPRM assessment pipeline",
    description:
      "Vendor intake through to a risk report, with external evidence gathered independently of what the vendor claims.",
    stages: [
      { label: "Intake", note: "Agents populate the vendor profile" },
      { label: "Tiering", note: "Criticality assigned from profile" },
      { label: "External scan", note: "20+ parameters, no vendor input" },
      { label: "Questionnaire", note: "AI validates answers vs. documents" },
      { label: "Report", note: "Evidence-backed risk position" },
    ],
  },
  "cscrf-compliance": {
    title: "CSCRF compliance pipeline",
    description:
      "Analyst answers and uploaded evidence are mapped to SEBI CSCRF controls, then scored for coverage.",
    stages: [
      { label: "Assessment", note: "Responses map to control requirements" },
      { label: "Documents", note: "Agent extracts control mappings" },
      { label: "Enrichment", note: "Public data cross-validates disclosures" },
      { label: "Coverage", note: "Claimed controls vs. evidence found" },
      { label: "Score", note: "Quantified alignment, with the gaps named" },
    ],
  },
  swiftpentest: {
    title: "swiftPentest safety and validation model",
    description:
      "Passive phases send zero packets and run before the authorisation gate; findings must survive control-contrast before they are reported.",
    stages: [
      { label: "Passive recon", note: "Zero packets sent to the target" },
      { label: "scope.yaml", note: "authorised: false by default", gate: true },
      { label: "Active recon", note: "Only past the gate" },
      { label: "Correlation", note: "Findings into a knowledge graph" },
      { label: "EV ranking", note: "Hypotheses ranked, not enumerated" },
      { label: "Specialists", note: "Class-specific agents test hypotheses" },
      {
        label: "Validation",
        note: "Control-contrast, ≥3/5 to pass",
        gate: true,
      },
      { label: "Ledger", note: "Coverage decides termination" },
      { label: "SARIF 2.1.0", note: "Report with hash-chained audit log" },
    ],
  },
};
