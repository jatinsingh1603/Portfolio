import { describe, expect, it } from "vitest";
import {
  chapterAt,
  chapterStops,
  clamp,
  exposure,
  segment,
} from "@/lib/case-choreography";

describe("case story navigation", () => {
  it("lands every chapter shortcut on its readable scene", () => {
    const spans = [
      [0.28, 0.55],
      [0.53, 0.79],
      [0.77, 1.08],
    ];
    chapterStops.forEach((stop, chapter) => {
      expect(chapterAt(stop)).toBe(chapter);
      if (chapter) {
        const span = spans[chapter - 1]!;
        expect(exposure(stop, span[0]!, span[1]!)).toBe(1);
      }
    });
  });
  it("clamps overscroll and never moves a roller beyond its final letter", () => {
    expect(clamp(-0.2)).toBe(0);
    expect(clamp(1.2)).toBe(1);
    expect(segment(-100, 0.01, 0.15)).toBe(0);
    expect(segment(100, 0.01, 0.15)).toBe(1);
  });
});
