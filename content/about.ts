/**
 * The story, told from the record. Every sentence traces to content/career.ts,
 * content/findings.ts, content/projects.ts or content/site.ts — nothing here
 * is a claim those files do not already make.
 */
export const about = {
  chapters: [
    {
      id: "education",
      label: "Education",
      text: "B.Tech in Computer Science & Engineering at The NorthCap University, Gurugram, 2023 to 2027, CGPA 8.39. The university was also a system I tested under written authorisation: cross-site scripting and a denial-of-service condition in its website and ERP portal, and an administrative interface of the biometric attendance system reachable over insecure protocols, both reported to the university.",
    },
    {
      id: "security",
      label: "Security",
      text: "Responsible disclosure followed. A DOM-based cross-site scripting flaw on IRCTC, reported through CERT-In and acknowledged by them. A session that persisted after logout in a third-party application using Google SSO, reported via Google Bug Hunters. A prompt injection in an AI assistant surface and an insecure direct object reference in Mapillary, both accepted by Meta. A misconfiguration in Kraken’s desktop application, which earned a $500 bounty. CRTP from Altered Security validated the hands-on Active Directory attack and red-team side.",
    },
    {
      id: "ai",
      label: "AI",
      text: "The AI work began as a security question: can an agent gather evidence a vendor’s self-attestation cannot? The AI-Powered Third-Party Risk Management platform answered it with an automated external assessment across 20+ parameters, and won Eclipse 6.0 at Thapar and second place in the Security domain at India Innovates. The SEBI CSCRF Compliance platform applied the same idea to regulatory controls and took 2nd Runner Up at Sprint4Good, run by NASSCOM Foundation and Cisco at IIT Delhi.",
    },
    {
      id: "automation",
      label: "Automation",
      text: "In production that became n8n: an automated merchant-onboarding system for an Indian fintech bank that replaced manual due diligence with automated checks and approvals. In open source it became swiftPentest, a multi-agent web application security tester I contribute to, whose safety model is enforced by structure rather than by prompting.",
    },
    {
      id: "now",
      label: "Now",
      text: "Information Security Analyst at Tinycrows Private Limited since June 2025. Cleared the OFFPST and OLPST examinations and the Personal Interaction Session under CERT-In empanelment requirements. Analysing detection coverage for a major UPI provider, testing client web applications, assessing controls against SEBI CSCRF, and designing security automation that reduces manual effort in third-party risk, vendor due diligence and regulatory compliance.",
    },
  ],
  /** What the work is pointed at right now. Short, checkable against the record. */
  focus: [
    "Application security testing and evidence-based reporting",
    "AI agents that validate claims against documents and external scans",
    "n8n automation for vendor risk, merchant onboarding and GRC",
    "SEBI CSCRF and CERT-In empanelment requirements",
  ],
} as const;
