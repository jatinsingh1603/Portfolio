import { describe, expect, it } from "vitest";
import { achievements } from "@/content/achievements";
import { about } from "@/content/about";
import { brand } from "@/content/brand";
import { capabilities, credentials, roles } from "@/content/career";
import { findings } from "@/content/findings";
import { journey, phases } from "@/content/journey";
import { aiScenarios, aiStages, cyberLab } from "@/content/labs";
import { projects } from "@/content/projects";
import {
  achievementSchema,
  aiScenarioSchema,
  aiStageSchema,
  cyberStageSchema,
  milestoneSchema,
} from "@/content/schema";

const tools = new Set(
  capabilities.find((g) => g.label === "Tools")?.items ?? [],
);
const securitySkills = new Set(
  capabilities.find((g) => g.label === "Security")?.items ?? [],
);
const projectSlugs = new Set(projects.map((p) => p.slug));
const findingIds = new Set(findings.map((f) => f.id));
const companies = new Set(roles.map((r) => r.company));
const credentialNames = new Set(credentials.map((c) => c.name));

function evidenceExists(e: { source: string; ref: string }) {
  switch (e.source) {
    case "project":
      return projectSlugs.has(e.ref);
    case "finding":
      return findingIds.has(e.ref);
    case "role":
      return companies.has(e.ref);
    case "credential":
      return credentialNames.has(e.ref);
    default:
      return false;
  }
}

describe("cyber lab", () => {
  it("validates every stage", () => {
    for (const s of cyberLab)
      expect(() => cyberStageSchema.parse(s)).not.toThrow();
    expect(cyberLab.map((s) => s.id)).toEqual([
      "recon",
      "discovery",
      "analysis",
      "exploitation",
      "validation",
      "defense",
    ]);
  });

  it("names only tools and capabilities that exist in the capability list", () => {
    // The lab may not claim a tool the résumé does not.
    for (const s of cyberLab) {
      for (const t of s.tools) expect(tools.has(t), `${s.id}: ${t}`).toBe(true);
      for (const c of s.capabilities)
        expect(securitySkills.has(c), `${s.id}: ${c}`).toBe(true);
    }
  });

  it("cites evidence that exists in the record", () => {
    for (const s of cyberLab)
      for (const e of s.evidence)
        expect(evidenceExists(e), `${s.id}: ${e.source} ${e.ref}`).toBe(true);
  });

  it("never publishes reproduction detail", () => {
    const text = JSON.stringify(cyberLab).toLowerCase();
    for (const banned of ["payload", "http://", "https://", "exploit-db"])
      expect(text, banned).not.toContain(banned);
  });

  it("only cites public findings", () => {
    const publicIds = new Set(
      findings.filter((f) => f.disclosure.public).map((f) => f.id),
    );
    for (const s of cyberLab)
      for (const e of s.evidence)
        if (e.source === "finding") expect(publicIds.has(e.ref)).toBe(true);
  });
});

describe("ai automation lab", () => {
  it("validates stages and scenarios", () => {
    for (const s of aiStages)
      expect(() => aiStageSchema.parse(s)).not.toThrow();
    for (const s of aiScenarios)
      expect(() => aiScenarioSchema.parse(s)).not.toThrow();
  });

  it("gives every scenario exactly one step per stage", () => {
    for (const s of aiScenarios)
      expect(s.steps, s.id).toHaveLength(aiStages.length);
  });

  it("grounds every scenario in the record", () => {
    for (const s of aiScenarios)
      expect(evidenceExists(s.source), s.id).toBe(true);
  });
});

describe("journey, achievements, brand, about", () => {
  it("validates milestones and achievements", () => {
    for (const m of journey)
      expect(() => milestoneSchema.parse(m)).not.toThrow();
    for (const a of achievements)
      expect(() => achievementSchema.parse(a)).not.toThrow();
  });

  it("uses only the five declared phases, in order", () => {
    const order = phases.map((p) => p.id);
    let last = -1;
    for (const m of journey) {
      const i = order.indexOf(m.phase);
      expect(i, m.id).toBeGreaterThanOrEqual(last);
      last = i;
    }
  });

  it("dates only what the record dates", () => {
    // Education and the current role carry dates; nothing else may.
    for (const m of journey) {
      if (m.date) expect(["education", "tinycrows"]).toContain(m.id);
    }
  });

  it("has unique ids", () => {
    expect(new Set(journey.map((m) => m.id)).size).toBe(journey.length);
    expect(new Set(achievements.map((a) => a.id)).size).toBe(
      achievements.length,
    );
  });

  it("keeps the thesis to three lines that each point at a section", () => {
    expect(brand.thesis).toHaveLength(3);
    for (const t of brand.thesis) expect(t.anchor.startsWith("#")).toBe(true);
    expect(brand.system.map((s) => s.label)).toEqual([
      "User",
      "Security",
      "AI engine",
      "Automation",
      "Result",
    ]);
  });

  it("never publishes the phone number or a private impact description", () => {
    const text = JSON.stringify({ about, journey, achievements, brand });
    expect(text).not.toContain("8175033816");
    // The Meta AI impact wording is withheld pending approval (JKS-04).
    expect(text.toLowerCase()).not.toContain("employee data");
    expect(text.toLowerCase()).not.toContain("internal infrastructure");
  });
});
