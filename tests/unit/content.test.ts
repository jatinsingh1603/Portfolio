import { describe, expect, it } from "vitest";
import { awards, capabilities, credentials, roles } from "@/content/career";
import { findings, publicFindings } from "@/content/findings";
import { projects } from "@/content/projects";
import { profiles } from "@/content/profiles";
import {
  awardSchema,
  capabilityGroupSchema,
  credentialSchema,
  findingSchema,
  profileSchema,
  projectSchema,
  roleSchema,
} from "@/content/schema";

describe("content schemas", () => {
  it("validates findings", () => {
    for (const f of findings)
      expect(() => findingSchema.parse(f)).not.toThrow();
  });
  it("validates projects", () => {
    for (const p of projects)
      expect(() => projectSchema.parse(p)).not.toThrow();
  });
  it("validates roles, awards, capabilities, credentials, profiles", () => {
    for (const r of roles) expect(() => roleSchema.parse(r)).not.toThrow();
    for (const a of awards) expect(() => awardSchema.parse(a)).not.toThrow();
    for (const c of capabilities)
      expect(() => capabilityGroupSchema.parse(c)).not.toThrow();
    for (const c of credentials)
      expect(() => credentialSchema.parse(c)).not.toThrow();
    for (const p of profiles)
      expect(() => profileSchema.parse(p)).not.toThrow();
  });
});

describe("content integrity", () => {
  it("has unique finding ids and project slugs", () => {
    expect(new Set(findings.map((f) => f.id)).size).toBe(findings.length);
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
  });

  it("points every award at a project that exists", () => {
    const slugs = new Set(projects.map((p) => p.slug));
    for (const a of awards) expect(slugs.has(a.projectSlug)).toBe(true);
  });

  it("never exposes a withheld finding through the public list", () => {
    // The §4.6 governance gate. If this fails, legally sensitive content is
    // about to ship.
    for (const f of publicFindings) expect(f.disclosure.public).toBe(true);
    expect(publicFindings.length).toBeLessThan(findings.length);
  });

  it("gives every withheld finding a recorded reason", () => {
    for (const f of findings) {
      if (!f.disclosure.public)
        expect(f.disclosure.reason.length).toBeGreaterThan(20);
    }
  });

  it("never publishes the phone number", () => {
    // Belt and braces: the résumé PDF carries it, the HTML must not.
    const serialised = JSON.stringify({ findings, projects, profiles, roles });
    expect(serialised).not.toContain("8175033816");
  });
});
