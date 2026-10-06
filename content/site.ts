/**
 * Identity and site-level constants. Nothing here is duplicated in JSX.
 */

/**
 * Canonical production origin. Deployments may override this when required.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://jatin.swiftsane.com";

export const identity = {
  name: "Jatin Kumar Singh",
  shortName: "Jatin Singh",
  title: "Information Security Analyst",
  location: "Delhi, India",
  email: "singhjatin1603@gmail.com",
  resumePdf: "/resume/Jatin-Kumar-Singh-Resume.pdf",
  headshot: "/images/jatin.png",
  headshotAlt:
    "Jatin Kumar Singh, photographed against a plain background, facing the camera",
  /**
   * Phone number appears on the résumé PDF only. §4.1: publishing it as text
   * gets it scraped within a week, and the PDF already carries it for anyone
   * who actually needs to call.
   */
  phoneInHtml: false,
} as const;

/** Contribution recorded in the owner-supplied résumé; no merge is claimed. */
export const googleMcpContribution = {
  title: "Chrome DevTools MCP",
  role: "Open-source contributor",
  summary:
    "Reported an access-control bypass in Google's Chrome DevTools MCP, received appreciation, and submitted a pull request with a fix at Google's request.",
  evidence: {
    label: "Owner-supplied résumé",
    href: identity.resumePdf,
  },
} as const;

export const positioning = {
  intro:
    "I test application security and build AI-driven automation for security assessments, vendor due diligence and compliance.",
  /** Long form, used on /resume and in the llms.txt summary. */
  statement:
    "Cybersecurity professional specialising in application security, VAPT and AI-driven security automation. CRTP certified by Altered Security, with hands-on skills in Active Directory attacks and red team operations. Recognised by Google, CERT-In, Kraken and Blinkit for responsible disclosure, and an authorised open-source contributor to Google's Chrome DevTools MCP. Currently building n8n-based platforms that reduce manual effort in third-party risk management, vendor due diligence and SEBI CSCRF compliance.",
} as const;

export const nav = [
  { label: "Story", href: "/#about" },
  { label: "Work", href: "/#work" },
  { label: "Research", href: "/security" },
  { label: "Labs", href: "/labs" },
  { label: "Contact", href: "/#ms-contact" },
] as const;

/** §5.2 — text only. Company logos would read as endorsement and are trademarks. */
export const recognitions = [
  {
    org: "Blinkit",
    detail:
      "Awarded a $1,500 bounty for identifying an arbitrary file read vulnerability in the Blinkit APK.",
  },
  {
    org: "Google",
    detail: `Reported a persistent session flaw in a third-party application using Google SSO. ${googleMcpContribution.summary}`,
  },
  {
    org: "CERT-In",
    detail:
      "Acknowledged and recognised for a DOM-based cross-site scripting finding on IRCTC.",
  },
  {
    org: "Meta",
    detail:
      "Reported prompt injection in Meta AI and an access-control vulnerability in Mapillary.",
  },
  {
    org: "Kraken",
    detail:
      "Awarded a $500 bounty for a misconfiguration in Kraken’s desktop application.",
  },
] as const;

export const disclosurePolicy =
  "Public summaries reflect the owner-supplied résumé and recorded disclosure outcomes. Technical details are withheld where a programme’s terms require it or a fix is not confirmed deployed.";
