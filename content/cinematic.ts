import { education, roles } from "./career";
import { identity } from "./site";

/**
 * Narrative presentation of the existing portfolio record.
 * Personal facts come from career.ts, findings.ts, projects.ts and site.ts.
 * Investigation language is a visual metaphor; disclosure statuses stay in
 * findings.ts and must never be replaced with an implied successful outcome.
 */
export const cinematic = {
  eyebrow: "The portfolio of Jatin Kumar Singh",
  intro:
    "I test applications, investigate security gaps, and build automation that helps teams find and fix problems.",
  heroWords: ["SECURITY", "RESEARCH", "AUTOMATE"],
  heroTitle: "Every system leaves a trail.",
  chapters: [
    {
      id: "origin",
      eyebrow: "01 / The starting point",
      title: "Look closer to home.",
      text: `I study Computer Science & Engineering at ${education.institution}. I put that learning into practice through authorised testing of university systems. I documented the findings and reported them to the university, with clear explanations of what needed attention.`,
      tag: `${education.start}-${education.end} / ${education.degree}`,
      evidence: {
        title: `${education.start}-${education.end}`,
        label: "B.Tech in Computer Science & Engineering",
        detail: education.institution,
      },
    },
    {
      id: "security",
      eyebrow: "02 / Follow the evidence",
      title: "A small detail. A bigger question.",
      text: "A session stays open when it should close. A security control behaves differently than expected. I investigate those details and report what I can prove. My work includes bounties of $1,500 from Blinkit and $500 from Kraken, a CERT-In acknowledgement for an IRCTC finding, and a Google-requested fix for Chrome DevTools MCP.",
      tag: "Application security / Responsible disclosure",
      evidence: {
        title: "$2,000",
        label: "Bounties from Blinkit and Kraken",
        detail: "CERT-In also acknowledged my IRCTC finding.",
      },
    },
    {
      id: "ai",
      eyebrow: "03 / Build the next tool",
      title: "Turn the process into a tool.",
      text: "Security work also made me ask what we could stop doing by hand. I built AI platforms for vendor risk and SEBI CSCRF compliance. They connect documents, security checks, and control requirements so analysts can see where the evidence supports a claim.",
      tag: "AI agents / n8n / Security automation",
      evidence: {
        title: "02",
        label: "AI platforms built and demonstrated",
        detail: "Vendor risk and SEBI CSCRF compliance.",
      },
    },
    {
      id: "now",
      eyebrow: "04 / The work continues",
      title: "From a finding to a decision.",
      text: `At ${roles[0]!.company}, I work on application testing, threat detection, compliance, and automation. I turn findings into reports and workflows that teams can use. My aim is to explain the problem clearly and help people act on it.`,
      tag: `${identity.title} / Since ${roles[0]!.start}`,
      evidence: {
        title: "Tinycrows",
        label: identity.title,
        detail: `Since ${roles[0]!.start}. Application security, detection, and automation.`,
      },
    },
  ],
  method: [
    {
      id: "observe",
      title: "Find the thread.",
      description:
        "Map the application and its exposed services. Establish what belongs in scope before testing a control.",
      tools: ["Amass", "Shodan", "Nmap"],
    },
    {
      id: "connect",
      title: "Connect the clues.",
      description:
        "Read requests, responses, and logs. Turn an unusual behaviour into a question that a test can answer.",
      tools: ["Burp Suite", "Wireshark", "Postman"],
    },
    {
      id: "verify",
      title: "Test the theory.",
      description:
        "Reproduce the behaviour within the authorised scope. Compare the evidence before deciding what the finding means.",
      tools: ["Burp Suite", "OWASP ZAP", "Docker"],
    },
    {
      id: "resolve",
      title: "Make the next step clear.",
      description:
        "Explain the impact and how to fix it. Build repeatable checks and workflows where automation can help.",
      tools: ["n8n", "AI agents", "Git"],
    },
  ],
  projectNotes: {
    "tprm-platform": {
      kicker: "Case file 01 / Vendor risk",
      title: "Trust needs evidence.",
      summary:
        "Check vendor claims against their documents and an external assessment across 20+ parameters. One workflow connects onboarding, due diligence, and reporting.",
    },
    "cscrf-compliance": {
      kicker: "Case file 02 / Compliance",
      title: "Find the gaps between policy and proof.",
      summary:
        "AI agents connect policy documents and assessment answers to SEBI CSCRF controls. The result shows where the evidence supports a claim and where coverage falls short.",
    },
    swiftpentest: {
      kicker: "Case file 03 / Open source",
      title: "An AI finding still needs proof.",
      summary:
        "I contribute to swiftPentest, a security testing platform with 12+ specialised agents and 99 tools. It validates findings with a minimum 3/5 reproduction gate and keeps an audit trail.",
    },
  },
  closing: {
    eyebrow: "End of this chapter",
    title: "The next case is yours.",
    text: "Have an application to secure or an idea to build? Tell me what you are working on. I would like to hear it.",
    image: "/images/jatin-portrait.png",
    imageAlt:
      "Monochrome ASCII-style portrait of Jatin Kumar Singh wearing glasses.",
    caption: "Jatin Kumar Singh / Always looking closer.",
  },
} as const;
