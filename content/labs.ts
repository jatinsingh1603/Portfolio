import type { AiScenario, AiStage, CyberStage } from "./schema";

/**
 * The two labs are educational walk-throughs of how the work is actually
 * done. Every tool and capability named below must exist in
 * content/career.ts — tests/unit/content.test.ts enforces it — and every
 * stage cites real work from the record. Nothing here executes anything.
 */
export const cyberLab: CyberStage[] = [
  {
    id: "recon",
    label: "Recon",
    headline: "Map the surface before touching it.",
    description:
      "Passive first. What is registered, what resolves, what is exposed, what the organisation says about itself — gathered without sending a packet the target would notice.",
    tools: ["Amass", "Shodan", "Nmap"],
    capabilities: ["Attack surface management"],
    evidence: [
      {
        source: "project",
        ref: "tprm-platform",
        text: "Automated external assessment across 20+ parameters — SSL/TLS, SPF, DKIM, DMARC, headers, open ports, exposed services — independent of vendor self-attestation.",
      },
      {
        source: "project",
        ref: "swiftpentest",
        text: "Zero-packet passive phases run before any authorisation gate.",
      },
    ],
  },
  {
    id: "discovery",
    label: "Discovery",
    headline: "Enumerate what is really there.",
    description:
      "Endpoints, parameters, services and versions. The proxy sees every request; the scanner catches the obvious; the interesting part is what neither flags.",
    tools: ["Burp Suite", "OWASP ZAP", "Nikto", "Postman", "Nmap"],
    capabilities: ["Web application security", "API security"],
    evidence: [
      {
        source: "role",
        ref: "Tinycrows Private Limited",
        text: "Tested client web applications with Burp Suite, OWASP ZAP and Nmap, manually verifying each issue.",
      },
    ],
  },
  {
    id: "analysis",
    label: "Analysis",
    headline: "Read the traffic. Read the logs. Form a hypothesis.",
    description:
      "Where a control should be and whether it is. Traffic and logs are the evidence; a hypothesis is a testable claim about a control, not a guess.",
    tools: ["Wireshark", "Burp Suite", "Tenable (Nessus)", "Qualys"],
    capabilities: ["Threat detection & log analysis"],
    evidence: [
      {
        source: "role",
        ref: "Tinycrows Private Limited",
        text: "Analysed security logs and recreated real attack scenarios for a major UPI provider, exposing detection blind spots.",
      },
    ],
  },
  {
    id: "exploitation",
    label: "Exploitation",
    headline: "Confirm impact. Inside scope. Under authorisation.",
    description:
      "Only what the authorisation covers, only far enough to prove the impact is real. On this site there are no proofs of concept and no reproduction steps — by design.",
    tools: ["Burp Suite", "Metasploit", "MobSF", "Genymotion"],
    capabilities: ["VAPT", "Mobile application security"],
    evidence: [
      {
        source: "credential",
        ref: "CRTP — Certified Red Team Professional",
        text: "Hands-on certification in Active Directory attacks and red team operations.",
      },
      {
        source: "finding",
        ref: "JKS-07",
        text: "Administrative interface of a biometric attendance system reachable over insecure protocols, identified under written authorisation.",
      },
    ],
  },
  {
    id: "validation",
    label: "Validation",
    headline: "A finding is evidence, not an assertion.",
    description:
      "Reproduce it. Contrast it against a control request that should behave differently. If it does not survive that, it is not reported.",
    tools: ["Burp Suite", "Postman", "Docker"],
    capabilities: ["Responsible disclosure", "Bug bounty hunting"],
    evidence: [
      {
        source: "project",
        ref: "swiftpentest",
        text: "Control-contrast plus N-of-M reproduction behind a ≥3/5 gate, so a finding is evidence rather than a model’s claim.",
      },
      {
        source: "finding",
        ref: "JKS-02",
        text: "Security misconfiguration in Kraken’s desktop application — resolved, $500 awarded.",
      },
    ],
  },
  {
    id: "defense",
    label: "Defense",
    headline: "Close the loop: remediation, detection, controls.",
    description:
      "The report names what was found, how serious it is and how to fix it. Then the gaps go into detection coverage and control mappings so the same class does not come back.",
    tools: ["Tenable (Nessus)", "Qualys", "Azure", "Git"],
    capabilities: ["Cloud security (Azure)", "Threat detection & log analysis"],
    evidence: [
      {
        source: "role",
        ref: "Tinycrows Private Limited",
        text: "Reviewed policies and controls against CSCRF, documenting gaps and remediation guidance; wrote evidence-based reports engineering and risk owners can act from.",
      },
    ],
  },
];

export const aiStages: AiStage[] = [
  {
    id: "input",
    label: "Input",
    description:
      "What arrives: a submission, a document set, a target in scope.",
  },
  {
    id: "llm",
    label: "AI / LLM",
    description: "Agents read it. Extraction, classification, hypothesis.",
  },
  {
    id: "reasoning",
    label: "Reasoning",
    description: "Claims are checked against evidence, not accepted.",
  },
  {
    id: "automation",
    label: "Automation",
    description:
      "n8n or a DAG carries the work between stages without a human relay.",
  },
  {
    id: "action",
    label: "Security action",
    description:
      "The step that touches the real world, gated by scope and authorisation.",
  },
  {
    id: "result",
    label: "Result",
    description:
      "An artefact someone can act on: a score, a report, a decision.",
  },
];

export const aiScenarios: AiScenario[] = [
  {
    id: "tprm",
    label: "Vendor risk",
    source: {
      source: "project",
      ref: "tprm-platform",
      text: "AI-Powered Third-Party Risk Management Platform",
    },
    steps: [
      "Vendor profile, questionnaire answers and uploaded documentation",
      "AI agents collect vendor data and auto-populate the risk profile",
      "Answers are validated against the documents; claims the evidence does not support are flagged",
      "Onboarding → criticality tiering → due diligence → reporting, as one pipeline",
      "External assessment across 20+ parameters, gathered without vendor input",
      "An evidence-backed risk position instead of a returned questionnaire",
    ],
  },
  {
    id: "cscrf",
    label: "SEBI CSCRF",
    source: {
      source: "project",
      ref: "cscrf-compliance",
      text: "AI-Powered SEBI CSCRF Compliance Platform",
    },
    steps: [
      "Analyst responses plus policy and evidence documents",
      "A document-intelligence agent extracts control mappings from what was uploaded",
      "Claimed controls are compared with the evidence found; public data cross-validates disclosures",
      "A guided assessment maps every response to a specific CSCRF control requirement",
      "Coverage validation against the SEBI Cybersecurity and Cyber Resilience Framework",
      "A quantified alignment score with the gaps named, not a pass/fail",
    ],
  },
  {
    id: "merchant",
    label: "Merchant onboarding",
    source: {
      source: "role",
      ref: "Tinycrows Private Limited",
      text: "AI merchant risk tool for an Indian fintech bank",
    },
    steps: [
      "A merchant onboarding submission",
      "Automated checks replace the manual due-diligence review",
      "Approval rules decide what passes and what needs a person",
      "The whole flow runs in n8n",
      "Risk checks and approvals for an Indian fintech bank",
      "Decisions land faster with less analyst load",
    ],
  },
  {
    id: "swiftpentest",
    label: "swiftPentest",
    source: {
      source: "project",
      ref: "swiftpentest",
      text: "Open-source multi-agent web application security testing",
    },
    steps: [
      "A target scope — scope.yaml with authorised: false by default",
      "A team of AI agents, with class-specific specialists testing hypotheses",
      "Expected-value ranking over a technique knowledge graph, rather than running every check",
      "Eleven stages as a DAG with convergence-bounded discovery loops",
      "Detection-only testing behind the authorisation gate; control-contrast validation at ≥3/5",
      "A SARIF 2.1.0 report with a hash-chained, secret-redacted audit log",
    ],
  },
];
