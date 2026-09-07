import { awards, credentials, education, roles } from "./career";
import { findings } from "./findings";
import { projects } from "./projects";
import type { Milestone } from "./schema";

/**
 * The journey is a routed path through five phases, not a dated timeline: the
 * record carries dates for education and the current role only. Undated
 * milestones say so rather than borrowing a plausible year.
 */
const role = roles[0];
const bounty = findings.find((f) => f.id === "JKS-02");
const cert = credentials[0];

export const journey: Milestone[] = [
  {
    id: "education",
    phase: "education",
    title: education.degree,
    detail: `${education.institution}. ${education.detail}.`,
    date: `${education.start} – ${education.end}`,
  },
  {
    id: "authorised-testing",
    phase: "security",
    title: "Authorised testing of the university’s own systems",
    detail:
      "Cross-site scripting and a denial-of-service condition in the website and ERP portal; an insecure-protocol exposure on the biometric attendance system. Both reported to the university.",
    href: "/security",
  },
  {
    id: "disclosure",
    phase: "security",
    title: "Reports accepted by Google, CERT-In, Meta and Kraken",
    detail: `Seven public entries in the disclosure record, including a CERT-In acknowledgement for IRCTC${bounty?.bounty ? ` and a ${bounty.bounty.replace(" awarded", "")} bounty from Kraken` : ""}.`,
    href: "/security",
  },
  ...(cert
    ? [
        {
          id: "crtp",
          phase: "security" as const,
          title: cert.name,
          detail: cert.detail ?? cert.issuer,
        },
      ]
    : []),
  {
    id: "tprm",
    phase: "ai",
    title: projects.find((p) => p.slug === "tprm-platform")?.name ?? "TPRM",
    detail: awards
      .filter((a) => a.projectSlug === "tprm-platform")
      .map((a) => `${a.placement}, ${a.event} (${a.organiser})`)
      .join(". "),
    href: "/projects/tprm-platform",
  },
  {
    id: "cscrf",
    phase: "ai",
    title: projects.find((p) => p.slug === "cscrf-compliance")?.name ?? "CSCRF",
    detail: awards
      .filter((a) => a.projectSlug === "cscrf-compliance")
      .map(
        (a) =>
          `${a.placement}, ${a.event} (${a.organiser}${a.venue ? `, ${a.venue}` : ""})`,
      )
      .join(". "),
    href: "/projects/cscrf-compliance",
  },
  {
    id: "swiftpentest",
    phase: "automation",
    title: "Contributor, swiftPentest",
    detail:
      "Open-source multi-agent web security tester whose safety model is structural: an authorisation gate, detection-only by design, a hash-chained audit log.",
    href: "/projects/swiftpentest",
  },
  ...(role
    ? [
        {
          id: "tinycrows",
          phase: "current" as const,
          title: `${role.title}, ${role.company}`,
          detail:
            "CERT-In empanelment examinations cleared; threat detection for a major UPI provider; an n8n merchant risk tool for an Indian fintech bank; CSCRF assessments; web penetration testing.",
          date: `${role.start} – ${role.end}`,
          href: "/resume",
        },
      ]
    : []),
];

export const phases: { id: Milestone["phase"]; label: string }[] = [
  { id: "education", label: "Education" },
  { id: "security", label: "Security" },
  { id: "ai", label: "AI" },
  { id: "automation", label: "Automation" },
  { id: "current", label: "Current work" },
];
