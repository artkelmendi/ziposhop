import { test, expect } from "@playwright/test";

for (const width of [440, 1440]) {
  test("hero composition stays positioned at " + width + "px", async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const hero = page.locator(".hero");
    await expect(page.locator(".still-piece")).toHaveCount(5);
    await expect(page.locator(".still-piece[aria-busy=true]")).toHaveCount(0);
    const heroBox = await hero.boundingBox();
    const pieces = await page.locator(".still-piece").evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect();
      return { position: getComputedStyle(element).position, top: box.top, bottom: box.bottom, width: box.width };
    }));
    expect(pieces.every(piece => piece.position === "absolute")).toBe(true);
    expect(pieces.every(piece => piece.width > 20 && piece.top >= heroBox.y && piece.bottom <= heroBox.y + heroBox.height)).toBe(true);
    await page.screenshot({ path: "test-results/hero-" + width + ".png" });

    for (const name of ["iPhone", "Qyteti me"]) {
      await page.getByRole("button", { name: "Pamja tjetër" }).click();
      await expect(page.locator("#hero-title")).toContainText(name);
      const media = page.locator(".hero-single");
      await expect(media).toHaveCSS("position", "absolute");
      await expect(media).toHaveAttribute("aria-busy", "false");
      const imageBox = await media.locator("img").boundingBox();
      expect(imageBox.height).toBeGreaterThan(150);
      expect(imageBox.y).toBeGreaterThanOrEqual(heroBox.y);
      expect(imageBox.y + imageBox.height).toBeLessThanOrEqual(heroBox.y + heroBox.height);
    }
    await page.getByRole("button", { name: "Pamja tjetër" }).click();
    await expect(page.locator(".still-piece")).toHaveCount(5);
  });
}
