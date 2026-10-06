import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { capabilities } from "@/content/career";
import { cinematic } from "@/content/cinematic";
import { projects } from "@/content/projects";

describe("cinematic portfolio content", () => {
  it("fills all eight reel windows for every hero word", () => {
    for (const word of cinematic.heroWords) {
      expect(word, "Every reel requires eight uppercase letters").toMatch(
        /^[A-Z]{8}$/,
      );
    }
  });

  it("has one case summary for every existing project and no invented cases", () => {
    expect(Object.keys(cinematic.projectNotes).sort()).toEqual(
      projects.map((project) => project.slug).sort(),
    );
  });

  it("names investigation tools already supported by the portfolio record", () => {
    const recordedTools = new Set([
      ...(capabilities.find((group) => group.label === "Tools")?.items ?? []),
      ...projects
        .filter((project) => project.category.startsWith("AI"))
        .flatMap((project) => project.stack),
    ]);

    for (const stage of cinematic.method) {
      for (const tool of stage.tools) {
        expect(recordedTools.has(tool), `${stage.id}: ${tool}`).toBe(true);
      }
    }
  });

  it("ships the requested footer photograph at its content URL", () => {
    expect(cinematic.closing.image).toMatch(/^\/images\//);
    expect(
      existsSync(path.join(process.cwd(), "public", cinematic.closing.image)),
    ).toBe(true);
  });

  it("keeps private contact and withheld impact details out of the narrative", () => {
    const copy = JSON.stringify(cinematic).toLowerCase();
    for (const withheld of [
      "8175033816",
      "employee data",
      "internal infrastructure",
    ]) {
      expect(copy, withheld).not.toContain(withheld);
    }
  });
});
