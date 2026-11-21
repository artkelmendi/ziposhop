import { test, expect } from "./fixtures";
import { adminBackend, login } from "./admin-backend";

for (const [name, width] of [
  ["mobile", 440],
  ["user-648", 648],
  ["desktop", 1440],
]) {
  test(`admin layout and editor fit ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await adminBackend(page);
    await page.goto("/admin.html");
    await expect(
      page.getByRole("heading", { name: "Login" }),
    ).toBeVisible();
    await page.screenshot({
      path: `.impeccable/review/login-${name}.png`,
      fullPage: true,
    });
    await login(page);
    await expect(page.locator("tbody tr")).toHaveCount(9);
    await expect(
      page.locator('tbody [data-media-state="loading"]'),
    ).toHaveCount(0);
    await expect(page.locator('tbody [data-media-state="error"]')).toHaveCount(
      0,
    );
    await expect
      .poll(() =>
        page
          .locator("tbody img")
          .evaluateAll((images) =>
            images.every((image) => image.complete && image.naturalWidth > 0),
          ),
      )
      .toBe(true);
    await page.screenshot({
      path: `.impeccable/review/${name}.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const table = await page.locator("table").evaluate((node) => ({
      table: node.getBoundingClientRect().width,
      container: node.parentElement.clientWidth,
    }));
    expect(table.table).toBeLessThanOrEqual(table.container + 1);
    await page
      .getByRole("button", { name: "Ndrysho iPhone 17 Pro", exact: true })
      .click();
    await expect(page.getByLabel("Emri i produktit")).toHaveValue(
      "iPhone 17 Pro",
    );
    await expect(page.locator('main [data-media-state="loading"]')).toHaveCount(
      0,
    );
    await expect(page.locator('main [data-media-state="error"]')).toHaveCount(
      0,
    );
    await expect
      .poll(() =>
        page
          .locator("main img")
          .evaluateAll((images) =>
            images.every((image) => image.complete && image.naturalWidth > 0),
          ),
      )
      .toBe(true);
    await page.screenshot({
      path: `.impeccable/review/editor-${name}.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
