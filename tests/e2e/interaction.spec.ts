import { expect, test } from "@playwright/test";

/**
 * The interactive instruments must work from the keyboard, the rail must track
 * the station, and the hero must degrade to its server-rendered SVG.
 */

test("cyber lab tabs are keyboard operable", async ({ page }) => {
  await page.goto("/#cyber-lab");
  const tabs = page.getByRole("tablist").first().getByRole("tab");
  await expect(tabs).toHaveCount(6);
  await tabs.first().focus();
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(tabs.nth(1)).toBeFocused();
  await page.keyboard.press("End");
  await expect(tabs.nth(5)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
});

test("ai lab scenarios swap every stage's step", async ({ page }) => {
  await page.goto("/#ai-lab");
  const lab = page.locator("#ai-lab");
  const tabs = lab.getByRole("tab");
  await expect(tabs).toHaveCount(4);
  const panel = lab.getByRole("tabpanel");
  const before = await panel.innerText();
  await tabs.nth(3).click();
  await expect(tabs.nth(3)).toHaveAttribute("aria-selected", "true");
  await expect
    .poll(async () => (await panel.innerText()) !== before)
    .toBe(true);
});

test("rail tracks the current station and the progress bar advances", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".rail")).toBeVisible();
  await page.locator("#research").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const current = page.locator('.rail__tick[aria-current="true"]');
  await expect(current).toHaveText(/0[3-5]/);
  const progress = await page.evaluate(() =>
    Number(
      getComputedStyle(document.documentElement).getPropertyValue("--progress"),
    ),
  );
  expect(progress).toBeGreaterThan(0.05);
});

test("hero paints an SVG before WebGL and never hides the labels from assistive tech", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const scene = page.locator(".system-scene").first();
  await expect(scene).toHaveAttribute("aria-label", /User.*Result/);
  await expect(scene.locator("svg")).toHaveCount(1);
  // Under reduced motion WebGL is skipped, so the SVG stays and no canvas
  // overlays it.
  await page.waitForTimeout(800);
  await expect(page.locator(".system-scene.is-live")).toHaveCount(0);
});

test("every finding and project page is reachable and names its subject", async ({
  page,
}) => {
  await page.goto("/security");
  const links = await page
    .locator('a[href^="/security/"]')
    .evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute("href")))]);
  expect(links.length).toBeGreaterThan(5);
  for (const href of links) {
    await page.goto(href as string);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  await page.goto("/projects/tprm-platform");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Risk");
});

test("no phone number or withheld wording is ever served", async ({ page }) => {
  for (const route of [
    "/",
    "/security",
    "/resume",
    "/security/meta-ai-prompt-injection",
  ]) {
    const html = await (await page.goto(route))!.text();
    expect(html).not.toContain("8175033816");
    expect(html.toLowerCase()).not.toContain("employee data");
    expect(html.toLowerCase()).not.toContain("internal infrastructure");
  }
});
