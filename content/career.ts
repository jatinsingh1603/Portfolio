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
        label: "CERT-In empanelment",
        detail:
          "Secured CERT-In empanelment for Tinycrows by clearing the OFFPST and OLPST examinations and the Personal Interaction Session (PIS), validating hands-on offensive security competency at a national level.",
      },
      {
        label: "Threat detection",
        detail:
          "Strengthened threat detection coverage for a major UPI provider by analysing security logs and recreating real attack scenarios that exposed detection blind spots.",
      },
      {
        label: "AI merchant risk tool",
        detail:
          "Replaced manual merchant due diligence for an Indian fintech bank with an n8n-based onboarding system that automates checks and approvals, delivering faster decisions and reducing analyst workload.",
      },
      {
        label: "GRC assessments",
        detail:
          "Confirmed compliance readiness by reviewing security policies and controls against CSCRF and internal standards, documenting gaps with remediation guidance.",
      },
      {
        label: "Web penetration testing",
        detail:
          "Tested client web applications with Burp Suite, OWASP ZAP and Nmap, manually verifying each finding and reporting confirmed vulnerabilities with remediation steps.",
      },
      {
        label: "Security reports",
        detail:
          "Enabled engineering and risk owners to act from a single document by writing clear, evidence-based reports covering findings, severity and fixes.",
      },
    ],
  },
];

export const awards: Award[] = [
  {
    placement: "Winner",
    event: "Eclipse 6.0 Hackathon",
    organiser: "Thapar Institute of Engineering & Technology",
    projectSlug: "tprm-platform",
  },
  {
    placement: "2nd Runner-Up",
    event: "Sprint4Good Hackathon",
    organiser: "NASSCOM Foundation and Cisco",
    venue: "IIT Delhi",
    projectSlug: "cscrf-compliance",
  },
  {
    placement: "2nd Place, Security Domain",
    event: "India Innovates Hackathon",
    organiser: "Delhi Government",
    venue: "Bharat Mandapam, Delhi",
    projectSlug: "tprm-platform",
  },
  {
    placement: "7th Place",
    event: "GenCyS 2.0 CTF",
    organiser: "UST",
    evidence: {
      label: "Owner-supplied résumé",
      href: "/resume/Jatin-Kumar-Singh-Resume.pdf",
    },
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
      "Red teaming",
      "Active Directory exploitation",
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
      "Agentic workflows",
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
      "Azure (VMs, budget controls)",
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

/** Credentials transcribed from the owner-supplied October 2026 résumé. */
export const credentials: Credential[] = [
  {
    name: "Certified Red Team Professional (CRTP)",
    issuer: "Altered Security",
    detail:
      "Hands-on certification in Active Directory attacks and red team operations.",
  },
  {
    name: "Jr. Penetration Tester",
    issuer: "TryHackMe",
  },
  {
    name: "CompTIA PenTest+ Learning Path",
    issuer: "TryHackMe",
  },
  {
    name: "E-Business",
    issuer: "NPTEL",
  },
  {
    name: "Information Security - Secure System Engineering",
    issuer: "NPTEL",
  },
  {
    name: "DSA with C",
    issuer: "Ducat India",
  },
];

export const education = {
  degree: "Bachelor of Technology (B.Tech), Computer Science and Engineering",
  institution: "The NorthCap University, Gurugram, India",
  specialization: "Cyber Security",
  start: "2023",
  end: "2027",
  expected: true,
  detail: "CGPA 8.31",
} as const;

export const secondaryEducation = [
  {
    degree: "Senior Secondary (Class XII), CBSE",
    institution: "Mata Bhatee Devi Public School",
    year: "2023",
    detail: "87%",
  },
  {
    degree: "Secondary (Class X), CBSE",
    institution: "Modern International School",
    year: "2021",
    detail: "78%",
  },
] as const;
