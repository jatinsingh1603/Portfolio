import type { Project } from "./schema";

export const projects: Project[] = [
  {
    slug: "tprm-platform",
    name: "AI-Powered Third-Party Risk Management Platform",
    category: "AI × Vendor risk automation",
    role: "Built and demonstrated",
    status: "Built and demonstrated",
    featured: true,
    stack: [
      "n8n",
      "AI agents",
      "Automated reconnaissance",
      "Vendor due diligence",
    ],
    summary:
      "An end-to-end vendor risk platform that replaces manual TPRM workflows. Onboarding, criticality tiering, technical due diligence and reporting run as a single automated pipeline, so a vendor assessment produces evidence rather than a returned questionnaire.",
    outcomes: [
      {
        label: "Vendor onboarding and criticality engine",
        detail:
          "AI agents collect vendor data and auto-populate risk profiles, removing the manual data entry that gates every assessment.",
      },
      {
        label: "Cyber due diligence scanner",
        detail:
          "Automated external assessment across 20+ parameters: SSL/TLS, SPF, DKIM, DMARC, security headers, vulnerability baseline, open ports and exposed services. The result is evidence independent of vendor self-attestation.",
      },
      {
        label: "Due diligence workflow",
        detail:
          "Automated security questionnaires with AI validation of vendor responses against uploaded documentation, flagging claims the evidence does not support.",
      },
    ],
    recognition:
      "Winner, Eclipse 6.0 Hackathon (Thapar Institute of Technology). 2nd place, Security domain, India Innovates Hackathon (Bharat Mandapam, Delhi Government).",
  },
  {
    slug: "cscrf-compliance",
    name: "AI-Powered SEBI CSCRF Compliance Platform",
    category: "AI × Regulatory compliance",
    role: "Built and demonstrated",
    status: "Built and demonstrated",
    stack: ["n8n", "AI agents", "GRC automation", "Regulatory compliance"],
    summary:
      "A compliance platform that lets an organisation assess and document its posture against the SEBI Cybersecurity and Cyber Resilience Framework. It maps analyst answers to control requirements directly, so the framework interpretation stops being the hard part.",
    outcomes: [
      {
        label: "Guided assessment",
        detail:
          "A structured questionnaire that maps each analyst response to specific CSCRF control requirements, removing framework-interpretation guesswork.",
      },
      {
        label: "Document intelligence",
        detail:
          "An agent ingests uploaded policy and evidence documents, extracts control mappings, and validates coverage against the controls claimed.",
      },
      {
        label: "Public data enrichment",
        detail:
          "An agent gathers publicly available organisational data to pre-fill details and cross-validate what the organisation discloses.",
      },
      {
        label: "Compliance scoring",
        detail:
          "A quantified alignment score against CSCRF controls that shows exactly where the organisation falls short, rather than a pass/fail.",
      },
    ],
    recognition:
      "2nd Runner Up, Sprint4Good Hackathon (NASSCOM Foundation × Cisco, IIT Delhi).",
  },
  {
    slug: "swiftpentest",
    name: "swiftPentest",
    category: "Autonomous security testing",
    role: "Contributor",
    status: "Active · open source",
    stack: [
      "Python 3",
      "Multi-agent systems",
      "Claude Code",
      "Docker",
      "SARIF",
    ],
    summary:
      "An open-source multi-agent system for web application security testing: a team of AI agents that finds real web vulnerabilities and proves them with control-contrast before it reports. Its safety model is structural rather than prompt-based, which is the part worth studying.",
    outcomes: [
      {
        label: "Safety enforced by structure, not by prompting",
        detail:
          "A scope.yaml with authorised: false by default gates every packet-sending stage. Detection-only by design: it confirms weaknesses and refuses exploitation. A hash-chained append-only audit log with secret redaction, five enforcement hooks, scope enforcement and target-output isolation.",
      },
      {
        label: "Planning instead of enumeration",
        detail:
          "Expected-value ranking of hypotheses over a technique knowledge graph, rather than running every check in a catalogue.",
      },
      {
        label: "Validation instead of assertion",
        detail:
          "Control-contrast plus N-of-M reproduction behind a ≥3/5 gate, so a finding is evidence rather than a model’s claim.",
      },
      {
        label: "Termination instead of completion",
        detail:
          "A coverage ledger over resolved hypotheses decides when testing is done. Eleven stages run as a DAG with convergence-bounded discovery loops, and the zero-packet passive phases run before any authorisation gate.",
      },
    ],
    repo: "https://github.com/swiftsaneai/swiftPentest",
    license: "MIT",
  },
];

export function projectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

const featured = projects.find((p) => p.featured);
if (!featured)
  throw new Error("content/projects.ts: mark one project featured");

/** The one project that gets the large presentation. */
export const featuredProject: Project = featured;
export const otherProjects = projects.filter((p) => p !== featuredProject);
