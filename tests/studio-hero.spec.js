import { test, expect } from "./fixtures";

for (const width of [440, 1440]) {
  test(
    "unified product hero and saved classic at " + width + "px",
    async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/");
      const hero = page.getByRole("region", { name: "Zbulo koleksionin ZIPO" });
      await expect(hero.getByRole("heading", { level: 1 })).toContainText(
        "Për çdo ditë",
      );
      await expect(hero.locator("img")).toHaveCount(7);
      await expect(hero.getByRole("tab")).toHaveCount(0);
      await expect(hero.locator("[aria-busy=true]")).toHaveCount(0);
      await expect(page.locator("main")).not.toHaveClass("page-entering");
      const types = await hero
        .locator("[data-category]")
        .evaluateAll((elements) => [
          ...new Set(elements.map((element) => element.dataset.category)),
        ]);
      expect(types.sort()).toEqual([
        "aksesore",
        "motore",
        "tableta",
        "telefona",
        "trotineta",
      ]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const box = await hero.boundingBox();
      for (const image of await hero.locator("img").all()) {
        const bounds = await image.boundingBox();
        expect(bounds.width).toBeGreaterThan(20);
        expect(bounds.y).toBeGreaterThanOrEqual(box.y);
        expect(bounds.y + bounds.height).toBeLessThanOrEqual(
          box.y + box.height,
        );
      }
      await page.screenshot({ path: "test-results/studio-" + width + ".png" });
      await hero.getByRole("link", { name: "Zbulo produktet" }).click();
      await expect(page).toHaveURL(/produktet\.html$/);
      await expect(page.locator(".category-directory-grid")).toBeVisible();
      await page.goto("/?hero=classic");
      await expect(page.locator(".still-piece")).toHaveCount(5);
      await expect(page.locator("#hero-title")).toContainText("Teknologji");
    },
  );
}
