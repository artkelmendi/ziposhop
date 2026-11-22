import { test, expect } from "./fixtures";
import { questions } from "../src/data/faq";
import { adminBackend, login } from "./admin-backend";

for (const width of [390, 768, 1440]) {
  test(`FAQ answers animate open and closed and fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/pyetje/");
    await expect(page.locator("h1")).toHaveText("Pyetje të shpeshta");
    await expect(page.locator("main")).not.toHaveClass("page-entering");
    await expect(page.locator(".skeleton")).toHaveCount(0);
    const first = page.getByRole("button", { name: questions[0].question, exact: true });
    const panel = page.locator(`[id="${await first.getAttribute("aria-controls")}"]`);
    await first.click();
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toContainText("Po. Telefonat që ofrojmë janë origjinalë.");
    await expect(panel).toHaveCSS("opacity", "1");
    await page.screenshot({ path: `.impeccable/review/faq-${width}.png`, fullPage: true, animations: "disabled" });
    await first.click();
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect.poll(() => panel.evaluate(node => node.getBoundingClientRect().height)).toBe(0);
    for (const item of questions.slice(1)) {
      const button = page.getByRole("button", { name: item.question, exact: true });
      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      const answer = page.getByRole("region", { name: item.question, exact: true });
      await expect(answer).toHaveCSS("opacity", "1");
      await expect(page.locator('main button[aria-expanded="true"]')).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await first.focus();
    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toHaveCSS("transition-duration", "0s");
    await page.keyboard.press("Space");
    await expect(first).toHaveAttribute("aria-expanded", "false");
  });
}

test("product prices appear in cards, details and the featured product without demo notices", async ({ page }) => {
  await page.goto("/produktet/?kategoria=telefona");
  await expect(page.locator("#product-grid .product-price")).toHaveCount(4);
  await expect(page.locator('#product-grid a[href*="iphone-17-pro"] .product-price')).toContainText(/1[\s.,]?099[.,]00/);
  await page.goto("/produktet/?produkt=iphone-17-pro");
  await expect(page.locator(".detail-price")).toContainText(/1[\s.,]?099[.,]00/);
  await expect(page.getByText(/Model ilustrues|Përzgjedhje demonstrimi/)).toHaveCount(0);
  await page.goto("/");
  await expect(page.locator("#produkti-i-kerkuar .detail-price")).toContainText(/449[.,]00/);
  await expect(page.getByText(/Model ilustrues|Përzgjedhje demonstrimi/)).toHaveCount(0);
  const mobileToggle = page.getByRole("button", { name: "Hap menunë", exact: true });
  const mobile = await mobileToggle.isVisible();
  if (mobile) await mobileToggle.click();
  await page.getByRole("navigation", { name: mobile ? "Navigimi në telefon" : "Navigimi kryesor" })
    .getByRole("link", { name: "Pyetje të shpeshta", exact: true }).click();
  await expect(page).toHaveURL(/pyetje\/$/);
});

test("data arriving during admin navigation preserves the requested section", async ({ page }) => {
  await adminBackend(page);
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route("**/rest/v1/products?**", async route => {
    if (route.request().method() === "GET") await gate;
    await route.fallback();
  });
  await login(page);
  await page.getByRole("navigation", { name: "Administrimi" })
    .getByRole("button", { name: "Kategoritë", exact: true }).click();
  release();
  await expect(page.getByRole("heading", { name: "Kategoritë", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Shto kategori", exact: true })).toBeEnabled();
});

test("saving a price waits for the refreshed catalog before returning to an editable list", async ({ page }) => {
  const backend = await adminBackend(page);
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  let hold = false;
  await page.route("**/rest/v1/products?**", async route => {
    if (hold && route.request().method() === "GET") await gate;
    await route.fallback();
  });
  await login(page);
  await page.getByRole("button", { name: "Ndrysho iPhone 17 Pro", exact: true }).click();
  await page.getByLabel(/Çmimi/).fill("999");
  hold = true;
  try {
    await page.getByRole("button", { name: "Ruaj produktin", exact: true }).click();
    await expect.poll(() => backend.catalog.products.find(product => product.id === "iphone-17-pro").price).toBe(999);
    await expect(page.getByRole("heading", { name: "Ndrysho produktin", exact: true })).toBeVisible();
    await expect(page.getByLabel(/Çmimi/)).toBeDisabled();
    await expect(page.locator("tbody")).toHaveCount(0);
  } finally { hold = false; release(); }
  await expect(page.getByRole("heading", { name: "Produktet", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Ndrysho iPhone 17 Pro", exact: true }).click();
  await expect(page.getByLabel(/Çmimi/)).toHaveValue("999");
});
