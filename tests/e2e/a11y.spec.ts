import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/security",
  "/security/irctc-dom-xss",
  "/resume",
  "/contact",
  "/projects/swiftpentest",
  "/projects/tprm-platform",
  "/styleguide",
];

// Reduced motion is emulated for the scans: mid-transition elements sit at a
// fractional opacity, which axe reads as a contrast failure and makes the suite
// flaky. It also exercises the reduced-motion path, which must show everything.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

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
      expect(
        serious.map((v) => `${v.id}: ${v.nodes[0]?.failureSummary ?? ""}`),
      ).toEqual([]);
    });
  }
}

test("reduced motion reveals all content immediately", async ({ page }) => {
  await page.goto("/");
  const hidden = await page.evaluate(
    () =>
      [...document.querySelectorAll("[data-reveal]")].filter(
        (el) => getComputedStyle(el).opacity !== "1",
      ).length,
  );
  expect(hidden).toBe(0);
});

test("no horizontal overflow from 320px to 2560px", async ({ page }) => {
  await page.goto("/");
  for (const width of [320, 390, 768, 1024, 1440, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(150);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow, `overflow at ${width}px`).toBe(false);
  }
});

test("skip link is the first tabbable element and reaches main", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await page.waitForTimeout(100);
  const focused = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    href: document.activeElement?.getAttribute("href"),
    visible:
      document.activeElement instanceof HTMLElement &&
      document.activeElement.getBoundingClientRect().top >= 0,
  }));
  expect(focused.tag).toBe("A");
  expect(focused.href).toBe("#main");
  expect(focused.visible).toBe(true);
});

test("mobile menu traps focus and returns it on Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.click();
  await expect(page.getByRole("navigation").getByRole("link")).not.toHaveCount(
    0,
  );
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});
