/**
 * Identity and site-level constants. Nothing here is duplicated in JSX.
 */

/**
 * Canonical origin. Set NEXT_PUBLIC_SITE_URL in the Vercel project once the
 * domain is registered — the fallback is a placeholder, not a claim that this
 * domain exists.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://jatinkumarsingh.com";

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

export const positioning = {
  /**
   * Two beats, six words. Display type at 80px turns anything longer into a
   * wall that pushes the calls to action off a phone’s first screen — the full
   * claim lives in the intro below instead.
   */
  headline: "Break the control. Prove the fix.",
  /**
   * Rendered as explicit lines. Left to the measure, the wrap lands after
   * "Prove" and splits a sentence across two lines — a designer would never
   * let that ship, and no max-width holds it correctly at every viewport.
   */
  headlineLines: ["Break the control.", "Prove the fix."],
  /**
   * The rotating half of the headline. These are the four control types behind
   * findings that appear further down this page: session management (JKS-03),
   * object-level authorisation (JKS-05) and access control (JKS-07). Not a
   * list of job titles.
   *
   * Two constraints on this list: every word is within one character of the
   * others (the slot reserves the width of the longest, so an outlier leaves
   * visible slack in a centred headline), and the canonical word is last
   * because the rotation stops there rather than looping.
   */
  headlineRotating: ["session", "boundary", "control"],
  intro:
    "I test application security controls, then build the automation that proves they\u2019re actually fixed. VAPT, red teaming, vendor risk and SEBI CSCRF.",
  /** Long form, used on /resume and in the llms.txt summary. */
  statement:
    "Cybersecurity professional specialising in application security and AI-driven automation. CRTP (Certified Red Team Professional, Altered Security), with validated hands-on skills in Active Directory attacks and red team operations. Hands-on experience across VAPT and building production-grade AI automation workflows using n8n. Recognised by Google, CERT-In and Kraken through responsible disclosure. Currently designing security automation platforms that reduce manual effort in third-party risk management, vendor due diligence and regulatory compliance (SEBI CSCRF).",
} as const;

export const nav = [
  { label: "Work", href: "/#work" },
  { label: "Research", href: "/#research" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;

/**
 * Rendered in the hero. Each maps to a verifiable item elsewhere on the page —
 * no chip makes a claim the site does not then substantiate.
 */
export const credibilityChips = [
  "CRTP",
  "CERT-In Recognised",
  "Google Bug Hunter",
  "Kraken Bounty",
] as const;

/** §5.2 — text only. Company logos would read as endorsement and are trademarks. */
export const recognitions = [
  {
    org: "Google",
    detail:
      "Reported a persistent session flaw in a third-party application using Google SSO, through the Google Bug Hunters programme.",
  },
  {
    org: "CERT-In",
    detail:
      "Acknowledged and recognised for a DOM-based cross-site scripting finding on IRCTC.",
  },
  {
    org: "Meta",
    detail:
      "Two reports accepted through Meta’s bug bounty programme, including one against Mapillary.",
  },
  {
    org: "Kraken",
    detail:
      "Awarded a $500 bounty for a misconfiguration in Kraken’s desktop application.",
  },
] as const;

export const disclosurePolicy =
  "All findings on this page were reported through the vendor’s official channel or a national CERT. Technical details are withheld where a program’s terms require it or where a fix is not yet confirmed deployed.";
