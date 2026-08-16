import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["/", "/security", "/resume", "/contact"];

for (const route of routes) {
  for (const theme of ["light", "dark"] as const) {
    test(`${route} has no serious axe violations in ${theme}`, async ({
      page,
    }) => {
      await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
      await page.goto(route);
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
        .analyze();
      const serious = violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      );
      expect(serious.map((v) => v.id)).toEqual([]);
    });
  }
}

test("no horizontal overflow from 320px to 2560px", async ({ page }) => {
  await page.goto("/");
  for (const width of [320, 390, 768, 1024, 1440, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow, `overflow at ${width}px`).toBe(false);
  }
});
