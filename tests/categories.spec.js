import { test, expect } from "./fixtures";

for (const width of [440, 1440]) {
  test(
    "category-first catalog and animated switching at " + width + "px",
    async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/produktet.html");
      const directory = page.locator(".category-directory-grid");
      await expect(directory.getByRole("link")).toHaveCount(5);
      await expect(page.locator("#product-grid")).toHaveCount(0);
      const phones = directory.getByRole("link", {
        name: "iPhone & telefona",
        exact: true,
      });
      await expect(phones.locator("img")).toHaveCount(4);
      await expect(page.locator("main")).not.toHaveClass("page-entering");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: "test-results/categories-" + width + ".png",
        fullPage: width === 1440,
      });
      await phones.click();
      await expect(page).toHaveURL(/kategoria=telefona/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "iPhone & telefona",
      );
      await expect(page.locator("#product-grid .product-card")).toHaveCount(4);
      await page.locator("#catalog-search").fill("Air");
      await expect(page.locator("#product-grid .product-card")).toHaveCount(1);
      await page.locator("#catalog-search").fill("missing product");
      await expect(
        page.getByRole("heading", { name: "Asnjë produkt i gjetur." }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Hiqe kërkimin" }).click();
      await expect(page.locator("#product-grid .product-card")).toHaveCount(4);
      await page
        .getByRole("navigation", { name: "Kategoritë", exact: true })
        .getByRole("link", { name: "Trotineta elektrikë", exact: true })
        .click();
      await expect(page).toHaveURL(/kategoria=trotineta/);
      await expect(page.locator("main")).toHaveClass("page-entering");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Trotineta elektrikë",
      );
      expect(
        await page
          .locator("#product-grid .product-card")
          .first()
          .evaluate((element) => element.getAnimations().length),
      ).toBeGreaterThan(0);
      await page.goBack();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "iPhone & telefona",
      );
      await page.getByRole("link", { name: "Ndrysho kategorinë" }).click();
      await expect(directory.getByRole("link")).toHaveCount(5);
      await page.locator("#catalog-search").fill("iPhone Air");
      await expect(directory.getByRole("link")).toHaveCount(1);
    },
  );
}
