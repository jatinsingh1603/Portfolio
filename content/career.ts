import type { Award, CapabilityGroup, Credential, Role } from "./schema";

/**
 * Title note: the résumé reads "Information Security Analyst", the LinkedIn
 * headline reads "Application Security Intern". This file is the single source
 * of truth — change it here and it changes everywhere, including JSON-LD.
 */
export const roles: Role[] = [
  {
    title: "Information Security Analyst",
    company: "Tinycrows Private Limited",
    arrangement: "Hybrid",
    start: "June 2025",
    end: "Present",
    highlights: [
      {
        label: "CERT-In empanelment — OFFPST, OLPST and PIS",
        detail:
          "Cleared the OFFPST and OLPST examinations and the Personal Interaction Session conducted under CERT-In empanelment requirements, validating hands-on offensive security competency at a national level and securing CERT-In empanelment for Tinycrows.",
      },
      {
        label: "Threat detection",
        detail:
          "Analysed security logs and recreated real attack scenarios for a major UPI provider, exposing detection blind spots and strengthening their threat detection coverage.",
      },
      {
        label: "AI merchant risk tool",
        detail:
          "Built an automated merchant onboarding system in n8n for an Indian fintech bank, replacing manual due diligence with automated checks and approvals, so decisions land faster with less analyst load.",
      },
      {
        label: "GRC assessments",
        detail:
          "Reviewed company security policies and controls against CSCRF and internal compliance standards, documenting gaps and remediation guidance to confirm compliance readiness.",
      },
      {
        label: "Web penetration testing",
        detail:
          "Tested client web applications with Burp Suite, OWASP ZAP and Nmap, manually verifying each issue and reporting confirmed vulnerabilities with remediation steps.",
      },
      {
        label: "Security reporting",
        detail:
          "Wrote evidence-based reports explaining what was found, how serious it is and how to fix it, so engineering and risk owners can act from a single document.",
      },
    ],
  },
];

export const awards: Award[] = [
  {
    placement: "Winner",
    event: "Eclipse 6.0 Hackathon",
    organiser: "Thapar Institute of Technology",
    projectSlug: "tprm-platform",
  },
  {
    placement: "2nd Runner Up",
    event: "Sprint4Good Hackathon",
    organiser: "NASSCOM Foundation × Cisco",
    venue: "IIT Delhi",
    projectSlug: "cscrf-compliance",
  },
  {
    placement: "2nd Place, Security",
    event: "India Innovates Hackathon",
    organiser: "Delhi Government",
    venue: "Bharat Mandapam, Delhi",
    projectSlug: "tprm-platform",
  },
];

export const capabilities: CapabilityGroup[] = [
  {
    label: "Security",
    items: [
      "VAPT",
      "Web application security",
      "API security",
      "Mobile application security",
      "Payment & PoS security",
      "Attack surface management",
      "Threat detection & log analysis",
      "Responsible disclosure",
      "Bug bounty hunting",
      "Cloud security (Azure)",
    ],
  },
  {
    label: "AI & automation",
    items: [
      "n8n workflow automation",
      "AI agent design",
      "LLM integration",
      "GRC automation",
      "Compliance scoring pipelines",
      "Vendor risk automation",
    ],
  },
  {
    label: "Tools",
    items: [
      "Burp Suite",
      "Nmap",
      "Metasploit",
      "OWASP ZAP",
      "Shodan",
      "Wireshark",
      "Tenable (Nessus)",
      "Qualys",
      "Docker",
      "MobSF",
      "Genymotion",
      "Postman",
      "Amass",
      "Nikto",
      "Azure",
      "Git",
    ],
  },
  {
    label: "Frameworks & standards",
    items: [
      "OWASP Top 10",
      "SEBI CSCRF",
      "CERT-In empanelment",
      "ISO 27001 (conceptual)",
      "NIST",
    ],
  },
];

export const credentials: Credential[] = [
  {
    name: "CRTP — Certified Red Team Professional",
    issuer: "Altered Security",
    detail:
      "Hands-on certification in Active Directory attacks and red team operations.",
    // verifyUrl intentionally absent — no badge is shown without a real
    // credential URL to link it to. The LinkedIn listing is the public record;
    // content/achievements.ts attaches it, so this module stays loadable by
    // plain Node in scripts/generate-static-files.mjs.
  },
];

export const education = {
  degree: "B.Tech, Computer Science & Engineering",
  institution: "The NorthCap University, Gurugram",
  start: "2023",
  end: "2027",
  detail: "CGPA 8.39",
} as const;
