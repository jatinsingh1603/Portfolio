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
    slug: "irctc-dom-xss",
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
    slug: "kraken-desktop-misconfiguration",
    org: "Kraken",
    summary:
      "Critical security misconfiguration in Kraken’s desktop application. Bounty awarded.",
    class: "Security misconfiguration",
    severity: "critical",
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
    slug: "google-sso-session-persistence",
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
    evidence: {
      label: "Google Bug Hunters profile",
      href: "https://bughunters.google.com/profile/3645d13e-669c-4a4e-a8b1-b32d9b75b4d7",
    },
  },
  {
    id: "JKS-04",
    slug: "meta-ai-prompt-injection",
    org: "Meta",
    summary:
      "Prompt injection in an AI assistant surface, reported through Meta’s bug bounty programme.",
    class: "LLM prompt injection / information disclosure",
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
    slug: "mapillary-idor",
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
    slug: "northcap-web-erp",
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
    slug: "northcap-biometric-access",
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
  {
    id: "JKS-08",
    slug: "blinkit-apk-arbitrary-file-read",
    org: "Blinkit",
    summary:
      "Arbitrary file read in Blinkit’s Android application, recognised with a $1,500 bounty.",
    class: "Arbitrary file read",
    severity: "unrated",
    status: "Bounty awarded",
    bounty: "$1,500 awarded",
    disclosure: {
      public: true,
      basis: "owner-supplied",
      note: "High-level résumé summary published at the portfolio owner’s request. No endpoint, payload, personal data or reproduction detail is published. A severity rating is not specified in the supplied record.",
    },
  },
  {
    id: "JKS-09",
    slug: "google-chrome-devtools-mcp-acl-bypass",
    org: "Google",
    summary:
      "Access-control and redirect-validation bypass in Chrome DevTools MCP, reported to and acknowledged by Google. A fix was submitted in a pull request at Google’s request.",
    class: "Access control / redirect validation bypass",
    severity: "unrated",
    status: "Acknowledged by Google",
    disclosure: {
      public: true,
      basis: "owner-supplied",
      note: "High-level résumé summary published at the portfolio owner’s request. The fix was submitted as a pull request; merge and release status are not asserted. No endpoint, payload or reproduction detail is published. A severity rating is not specified in the supplied record.",
    },
  },
  {
    id: "JKS-10",
    slug: "meesho-apk-arbitrary-code-injection",
    org: "Meesho",
    summary:
      "Arbitrary code injection identified in Meesho’s Android application.",
    class: "Arbitrary code injection",
    severity: "unrated",
    status: "Identified",
    disclosure: {
      public: true,
      basis: "owner-supplied",
      note: "High-level résumé summary published at the portfolio owner’s request. No bounty, vendor acknowledgement or severity rating is recorded. No endpoint, payload or reproduction detail is published.",
    },
  },
];

/** The only list any component may render. */
export const publicFindings = findings.filter((f) => f.disclosure.public);

export const withheldCount = findings.length - publicFindings.length;
