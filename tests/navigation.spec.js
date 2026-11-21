import { test, expect } from "./fixtures";

test("the mobile menu has identical rows on every route", async ({ page }) => {
  await page.setViewportSize({ width: 440, height: 956 });
  for (const route of [
    "/",
    "/produktet.html",
    "/produktet.html?kategoria=telefona",
    "/produktet.html?produkt=iphone-15-pro",
    "/kontakti.html",
    "/pyetje.html",
  ]) {
    await page.goto(route);
    await page.getByRole("button", { name: "Hap menunë" }).click();
    const menu = page.getByRole("navigation", { name: "Navigimi në telefon" });
    await expect(menu.getByRole("link")).toHaveText([
      "Ballina",
      "Produktet",
      "Pyetje të shpeshta",
      "Kontakti",
    ]);
    const rows = await menu.getByRole("link").evaluateAll((links) =>
      links.map((link) => {
        const box = link.getBoundingClientRect();
        return {
          left: box.left,
          height: box.height,
          display: getComputedStyle(link).display,
        };
      }),
    );
    expect(
      rows.every(
        (row) =>
          row.left === rows[0].left &&
          row.height === 48 &&
          row.display === "flex",
      ),
    ).toBe(true);
    await expect(menu.locator("[aria-current=page]")).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  }
});

test("the header persists and the dropdown resets on route and breakpoint changes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 440, height: 956 });
  await page.goto("/produktet.html");
  await page
    .locator("header")
    .evaluate((header) => (header.dataset.testInstance = "original"));
  await page.getByRole("button", { name: "Hap menunë" }).click();
  const menu = page.getByRole("navigation", { name: "Navigimi në telefon" });
  await menu.getByRole("link", { name: "Kontakti", exact: true }).click();
  await expect(page).toHaveURL(/kontakti\.html$/);
  await expect(page.locator("header")).toHaveAttribute(
    "data-test-instance",
    "original",
  );
  await expect(menu).toBeHidden();
  await page.getByRole("button", { name: "Hap menunë" }).click();
  await page.setViewportSize({ width: 751, height: 956 });
  await expect(menu).toBeHidden();
  await page.setViewportSize({ width: 440, height: 956 });
  await expect(menu).toBeHidden();
  await page.getByRole("button", { name: "Hap menunë" }).click();
  await page.locator("main").click({ position: { x: 5, y: 450 } });
  await expect(menu).toBeHidden();
});

test("slow product media uses a skeleton and recovers when a variant loads", async ({
  page,
}) => {
  await page.route("**/assets/phone-15-pro-blue.webp", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    await route.continue();
  });
  await page.goto("/produktet.html?produkt=iphone-15-pro");
  await page.getByRole("button", { name: "Titan blu" }).click();
  const photo = page.locator(".detail-photo");
  await expect(photo).toHaveAttribute("aria-busy", "true");
  await expect(photo.locator(".skeleton")).toBeVisible();
  await expect(photo).toHaveAttribute("aria-busy", "false");
  await expect(photo.locator("img")).toHaveAttribute(
    "src",
    /phone-15-pro-blue\.webp$/,
  );
});
