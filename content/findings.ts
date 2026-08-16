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
      "Security misconfiguration in Kraken's desktop application. Bounty awarded.",
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
      "Prompt injection in an AI assistant surface, reported through Meta's bug bounty programme.",
    class: "LLM prompt injection → information disclosure",
    severity: "high",
    status: "Reported",
    disclosure: {
      public: true,
      basis: "program-permitted",
      note: "Organisation and class only. The impact description on the résumé is withheld here pending written approval from Meta — naming what was exposed is the part that programme terms restrict.",
    },
  },
  {
    id: "JKS-05",
    org: "Meta",
    summary:
      "Insecure direct object reference in Mapillary, reported through Meta's bug bounty programme.",
    class: "Broken object-level authorisation",
    severity: "medium",
    status: "Reported",
    disclosure: {
      public: true,
      basis: "program-permitted",
      note: "Organisation and class only, pending written disclosure approval.",
    },
  },
  {
    id: "JKS-06",
    org: "The NorthCap University",
    summary:
      "Cross-site scripting and a denial-of-service condition affecting the university website and ERP portal.",
    class: "Injection / availability",
    severity: "medium",
    status: "Reported to the university",
    disclosure: {
      public: false,
      reason:
        "Held back with JKS-07 until written authorisation for the testing is produced. Publishing findings against a named institution without documented permission invites the same questions as JKS-07, even where the finding itself is unremarkable.",
    },
  },
  {
    id: "JKS-07",
    org: "The NorthCap University",
    summary:
      "Administrative access to the biometric attendance system reachable over insecure network protocols.",
    class: "Insecure protocol / broken access control",
    severity: "high",
    status: "Reported to the university",
    disclosure: {
      public: false,
      reason:
        "WITHHELD ON LEGAL ADVICE. The résumé wording is 'gained unauthorised administrative access'. Published on a personal site that is an admission under India's IT Act §43 and §66 regardless of intent, and any employer's counsel will read it that way. Publish only if written authorisation to test exists, and then only reworded as authorised testing with a disclosure outcome.",
    },
  },
];

/** The only list any component may render. */
export const publicFindings = findings.filter((f) => f.disclosure.public);

export const withheldCount = findings.length - publicFindings.length;
