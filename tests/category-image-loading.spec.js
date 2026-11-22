import { test, expect } from "./fixtures";
import { stat } from "node:fs/promises";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("zipo:intro-seen", "1"));
});

test("a slow banner keeps its title and dimensions, then fades in after decoding", async ({ page }) => {
  await page.setViewportSize({ width: 428, height: 926 });
  let release;
  const pending = new Promise(resolve => release = resolve);
  await page.route("**/assets/banner-telefona-*.webp", async route => {
    await pending;
    await route.continue();
  });
  await page.goto("/produktet/?kategoria=telefona", { waitUntil: "domcontentloaded" });
  const banner = page.locator('.catalog-top[data-category="telefona"]');
  const media = banner.locator("[data-media-state]");
  const photo = media.locator("img");
  await expect(banner.locator("h1")).toHaveText("iPhone & telefona");
  await expect(media).toHaveAttribute("aria-busy", "true");
  await expect(photo).toHaveCSS("opacity", "0");
  await expect(banner.locator(".skeleton")).toHaveCount(0);
  const height = (await banner.boundingBox()).height;
  const duration = await photo.evaluate(img => parseFloat(getComputedStyle(img).transitionDuration));
  expect(duration).toBeGreaterThanOrEqual(0.5);
  release();
  await expect(media).toHaveAttribute("data-media-state", "ready");
  await expect(photo).toHaveCSS("opacity", "1");
  expect((await banner.boundingBox()).height).toBe(height);
  await page.screenshot({ path: ".impeccable/review/category-loading-mobile.png" });
});

test("failed category photography leaves a usable, quiet heading", async ({ page }) => {
  await page.route("**/assets/banner-*.webp", route => route.abort());
  await page.goto("/produktet/?kategoria=motore");
  const banner = page.locator(".catalog-top[data-category]");
  await expect(banner.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(banner.locator("[data-media-state]")).toHaveAttribute("data-media-state", "error");
  await expect(banner.locator(".media-failure")).toBeHidden();
  await expect(page.locator("#product-grid .product-card")).toHaveCount(1);
});

test("category selection preloads the same responsive image that is rendered", async ({ page }) => {
  await page.goto("/produktet/");
  const link = page.locator(".category-directory-grid").getByRole("link", { name: "iPhone & telefona", exact: true });
  await link.focus();
  const preload = page.locator('head link[data-category-preload="telefona"]');
  await expect(preload).toHaveCount(1);
  await expect(preload).toHaveAttribute("fetchpriority", "high");
  await link.click();
  const image = page.locator(".catalog-top[data-category] img");
  expect(await image.getAttribute("srcset")).toBe(await preload.getAttribute("imagesrcset"));
  expect(await image.getAttribute("sizes")).toBe(await preload.getAttribute("imagesizes"));
  await expect(image).toHaveCSS("opacity", "1");
});

test("all five banners use lighter images on high density phones", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 428, height: 926 }, deviceScaleFactor: 3, reducedMotion: "reduce" });
  const page = await context.newPage();
  // This preview has fixture credentials; the category heading can render before the database responds.
  await page.route("**/rest/v1/**", route => route.fulfill({ status: 503, body: "unavailable" }));
  for (const category of ["telefona", "motore", "trotineta", "tableta", "aksesore"]) {
    await page.goto(`http://127.0.0.1:4174/produktet/?kategoria=${category}`);
    const image = page.locator(".catalog-top[data-category] img");
    await expect(page.locator(".catalog-top [data-media-state]")).toHaveAttribute("data-media-state", "ready");
    const source = await image.evaluate(img => img.currentSrc);
    expect(source).toContain(`banner-${category}-1280.webp`);
    const size = (await stat(`public/assets/${source.split("/").pop()}`)).size;
    expect(size).toBeLessThan(35000);
  }
  await context.close();
});
