import { test, expect } from "@playwright/test";

for (const width of [440, 1440]) {
  test(`logo intro reveals the loaded page once per session at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 956 });
    await page.goto("/");
    const intro = page.locator("[data-brand-intro]");
    await expect(intro).toHaveAttribute("data-phase", "covered");
    await expect(page.locator("[data-intro-covered]")).toHaveAttribute(
      "inert",
      "",
    );
    const letter = intro.locator("path").first();
    expect(await letter.evaluate((node) => node.getAnimations().length)).toBe(
      2,
    );
    const hero = page.locator('[aria-label="Zbulo koleksionin ZIPO"]');
    await expect(hero.locator("img")).toHaveCount(7);
    const heading = hero.locator("h1 span").first();
    await expect(heading).toHaveCSS("animation-play-state", "paused");
    await expect(intro).toHaveAttribute("data-phase", "opening");
    await expect(heading).toHaveCSS("animation-play-state", "running");
    await expect(page.locator("main")).toHaveClass("page-entering");
    await expect(intro).toHaveCount(0);
    await expect(page.locator("[inert]")).toHaveCount(0);
    expect(
      await page.evaluate(() => document.documentElement.style.overflow),
    ).toBe("");
    await hero.getByRole("link", { name: "Zbulo produktet" }).click();
    await expect(page.locator(".category-directory-grid a")).toHaveCount(5);
    await expect(intro).toHaveCount(0);
    await page.reload();
    await expect(page.locator(".category-directory-grid a")).toHaveCount(5);
    await expect(intro).toHaveCount(0);
    await page.goto("/index.html?intro=1");
    await expect(intro).toHaveCount(1);
    await page.getByRole("button", { name: "Kalo hyrjen" }).click();
    await expect(intro).toHaveCount(0);
    await expect(page.locator("main")).toBeFocused();
  });
}

test("Escape skips the intro and reduced motion bypasses it, including replay", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("[data-brand-intro]")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-brand-intro]")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?intro=1");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("[data-brand-intro], [inert]")).toHaveCount(0);
});

test("the intro releases the page if storage is blocked or motion preferences change", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", {
      get() {
        throw new DOMException("Storage disabled", "SecurityError");
      },
    });
  });
  await page.goto("/");
  await expect(page.locator("[data-brand-intro]")).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-brand-intro], [inert]")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
