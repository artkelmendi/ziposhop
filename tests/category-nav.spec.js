import { test, expect, fixtureCatalog } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [320, 440, 768, 1440]) {
  test(`the black category strip stays compact and contained at ${width}px`, async ({ page, browserName }) => {
    await page.setViewportSize({ width, height: 956 });
    await page.goto("/");
    const header = page.getByRole("banner");
    const nav = header.getByRole("navigation", { name: "Shfleto kategoritë" });
    await expect(nav.getByRole("link")).toHaveCount(6);
    await expect(nav).toHaveCSS("background-color", "rgb(21, 23, 25)");
    expect((await nav.boundingBox()).height).toBe(44);
    expect((await header.boundingBox()).height).toBe(width <= 750 ? 108 : 120);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const mainTop = await page.locator("main").evaluate(node => node.getBoundingClientRect().top);
    expect(mainTop).toBeGreaterThanOrEqual((await header.boundingBox()).height);
    await page.screenshot({ path: `.impeccable/review/category-nav/${browserName}-${width}.png` });
    await page.evaluate(() => scrollTo({ top: 500, behavior: "instant" }));
    expect((await header.boundingBox()).y).toBe(0);
    await expect(nav.getByRole("link", { name: "Të gjitha", exact: true })).toBeVisible();
  });
}

test("category links keep the header mounted and follow category, product and search routes", async ({ page }) => {
  await page.goto("/produktet/");
  await page.locator("header").evaluate(node => node.dataset.instance = "same");
  const nav = page.getByRole("navigation", { name: "Shfleto kategoritë" });
  await expect(nav.getByRole("link", { name: "Të gjitha", exact: true })).toHaveAttribute("aria-current", "page");
  await nav.getByRole("link", { name: "iPhone & telefona", exact: true }).click();
  await expect(page).toHaveURL(/\/produktet\/\?kategoria=telefona$/);
  await expect(nav.locator("[aria-current]")).toHaveText("iPhone & telefona");
  await expect(page.locator("header")).toHaveAttribute("data-instance", "same");
  await page.locator("#product-grid").getByRole("link", { name: /iPhone Air/ }).click();
  await expect(nav.locator("[aria-current]")).toHaveText("iPhone & telefona");
  await page.getByRole("link", { name: "Kërko në katalog", exact: true }).click();
  await expect(page.getByRole("searchbox")).toBeFocused();
  await expect(nav.locator("[aria-current]")).toHaveText("Të gjitha");
});

test("phone keyboard navigation exposes offscreen categories without moving the page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/produktet/");
  const nav = page.getByRole("navigation", { name: "Shfleto kategoritë" });
  const accessories = nav.getByRole("link", { name: "Aksesorë", exact: true });
  await accessories.focus();
  const bounds = await accessories.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  await page.keyboard.press("Enter");
  await expect(page.locator("h1")).toHaveText("Aksesorë");
  await expect(nav.locator("[aria-current]")).toHaveText("Aksesorë");
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.screenshot({ path: ".impeccable/review/category-nav/mobile-active.png" });
});

test("admin category changes fit the same strip without a loading jump", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const catalog = fixtureCatalog();
  catalog.categories.push({ id: "pajisje-te-reja", name: "Pajisje për shtëpi dhe punë", active: true, sort_order: 10, image: "", artwork: [] });
  let release;
  const pending = new Promise(resolve => release = resolve);
  await page.route("**/rest/v1/categories?**", async route => { await pending; await route.fulfill({ json: catalog.categories }); });
  await page.goto("/produktet/", { waitUntil: "domcontentloaded" });
  const nav = page.getByRole("navigation", { name: "Shfleto kategoritë" });
  await expect(nav.getByRole("link")).toHaveCount(6);
  const height = (await page.locator("header").boundingBox()).height;
  release();
  await expect(nav.getByRole("link")).toHaveCount(7);
  expect((await page.locator("header").boundingBox()).height).toBe(height);
  await expect(nav.locator(".skeleton")).toHaveCount(0);
  await nav.getByRole("link", { name: "Pajisje për shtëpi dhe punë", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("Pajisje për shtëpi dhe punë");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
