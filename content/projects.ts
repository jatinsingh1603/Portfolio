import type { Project } from "./schema";

export const projects: Project[] = [
  {
    slug: "tprm-platform",
    name: "AI-Powered Third-Party Risk Management Platform",
    category: "AI × Vendor risk automation",
    role: "Built and demonstrated",
    status: "Built · January–July 2026",
    featured: true,
    stack: [
      "n8n",
      "JavaScript",
      "AI agents",
      "Agentic workflows",
      "Automated reconnaissance",
      "Vendor due diligence",
    ],
    summary:
      "An end-to-end vendor risk platform that replaces manual TPRM workflows. Onboarding, criticality tiering, technical due diligence and reporting run as a single automated pipeline, so a vendor assessment produces evidence rather than a returned questionnaire.",
    outcomes: [
      {
        label: "Vendor onboarding",
        detail:
          "AI agents collect vendor data and auto-populate risk profiles, removing the manual data entry that gates every assessment.",
      },
      {
        label: "Criticality engine",
        detail:
          "Tiers vendors by business impact, data access and regulatory exposure, focusing assessment effort on the highest-exposure vendors.",
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
      {
        label: "Reporting",
        detail:
          "Generates per-vendor risk scorecards with prioritised remediation and audit trails.",
      },
    ],
    recognition:
      "Winner, Eclipse 6.0 Hackathon (Thapar Institute of Engineering & Technology). 2nd place, Security domain, India Innovates Hackathon (Bharat Mandapam, Delhi Government).",
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
    category: "Agentic penetration testing",
    role: "Contributor",
    status: "Active · August 2026 to present",
    stack: ["Python", "Shell", "Dockerfile"],
    summary:
      "An AI-driven web application penetration testing platform with 12+ specialised agents. It automates reconnaissance, vulnerability hypothesis generation, validation and reporting, with authorisation controls and reproducible evidence.",
    outcomes: [
      {
        label: "Validation engine",
        detail:
          "Compares control and test results and requires a minimum 3/5 reproduction gate, preventing unverified AI-generated findings from reaching final reports.",
      },
      {
        label: "99 integrated tools",
        detail:
          "Integrates 99 security and reconnaissance tools into a reproducible Docker-based environment, reducing manual setup and keeping assessments consistent.",
      },
      {
        label: "Attack prioritisation",
        detail:
          "Ranks vulnerability hypotheses by probability, impact, exploit-chain potential and testing cost to focus effort on higher-value attack surfaces.",
      },
      {
        label: "Coverage and audit controls",
        detail:
          "Tracks coverage and maintains audit logs, SARIF reports and authorisation controls so automated security testing remains transparent and auditable.",
      },
    ],
    repo: "https://github.com/swiftsaneai/swiftPentest",
    demo: "https://swiftpentest.swiftsane.com",
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
