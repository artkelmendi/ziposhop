import { test, expect, fixtureCatalog } from "./fixtures";
import { appleProducts } from "../src/data/apple2026";
import { existsSync } from "node:fs";

test("Apple additions have local photos and resolve from the hero to real admin records", async ({ page }) => {
  const catalog = fixtureCatalog();
  const additions = appleProducts.map((product) => ({ ...product, published: true, available: true, images: [] }));
  additions[0].id = "iphone-18-pro-max-admin-created";
  catalog.products.push(...additions);
  for (const product of additions) expect(existsSync(`public/assets/${product.image}`)).toBe(true);
  await page.route("https://zipo-test.supabase.co/rest/v1/products*", (route) => route.fulfill({ json: catalog.products }));
  await page.addInitScript(() => sessionStorage.setItem("zipo:intro-seen", "1"));
  await page.goto("/");
  const hero = page.getByRole("region", { name: "Zbulo koleksionin ZIPO" });
  await expect(hero.locator('img[src*="phone-18-pro-max"]')).toHaveCount(1);
  await expect(hero.getByRole("link", { name: "Shiko iPhone Air", exact: true })).toHaveAttribute("href", /produkt=iphone-air$/);
  await expect(hero.locator('[data-media-state="error"]')).toHaveCount(0);
  const max = hero.getByRole("link", { name: "Shiko iPhone 18 Pro Max — Burgundy", exact: true });
  await expect(max).toHaveAttribute("href", /produkt=iphone-18-pro-max-admin-created$/);
  await max.click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("iPhone 18 Pro Max");
  await expect(page.locator(".detail-price")).toContainText(/1[\s,.]?499[,.]00/);
  await page.goto("/produktet.html?kategoria=telefona");
  for (const name of ["iPhone 18 Pro", "iPhone 18 Pro Max", "iPhone Duo", "iPhone 17e"]) {
    await expect(page.locator("#product-grid").getByRole("heading", { name, exact: true })).toBeVisible();
  }
  await page.goto("/produktet.html?kategoria=tableta");
  await expect(page.locator("#product-grid .product-card")).toHaveCount(7);
  await page.goto("/produktet.html?kategoria=aksesore");
  for (const name of ["Apple Watch Series 12", "Apple Watch Ultra 4", "AirPods 5", "AirPods Max 2"]) {
    await expect(page.locator("#product-grid").getByRole("heading", { name, exact: true })).toBeVisible();
  }
});

test("collection runs through hover without a pause control", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("zipo:intro-seen", "1"));
  await page.goto("/");
  const collection = page.getByRole("region", { name: "Nga koleksioni", exact: true });
  await collection.scrollIntoViewIfNeeded();
  await expect(collection.locator("button")).toHaveCount(0);
  await expect(collection.getByRole("link", { name: "Hap katalogun" })).toBeVisible();
  const track = collection.locator(".collection-track");
  const before = await track.evaluate((el) => el.getAnimations()[0]?.currentTime);
  await collection.locator(".collection-window").hover();
  await expect.poll(() => track.evaluate((el) => el.getAnimations()[0]?.currentTime)).toBeGreaterThan(before + 100);
  await expect(track).toHaveCSS("animation-play-state", "running");
});
