import { awards, credentials, roles } from "./career";
import { publicFindings } from "./findings";
import { profiles } from "./profiles";
import { projects } from "./projects";
import type { Achievement } from "./schema";
import { recognitions } from "./site";

/**
 * Achievement cards are derived from the other content modules wherever a
 * figure can be computed, so a count here can never disagree with the list
 * it summarises. `metric` is verbatim or absent.
 */
const profile = (platform: string) =>
  profiles.find((p) => p.platform === platform);

const bountied = publicFindings.filter((f) => f.bounty);
const tryHackMe = profile("TryHackMe");
const leetCode = profile("LeetCode");
const swift = projects.find((p) => p.slug === "swiftpentest");
const cert = credentials[0];

export const achievements: Achievement[] = [
  {
    id: "disclosure",
    kind: "bounty",
    title: "Reports accepted by four organisations",
    detail: recognitions.map((r) => r.org).join(", "),
    metric: `${recognitions.length} organisations`,
    href: "/security",
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
        },
      ]
    : []),
  {
    id: "cert-in",
    kind: "national",
    title: "CERT-In acknowledgement",
    detail:
      "DOM-based cross-site scripting on IRCTC, reported through CERT-In and acknowledged by them.",
    href: "/security/irctc-dom-xss",
  },
  ...(roles[0]
    ? [
        {
          id: "empanelment",
          kind: "national" as const,
          title: "CERT-In empanelment examinations",
          detail:
            "Cleared OFFPST, OLPST and the Personal Interaction Session, securing CERT-In empanelment for Tinycrows.",
          href: "/resume",
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
        },
      ]
    : []),
  ...awards.map((a) => ({
    id: `award-${a.event.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    kind: "hackathon" as const,
    title: `${a.placement} — ${a.event}`,
    detail: `${a.organiser}${a.venue ? `, ${a.venue}` : ""}`,
    href: `/projects/${a.projectSlug}`,
  })),
  {
    id: "research",
    kind: "research",
    title: "Public disclosure record",
    detail:
      "Organisation, vulnerability class, severity and status for every published finding. Reproduction detail withheld by policy.",
    metric: `${publicFindings.length} findings`,
    href: "/security",
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
        },
      ]
    : []),
];
