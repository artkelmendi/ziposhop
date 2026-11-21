import { test, expect } from "./fixtures";

async function holdCatalog(page) {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route("https://zipo-test.supabase.co/rest/v1/**", async route => {
    await gate;
    await route.fallback();
  });
  return release;
}

test("home and catalog headings render before the database without page skeletons", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const release = await holdCatalog(page);
  try {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText("Për çdo ditëPër çdo lëvizje");
    await expect(page.locator(".skeleton")).toHaveCount(0);
    await page.getByRole("link", { name: "Zbulo produktet", exact: true }).click();
    await expect(page.locator("h1")).toHaveText("Katalogu i produkteve");
    await expect(page.locator(".skeleton")).toHaveCount(0);
    await page.locator("h1").evaluate(node => { window.catalogTitle = node; });
    await expect(page.locator("footer a[href$='admin.html']")).toHaveCount(0);
  } finally { release(); }
  await expect(page.locator(".category-directory-grid > a")).toHaveCount(5);
  expect(await page.evaluate(() => window.catalogTitle === document.querySelector("h1"))).toBe(true);
});

test("category titles stay mounted while only products show loading placeholders", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const release = await holdCatalog(page);
  try {
    await page.goto("/produktet.html?kategoria=telefona");
    await expect(page.locator("h1")).toHaveText("iPhone & telefona");
    await page.locator("h1").evaluate(node => { window.catalogTitle = node; });
    await expect(page.locator(".products-loading")).toHaveAttribute("aria-busy", "true");
    await expect(page.locator(".products-loading .skeleton-card")).toHaveCount(4);
    await expect(page.locator(".products-loading .skeleton").first()).toBeVisible();
    await expect(page.locator(".catalog-top .skeleton")).toHaveCount(0);
    await expect(page.locator(".category-screen > .route-skeleton")).toHaveCount(0);
    await page.screenshot({ path: ".impeccable/review/product-only-loading.png" });
  } finally { release(); }
  await expect(page.locator("#product-grid .product-card")).toHaveCount(4);
  await expect(page.locator(".products-loading")).toHaveCount(0);
  expect(await page.evaluate(() => window.catalogTitle === document.querySelector("h1"))).toBe(true);
});

test("slow home imagery and bootstrap HTML have no skeleton screens", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route("**/assets/*.webp", async route => { await gate; await route.continue(); });
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('[data-media-state="loading"]').first()).toHaveAttribute("aria-busy", "true");
    await expect(page.locator("main")).not.toHaveClass("page-entering");
    await expect(page.locator(".skeleton")).toHaveCount(0);
    for (const path of ["/index.html", "/produktet.html", "/kontakti.html", "/admin.html"]) {
      const response = await page.request.get(path);
      expect(await response.text()).not.toContain("boot-block");
    }
  } finally { release(); }
});
