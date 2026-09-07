import { awards, credentials, roles } from "./career";
import { publicFindings } from "./findings";
import { profiles } from "./profiles";
import { projects } from "./projects";
import type { Achievement } from "./schema";
import { recognitions } from "./site";

/**
 * Achievement cards are derived from the other content modules wherever a
 * figure can be computed, so a count here can never disagree with the list
 * it summarises. `metric` is verbatim or absent. Every card carries the
 * public place that substantiates it.
 */
const profile = (platform: string) =>
  profiles.find((p) => p.platform === platform);

const bountied = publicFindings.filter((f) => f.bounty);
const tryHackMe = profile("TryHackMe");
const leetCode = profile("LeetCode");
const bugHunters = profile("Google Bug Hunters");
const linkedIn = profile("LinkedIn");
/** Hackathon placements and the certification are listed publicly on LinkedIn. */
const onLinkedIn = linkedIn
  ? { label: "Listed on LinkedIn", href: linkedIn.url }
  : undefined;
const swift = projects.find((p) => p.slug === "swiftpentest");
const cert = credentials[0];
const irctc = publicFindings.find((f) => f.org === "IRCTC");

export const achievements: Achievement[] = [
  {
    id: "disclosure",
    kind: "bounty",
    title: "Reports accepted by four organisations",
    detail: recognitions.map((r) => r.org).join(", "),
    metric: `${recognitions.length} organisations`,
    href: "/security",
    evidence: bugHunters
      ? { label: "Google Bug Hunters profile", href: bugHunters.url }
      : undefined,
  },
  ...(bountied[0]
    ? [
        {
          id: "kraken-bounty",
          kind: "bounty" as const,
          title: `${bountied[0].org} bounty`,
          detail: bountied[0].summary,
          metric: bountied[0].bounty,
          href: `/security/${bountied[0].slug}`,
          evidence: {
            label: "Finding sheet",
            href: `/security/${bountied[0].slug}`,
          },
        },
      ]
    : []),
  ...(irctc
    ? [
        {
          id: "cert-in",
          kind: "national" as const,
          title: "CERT-In acknowledgement",
          detail: irctc.summary,
          href: `/security/${irctc.slug}`,
          evidence: { label: "Finding sheet", href: `/security/${irctc.slug}` },
        },
      ]
    : []),
  ...(roles[0]
    ? [
        {
          id: "empanelment",
          kind: "national" as const,
          title: "CERT-In empanelment examinations",
          detail:
            "Cleared OFFPST, OLPST and the Personal Interaction Session, securing CERT-In empanelment for Tinycrows.",
          href: "/resume",
          evidence: onLinkedIn,
        },
      ]
    : []),
  ...(cert
    ? [
        {
          id: "crtp",
          kind: "certification" as const,
          title: cert.name,
          detail: `${cert.issuer}. ${cert.detail ?? ""}`.trim(),
          href: cert.verifyUrl ?? cert.evidence?.href ?? onLinkedIn?.href,
          evidence: cert.verifyUrl
            ? { label: "Verify credential", href: cert.verifyUrl }
            : (cert.evidence ?? onLinkedIn),
        },
      ]
    : []),
  ...awards.map((a) => ({
    id: `award-${a.event.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    kind: "hackathon" as const,
    title: `${a.placement} — ${a.event}`,
    detail: `${a.organiser}${a.venue ? `, ${a.venue}` : ""}`,
    href: `/projects/${a.projectSlug}`,
    evidence: a.evidence ?? onLinkedIn,
  })),
  {
    id: "research",
    kind: "research",
    title: "Public disclosure record",
    detail:
      "Organisation, vulnerability class, severity and status for every published finding. Reproduction detail withheld by policy.",
    metric: `${publicFindings.length} findings`,
    href: "/security",
    evidence: { label: "Disclosure ledger", href: "/security" },
  },
  ...(swift
    ? [
        {
          id: "swiftpentest",
          kind: "open-source" as const,
          title: `${swift.role}, ${swift.name}`,
          detail: swift.summary,
          metric: swift.license ? `${swift.license} licence` : undefined,
          href: swift.repo,
          evidence: swift.repo
            ? { label: "Repository on GitHub", href: swift.repo }
            : undefined,
        },
      ]
    : []),
  ...(leetCode
    ? [
        {
          id: "leetcode",
          kind: "practice" as const,
          title: "LeetCode",
          detail: "Data structures and algorithms practice.",
          metric: leetCode.metric,
          href: leetCode.url,
          evidence: { label: "LeetCode profile", href: leetCode.url },
        },
      ]
    : []),
  ...(tryHackMe
    ? [
        {
          id: "tryhackme",
          kind: "practice" as const,
          title: "TryHackMe",
          detail: `Hands-on labs and CTF rooms as ${tryHackMe.handle}.`,
          href: tryHackMe.url,
          evidence: { label: "TryHackMe profile", href: tryHackMe.url },
        },
      ]
    : []),
];
