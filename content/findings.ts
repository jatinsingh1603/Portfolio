import type { Finding } from "./schema";

/**
 * The disclosure record. Read content/schema.ts before adding to this list.
 *
 * RULE: only entries with `disclosure.public === true` are ever rendered. Add
 * a withheld entry rather than deleting it — the reason is part of the record,
 * and it stops the same item being re-added later by someone without context.
 */
export const findings: Finding[] = [
  {
    id: "JKS-01",
    org: "IRCTC",
    summary:
      "DOM-based cross-site scripting, reported through CERT-In and acknowledged by them.",
    class: "DOM-based cross-site scripting",
    severity: "high",
    status: "Acknowledged by CERT-In",
    disclosure: {
      public: true,
      basis: "publicly-acknowledged",
      note: "CERT-In issued a public acknowledgement. No endpoint, payload or reproduction detail is published: the affected system is national infrastructure.",
    },
  },
  {
    id: "JKS-02",
    org: "Kraken",
    summary:
      "Security misconfiguration in Kraken’s desktop application. Bounty awarded.",
    class: "Security misconfiguration",
    severity: "high",
    status: "Resolved",
    bounty: "$500 awarded",
    disclosure: {
      public: true,
      basis: "program-permitted",
      note: "Organisation, class and outcome only. Impact detail and reproduction steps are withheld pending written disclosure approval from the programme.",
    },
  },
  {
    id: "JKS-03",
    org: "Google",
    summary:
      "Session persisted after logout in a third-party application using Google SSO, allowing continued access.",
    class: "Session management / improper logout",
    severity: "medium",
    status: "Reported",
    disclosure: {
      public: true,
      basis: "program-permitted",
      note: "Reported via Google Bug Hunters. The affected application is not named.",
    },
  },
  {
    id: "JKS-04",
    org: "Meta",
    summary:
      "Prompt injection in an AI assistant surface, reported through Meta’s bug bounty programme.",
    class: "LLM prompt injection → information disclosure",
    severity: "high",
    status: "Reported",
    disclosure: {
      public: true,
      basis: "program-permitted",
      note: "Organisation and class only. The impact description on the résumé is withheld pending written approval from Meta, since naming what was exposed is the part programme terms restrict.",
    },
  },
  {
    id: "JKS-05",
    org: "Meta",
    summary:
      "Insecure direct object reference in Mapillary, reported through Meta’s bug bounty programme.",
    class: "Broken object-level authorisation",
    severity: "medium",
    status: "Reported",
    disclosure: {
      public: true,
      basis: "program-permitted",
      note: "Organisation and class only, pending written disclosure approval.",
    },
  },
  /**
   * JKS-06 and JKS-07 are published on the owner’s confirmation that written
   * authorisation to test was held. Both are worded as authorised testing with
   * a disclosure outcome — never as "gained unauthorised access", which reads
   * as an admission under India’s IT Act §43/§66 whatever the intent was. Keep
   * the authorisation on file; if it cannot be produced, set these back to
   * public: false rather than rewording them again.
   */
  {
    id: "JKS-06",
    org: "The NorthCap University",
    summary:
      "Cross-site scripting and a denial-of-service condition in the university website and ERP portal, found during authorised testing.",
    class: "Injection / availability",
    severity: "medium",
    status: "Reported to the university",
    disclosure: {
      public: true,
      basis: "vendor-approved",
      note: "Tested under written authorisation from the university. No endpoint or reproduction detail is published.",
    },
  },
  {
    id: "JKS-07",
    org: "The NorthCap University",
    summary:
      "Administrative interface of the biometric attendance system reachable over insecure network protocols, identified during authorised testing.",
    class: "Insecure protocol / broken access control",
    severity: "high",
    status: "Reported to the university",
    disclosure: {
      public: true,
      basis: "vendor-approved",
      note: "Tested under written authorisation from the university. The affected protocol, interface and reproduction steps are withheld.",
    },
  },
];

/** The only list any component may render. */
export const publicFindings = findings.filter((f) => f.disclosure.public);

export const withheldCount = findings.length - publicFindings.length;
