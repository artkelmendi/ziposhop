import { test, expect, fixtureCatalog } from "./fixtures";
import { adminBackend, login } from "./admin-backend";

for (const width of [390, 1440]) {
  test(`category banners fit all categories and custom names at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 956 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const catalog = fixtureCatalog();
    catalog.categories.push({
      id: "custom",
      name: "Pajisje për shtëpi, punë dhe argëtim",
      description: "Një përzgjedhje e re me pajisje dhe aksesorë për çdo ditë.",
      artwork: [], image: "", active: true, sort_order: 10,
    });
    await page.route("**/rest/v1/categories?**", route => route.fulfill({ json: catalog.categories }));
    for (const category of catalog.categories) {
      await page.goto(`/produktet/?kategoria=${category.id}`);
      const banner = page.locator(".category-screen .catalog-top");
      await expect(banner.getByRole("heading", { level: 1 })).toHaveText(category.name);
      await expect(banner.locator("p")).toHaveCount(0);
      await expect(page.locator("main")).not.toHaveClass("page-entering");
      await expect(banner.locator('[data-media-state="loading"]')).toHaveCount(0);
      const layout = await banner.evaluate(node => {
        const box = node.getBoundingClientRect();
        const heading = node.querySelector("h1").getBoundingClientRect();
        return {
          painted: getComputedStyle(node).backgroundColor !== "rgba(0, 0, 0, 0)",
          contained: heading.left >= box.left && heading.right <= box.right && heading.top >= box.top && heading.bottom <= box.bottom,
          overflow: document.documentElement.scrollWidth > innerWidth,
          height: box.height,
        };
      });
      expect(layout.painted).toBe(true);
      expect(layout.contained).toBe(true);
      expect(layout.overflow).toBe(false);
      expect(layout.height).toBeLessThan(280);
      await expect(banner.locator("img")).toHaveCount(category.image || category.artwork.length ? 1 : 0);
      if (category.image || category.artwork.length) {
        await expect(banner.locator("[data-media-state]")).toHaveAttribute("data-media-state", "ready");
      }
      await page.screenshot({ path: `.impeccable/review/category-${category.id}-${width}.png` });
    }
  });
}

test("admin transitions remain responsive to rapid navigation and reduced motion", async ({ page }) => {
  await adminBackend(page);
  await login(page);
  const panel = page.locator("#admin-content");
  await expect(page.getByRole("heading", { name: "Produktet", exact: true })).toBeVisible();
  await expect.poll(() => panel.evaluate(node => node.getAnimations().length)).toBe(0);
  const nav = page.getByRole("navigation", { name: "Administrimi" });
  const moving = await nav.getByRole("button", { name: "Kategoritë" }).evaluate(button => {
    button.click();
    return document.querySelector("#admin-content").getAnimations().length;
  });
  expect(moving).toBeGreaterThan(0);
  await expect(page.getByRole("heading", { name: "Kategoritë", exact: true })).toBeVisible();
  await expect.poll(() => panel.evaluate(node => node.getAnimations().length)).toBe(0);
  // The final request wins, including a return to the current section mid-exit.
  await nav.evaluate(node => {
    const buttons = node.querySelectorAll("button");
    buttons[2].click();
    buttons[0].click();
    buttons[1].click();
  });
  await expect.poll(() => panel.evaluate(node => node.getAnimations().length)).toBe(0);
  await expect(nav.getByRole("button", { name: "Kategoritë" })).toHaveAttribute("aria-current", "page");
  await expect(panel).not.toHaveAttribute("inert");
  await nav.getByRole("button", { name: "Ballina" }).evaluate(button => button.click());
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByRole("heading", { name: "Ballina", exact: true })).toBeVisible();
  await expect.poll(() => panel.evaluate(node => node.getAnimations().length)).toBe(0);
  await nav.getByRole("button", { name: "Produktet" }).click();
  await page.getByRole("button", { name: "Shto produkt", exact: true }).click();
  await expect(page.getByLabel("Emri i produktit")).toBeEditable();
  await expect(panel).not.toHaveAttribute("inert");
  await expect.poll(() => panel.evaluate(node => node.getAnimations().length)).toBe(0);
});
