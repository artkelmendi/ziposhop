import { test, expect, fixtureCatalog } from "./fixtures";

for (const width of [390, 1440]) {
  test(`category filter animates both ways and supports keyboard navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 956 });
    await page.addInitScript(() => {
      window.filterTransitions = [];
      document.addEventListener("transitionrun", event => {
        if (event.target.matches('nav[aria-label="Kategoritë"]') && event.propertyName === "opacity") {
          window.filterTransitions.push(event.target.parentElement.dataset.open);
        }
      });
    });
    await page.goto("/produktet.html?kategoria=telefona");
    await expect(page.locator("main")).not.toHaveClass("page-entering");
    const button = page.getByRole("button", { name: /Filtro kategorinë/ });
    const filter = page.getByRole("navigation", { name: "Kategoritë", exact: true });
    await expect(page.getByRole("search")).toHaveCount(0);
    await expect(page.locator(".filter-list")).toHaveCount(0);
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(filter.getByRole("link")).toHaveCount(6);
    await expect(filter.locator('[aria-current="page"]')).toContainText("iPhone & telefona");
    await expect(filter).toHaveCSS("opacity", "1");
    await page.screenshot({ path: `.impeccable/review/category-filter-${width}.png` });
    const menu = await filter.boundingBox();
    expect(menu.x).toBeGreaterThanOrEqual(0);
    expect(menu.x + menu.width).toBeLessThanOrEqual(width);
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(filter).toBeHidden();
    expect(await page.evaluate(() => window.filterTransitions)).toEqual(["true", "false"]);
    await button.focus();
    await page.keyboard.press("ArrowDown");
    await expect(filter.getByRole("link").first()).toBeFocused();
    await page.keyboard.press("End");
    await expect(filter.getByRole("link").last()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(button).toBeFocused();
    await expect(filter).toBeHidden();
    await button.click();
    await page.locator("h1").click();
    await expect(filter).toBeHidden();
    await button.click();
    await filter.getByRole("link", { name: /Trotineta elektrikë/ }).click();
    await expect(page).toHaveURL(/kategoria=trotineta/);
    await expect(page.locator("h1")).toHaveText("Trotineta elektrikë");
    await expect(page.getByRole("button", { name: /Filtro kategorinë/ })).toHaveAttribute("aria-expanded", "false");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: /Filtro kategorinë/ }).click();
    await expect(filter).toHaveCSS("transform", "none");
    await expect(filter).toHaveCSS("transition-duration", "0s");
  });
}

test("header search finds products across categories and keeps shareable results", async ({ page }) => {
  await page.goto("/produktet.html?kategoria=telefona");
  await page.getByRole("link", { name: "Kërko në katalog", exact: true }).click();
  const search = page.getByRole("searchbox", { name: "Kërko produkte" });
  await expect(search).toBeFocused();
  await search.fill("air");
  await expect(page.locator("#product-grid h3")).toHaveText(["iPhone Air", "iPad Air 11″", "AirPods Pro 3"]);
  await search.press("Enter");
  await expect(page).toHaveURL(/\?q=air$/);
  await page.reload();
  await expect(search).toHaveValue("air");
  await expect(page.locator("#product-grid .product-card")).toHaveCount(3);
  await page.getByRole("link", { name: "Kërko në katalog", exact: true }).click();
  await expect(search).toBeFocused();
  await expect(search).toHaveValue("air");
  await search.fill("Motore");
  await expect(page.locator("#product-grid h3")).toHaveText(["NIU NQi Sport"]);
  await search.fill("no such product");
  await expect(page.getByRole("heading", { name: "Asnjë produkt i gjetur." })).toBeVisible();
  await page.getByRole("button", { name: "Hiqe kërkimin" }).click();
  await expect(search).toHaveValue("");
  await expect(page.locator(".category-directory-grid > a")).toHaveCount(5);
});

test("category filter stays inside short viewports and closes on resize", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 568 });
  await page.goto("/produktet.html?kategoria=telefona");
  await expect(page.locator("main")).not.toHaveClass("page-entering");
  const button = page.getByRole("button", { name: /Filtro kategorinë/ });
  await button.click();
  const filter = page.getByRole("navigation", { name: "Kategoritë", exact: true });
  await expect(filter).toHaveCSS("opacity", "1");
  const box = await filter.boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(64);
  expect(box.y + box.height).toBeLessThanOrEqual(568);
  await page.setViewportSize({ width: 568, height: 390 });
  await expect(button).toHaveAttribute("aria-expanded", "false");
});

test("global product search paginates larger inventories and category selection clears search", async ({ page }) => {
  const catalog = fixtureCatalog();
  catalog.products = Array.from({ length: 80 }, (_, index) => ({
    ...catalog.products[0],
    id: `search-${index}`,
    name: `Model kërkimi ${index + 1}`,
    category: index % 2 ? "telefona" : "aksesore",
  }));
  await page.route("**/rest/v1/products?**", route => route.fulfill({ json: catalog.products }));
  await page.goto("/produktet.html?q=kerkimi");
  await expect(page.locator("#product-grid .product-card")).toHaveCount(24);
  const pagination = page.getByRole("navigation", { name: "Faqet e produkteve" });
  await pagination.getByRole("button", { name: "Tjetra", exact: true }).click();
  await expect(page).toHaveURL(/faqja=2/);
  await page.reload();
  await expect(page.locator("#product-grid h3").first()).toHaveText("Model kërkimi 25");
  await expect(page.locator("#product-grid .product-card")).toHaveCount(24);
  await page.getByRole("button", { name: /Filtro kategorinë/ }).click();
  await page.getByRole("navigation", { name: "Kategoritë", exact: true })
    .getByRole("link", { name: /Aksesorë/ }).click();
  await expect(page).toHaveURL(/produktet\.html\?kategoria=aksesore$/);
  await expect(page.getByRole("search")).toHaveCount(0);
  await expect(page.locator(".catalog-status")).toHaveText("40 produkte");
  await expect(page.locator("#product-grid .product-card")).toHaveCount(24);
});
