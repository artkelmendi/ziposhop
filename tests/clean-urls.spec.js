import { test, expect } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("old bookmarks become clean URLs and clean pages refresh successfully", async ({ page }) => {
  for (const [old, clean, title] of [
    ["/index.html", "/", "Për çdo ditë"],
    ["/produktet.html", "/produktet/", "Katalogu i produkteve"],
    ["/produktet.html?kategoria=telefona", "/produktet/?kategoria=telefona", "iPhone & telefona"],
    ["/produktet.html?produkt=iphone-air", "/produktet/?produkt=iphone-air", "iPhone Air"],
    ["/kontakti.html", "/kontakti/", "Na gjen"],
    ["/pyetje.html", "/pyetje/", "Pyetje të shpeshta"],
    ["/privatesia.html", "/privatesia/", "Privatësia dhe cookies"],
    ["/admin.html", "/admin/", "Login"],
  ]) {
    expect((await page.goto(old)).status()).toBe(200);
    expect(new URL(page.url()).pathname + new URL(page.url()).search).toBe(clean);
    await expect(page.locator("h1")).toContainText(title);
    expect((await page.reload()).status()).toBe(200);
    await expect(page.locator("h1")).toContainText(title);
  }
});

test("navigation stays in React, preserves history and publishes only clean links", async ({ page }) => {
  await page.goto("/produktet/");
  await page.locator("header").evaluate(header => header.dataset.instance = "persistent");
  await page.locator(".category-directory-grid").getByRole("link", { name: "iPhone & telefona", exact: true }).click();
  await expect(page).toHaveURL(/\/produktet\/\?kategoria=telefona$/);
  await page.locator("#product-grid").getByRole("link", { name: /iPhone Air/ }).click();
  await expect(page).toHaveURL(/\/produktet\/\?produkt=iphone-air$/);
  await page.goBack();
  await expect(page.locator("h1")).toHaveText("iPhone & telefona");
  await page.goBack();
  await expect(page.locator("h1")).toHaveText("Katalogu i produkteve");
  await page.goForward();
  await expect(page.locator("h1")).toHaveText("iPhone & telefona");
  await expect(page.locator("header")).toHaveAttribute("data-instance", "persistent");
  expect(await page.locator('a[href*=".html"]').count()).toBe(0);
  await page.getByRole("link", { name: "Kërko në katalog", exact: true }).click();
  await expect(page).toHaveURL(/\/produktet\/#kerko$/);
  await expect(page.getByRole("searchbox")).toBeFocused();
});
