import { z } from "zod";

/**
 * Every fact on this site is validated against these schemas by a Vitest test,
 * so a malformed or half-written content entry fails the build rather than
 * shipping. This matters more than usual here: the site’s entire premise is
 * that a security researcher’s public claims are accurate.
 */

export const severitySchema = z.enum([
  "critical",
  "high",
  "medium",
  "low",
  "info",
]);
export type Severity = z.infer<typeof severitySchema>;

/**
 * §4.6 governance gate. A finding is rendered only when `public` is true, and
 * a public finding must state the basis on which it may be disclosed — a
 * program’s own rules, written vendor approval, or an existing public
 * acknowledgement. Withheld findings must carry a reason so the decision is
 * recorded in the repo rather than lost in a chat log.
 */
export const disclosureSchema = z.discriminatedUnion("public", [
  z.object({
    public: z.literal(true),
    basis: z.enum([
      "program-permitted",
      "vendor-approved",
      "publicly-acknowledged",
    ]),
    note: z.string().optional(),
  }),
  z.object({
    public: z.literal(false),
    reason: z.string().min(1),
  }),
]);
export type Disclosure = z.infer<typeof disclosureSchema>;

export const findingSchema = z.object({
  id: z.string().regex(/^[A-Z]{2,4}-\d{2}$/, "e.g. JKS-01"),
  org: z.string().min(1),
  /** One line, no reproduction detail — see the disclosure policy. */
  summary: z.string().min(1),
  /** Vulnerability class in vendor-neutral language. */
  class: z.string().min(1),
  severity: severitySchema,
  status: z.string().min(1),
  /** Present only where a bounty was actually awarded and may be named. */
  bounty: z.string().optional(),
  disclosure: disclosureSchema,
  /** Set only when a cleared long-form writeup exists at /security/[slug]. */
  slug: z.string().optional(),
});
export type Finding = z.infer<typeof findingSchema>;

export const projectSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  /** Editorial label for the showcase, e.g. "AI × Vendor risk automation". */
  category: z.string().min(1),
  role: z.string().min(1),
  /** Plain-language state: built and demonstrated, active, archived. */
  status: z.string().min(1),
  /** Exactly one project carries the large featured presentation. */
  featured: z.boolean().optional(),
  stack: z.array(z.string().min(1)).min(1),
  summary: z.string().min(1),
  outcomes: z
    .array(z.object({ label: z.string().min(1), detail: z.string().min(1) }))
    .min(1),
  recognition: z.string().optional(),
  repo: z.string().url().optional(),
  /** Set only when a public, working demo exists. None do today. */
  demo: z.string().url().optional(),
  license: z.string().optional(),
});
export type Project = z.infer<typeof projectSchema>;

export const roleSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  arrangement: z.string().min(1),
  start: z.string().min(1),
  end: z.string().min(1),
  highlights: z
    .array(z.object({ label: z.string().min(1), detail: z.string().min(1) }))
    .min(1),
});
export type Role = z.infer<typeof roleSchema>;

export const awardSchema = z.object({
  placement: z.string().min(1),
  event: z.string().min(1),
  organiser: z.string().min(1),
  venue: z.string().optional(),
  projectSlug: z.string().min(1),
});
export type Award = z.infer<typeof awardSchema>;

export const capabilityGroupSchema = z.object({
  label: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
});
export type CapabilityGroup = z.infer<typeof capabilityGroupSchema>;

export const profileSchema = z.object({
  platform: z.string().min(1),
  handle: z.string().min(1),
  url: z.string().url(),
  /**
   * Rendered verbatim or not at all. §4.10 hard rule: no number appears on this
   * site unless it was verified at build time or supplied by the owner in
   * writing. `undefined` renders the link with no metric — never an estimate.
   */
  metric: z.string().optional(),
});
export type Profile = z.infer<typeof profileSchema>;

export const credentialSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  detail: z.string().optional(),
  verifyUrl: z.string().url().optional(),
});
export type Credential = z.infer<typeof credentialSchema>;

/**
 * Lab stages are educational: each names the tools and capabilities from
 * content/career.ts that apply, and cites the real work that evidences it.
 * The content test asserts every tool and capability exists in that list.
 */
export const labEvidenceSchema = z.object({
  source: z.enum(["role", "project", "finding", "credential"]),
  /** Company, project slug, finding id or credential name. */
  ref: z.string().min(1),
  text: z.string().min(1),
});
export type LabEvidence = z.infer<typeof labEvidenceSchema>;

export const cyberStageSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  headline: z.string().min(1),
  description: z.string().min(1),
  tools: z.array(z.string().min(1)).min(1),
  capabilities: z.array(z.string().min(1)).min(1),
  evidence: z.array(labEvidenceSchema).min(1),
});
export type CyberStage = z.infer<typeof cyberStageSchema>;

export const aiStageSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
});
export type AiStage = z.infer<typeof aiStageSchema>;

export const aiScenarioSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  /** The real thing this scenario describes. */
  source: labEvidenceSchema,
  /** One entry per AI stage, in order. */
  steps: z.array(z.string().min(1)).min(1),
});
export type AiScenario = z.infer<typeof aiScenarioSchema>;

export const milestoneSchema = z.object({
  id: z.string().min(1),
  phase: z.enum(["education", "security", "ai", "automation", "current"]),
  title: z.string().min(1),
  detail: z.string().min(1),
  /** Only when the record carries one. Undated milestones render undated. */
  date: z.string().min(1).optional(),
  href: z.string().min(1).optional(),
});
export type Milestone = z.infer<typeof milestoneSchema>;

export const achievementSchema = z.object({
  id: z.string().min(1),
  kind: z.enum([
    "bounty",
    "certification",
    "hackathon",
    "practice",
    "research",
    "open-source",
    "national",
  ]),
  title: z.string().min(1),
  detail: z.string().min(1),
  /** Verbatim verified figure, or absent. Never an estimate. */
  metric: z.string().optional(),
  href: z.string().min(1).optional(),
});
export type Achievement = z.infer<typeof achievementSchema>;

/** A stage in a project's own pipeline, transcribed for the diagram. */
export const stageSchema = z.object({
  label: z.string().min(1),
  /** Short note set beside the node — the reason the stage exists. */
  note: z.string().optional(),
  /** Renders as a gate: a hard stop that must be satisfied before continuing. */
  gate: z.boolean().optional(),
});
export type Stage = z.infer<typeof stageSchema>;
