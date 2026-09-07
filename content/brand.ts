import { publicFindings } from "./findings";
import { profiles } from "./profiles";

/**
 * The site's argument, in words. Everything below is positioning copy that
 * the owner approved; the facts it rests on live in the other content files.
 */
export const brand = {
  tagline: "Cybersecurity × AI × Automation",
  /** The three-beat thesis. Each line is one claim the page then evidences. */
  thesis: [
    {
      dont: "I don't just use cybersecurity tools.",
      do: "I build security systems.",
      anchor: "#cyber-lab",
    },
    {
      dont: "I don't just use AI.",
      do: "I build AI-powered automation.",
      anchor: "#ai-lab",
    },
    {
      dont: "I don't just learn technology.",
      do: "I build with it.",
      anchor: "#work",
    },
  ],
  /** Hero headline, as explicit lines so the break is designed, not incidental. */
  headline: [
    "Security systems,",
    "built to hold.",
    "AI automation,",
    "built to prove it.",
  ],
  /** The five stations of the hero system diagram, in flow order. */
  system: [
    {
      id: "user",
      label: "User",
      note: "A request, a vendor, a target in scope",
    },
    {
      id: "security",
      label: "Security",
      note: "Controls tested, not assumed",
    },
    { id: "ai", label: "AI engine", note: "Agents reason over the evidence" },
    {
      id: "automation",
      label: "Automation",
      note: "n8n pipelines do the manual work",
    },
    { id: "result", label: "Result", note: "Proof, not a questionnaire" },
  ],
  /**
   * Each credibility chip links to the item on this site that substantiates
   * it, so no chip makes a claim the page does not then evidence.
   */
  credibility: [
    { label: "CRTP", href: "#achievements" },
    {
      label: "CERT-In Recognised",
      href: `/security/${publicFindings.find((f) => f.org === "IRCTC")?.slug ?? ""}`,
    },
    {
      label: "Google Bug Hunter",
      href: `/security/${publicFindings.find((f) => f.org === "Google")?.slug ?? ""}`,
    },
    {
      label: "Kraken Bounty",
      href: `/security/${publicFindings.find((f) => f.org === "Kraken")?.slug ?? ""}`,
    },
  ],
  ctas: {
    work: { label: "View work", href: "#work" },
    github: {
      label: "GitHub",
      href:
        profiles.find((p) => p.platform === "GitHub")?.url ??
        "https://github.com/jatinsingh1603",
    },
    contact: { label: "Contact", href: "#contact" },
  },
} as const;
