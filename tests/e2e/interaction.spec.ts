import { expect, test } from "@playwright/test";

/**
 * The labs and evidence sheets work from the keyboard. The case follows native
 * scrolling, while reduced motion exposes the complete story as readable text.
 */

test("cyber lab tabs are keyboard operable", async ({ page }) => {
  await page.goto("/labs/#cyber-lab");
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
  await page.goto("/labs/#ai-lab");
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

test("the rolling case follows native wheel scrolling in both directions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const story = page.locator(".motion-study");
  const stage = page.locator(".ms-stage");
  const reels = page.locator(".ms-reel-track");
  await expect(story).not.toHaveClass(/ms-static/);
  await expect(stage).toHaveAttribute("style", /--progress:/);
  await expect(reels).toHaveCount(8);

  const distance = await page
    .locator(".ms-sequence")
    .evaluate((sequence) =>
      Math.round(
        ((sequence as HTMLElement).offsetHeight - window.innerHeight) * 0.08,
      ),
    );
  expect(distance).toBeGreaterThan(0);
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, distance);
  await expect
    .poll(() =>
      page.evaluate((target) => Math.abs(window.scrollY - target), distance),
    )
    .toBeLessThan(2);
  await expect
    .poll(() =>
      reels
        .first()
        .evaluate(
          (reel) => new DOMMatrixReadOnly(getComputedStyle(reel).transform).m42,
        ),
    )
    .toBeLessThan(-1);
  await expect(stage).toHaveAttribute("data-chapter", "0");

  await page.mouse.wheel(0, -distance);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(2);
  await expect
    .poll(() =>
      reels
        .first()
        .evaluate((reel) =>
          Math.abs(new DOMMatrixReadOnly(getComputedStyle(reel).transform).m42),
        ),
    )
    .toBeLessThan(1);
});

test("Next chapter advances the journey, evidence, and systems", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const stage = page.locator(".ms-stage");
  const navigation = page.getByRole("navigation", { name: "Story chapters" });
  await expect(stage).toHaveAttribute("style", /--progress:/);

  for (const [index, label] of [
    "The journey",
    "The evidence",
    "The systems",
  ].entries()) {
    await page.getByRole("button", { name: "Next chapter" }).click();
    await expect(stage).toHaveAttribute("data-chapter", String(index + 1));
    await expect(
      navigation.getByRole("button", { name: label, exact: true }),
    ).toHaveAttribute("aria-current", "step");
    const scene = page.locator(`#ms-static-${index + 1}`);
    await expect(scene).toHaveAttribute("aria-hidden", "false");
    await expect(scene.getByRole("heading", { level: 2 })).toBeInViewport();
  }
  await page.getByRole("button", { name: "Meet the person" }).click();
  await expect(page.locator("#ms-contact-title")).toBeInViewport();
});

test("evidence sheets close to the same folder, focus, and scroll position", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".ms-stage")).toHaveAttribute(
    "style",
    /--progress:/,
  );
  await page
    .getByRole("navigation", { name: "Story chapters" })
    .getByRole("button", { name: "The evidence", exact: true })
    .click();
  await expect(page.locator(".ms-stage")).toHaveAttribute("data-chapter", "2");
  const folder = page.getByRole("button", {
    name: /Open evidence folder: Kraken desktop application/,
  });
  // Hover's actionability checks wait for the native chapter scroll to settle.
  await folder.hover();

  for (const closeWith of ["button", "Escape"] as const) {
    const before = await page.evaluate(() => ({
      y: window.scrollY,
      overflow: document.documentElement.style.overflow,
    }));
    await folder.click();
    const sheet = page.getByRole("dialog", {
      name: "Kraken desktop application",
    });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("heading", { level: 2 })).toHaveText(
      "Kraken desktop application",
    );
    await expect(
      sheet.getByRole("link", { name: "Read the public disclosure record" }),
    ).toHaveAttribute("href", /^\/security\/.+/);
    const close = sheet.getByRole("button", { name: "Close", exact: true });
    await expect(close).toBeFocused();

    if (closeWith === "button") await close.click();
    else await page.keyboard.press("Escape");

    await expect(sheet).toHaveCount(0);
    await expect(folder).toBeFocused();
    await expect
      .poll(() => page.evaluate((y) => Math.abs(window.scrollY - y), before.y))
      .toBeLessThan(2);
    expect(
      await page.evaluate(() => document.documentElement.style.overflow),
    ).toBe(before.overflow);
    await expect(page.locator(".ms-stage")).toHaveAttribute(
      "data-chapter",
      "2",
    );
  }
});

test("reduced motion makes every chapter readable without the animated case", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".motion-study")).toHaveClass(/ms-static/);
  const motion = page.getByRole("button", {
    name: "Reduced motion",
    exact: true,
  });
  await expect(motion).toHaveAttribute("aria-pressed", "true");
  await expect(motion).toBeDisabled();
  await expect(page.locator(".ms-case-anchor")).toBeHidden();
  await expect(page.locator(".ms-folder-anchor")).toBeHidden();

  await expect(
    page.locator("#ms-static-0").getByRole("heading", { level: 1 }),
  ).toBeVisible();
  for (const index of [1, 2, 3]) {
    const scene = page.locator(`#ms-static-${index}`);
    await expect(scene).toHaveAttribute("aria-hidden", "false");
    await expect(scene).toHaveJSProperty("inert", false);
    await expect(scene).toHaveCSS("opacity", "1");
    await expect(scene).toHaveCSS("transform", "none");
    await scene.scrollIntoViewIfNeeded();
    await expect(scene.getByRole("heading", { level: 2 })).toBeInViewport();
    await expect(scene.locator(".ms-text-action")).toBeEnabled();
  }
  await page.locator("#ms-contact").scrollIntoViewIfNeeded();
  await expect(page.locator("#ms-contact-title")).toBeVisible();
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
