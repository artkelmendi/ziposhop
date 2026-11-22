import { test, expect } from "./fixtures";

test.use({ privacyChoice: false });

const notice = page => page.getByRole("region", { name: "Cookies dhe privatësia" });
const choice = page => page.evaluate(() => JSON.parse(localStorage.getItem("zipo:privacy-choice")));

test("optional storage stays off until consent and refusal persists", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-brand-intro]")).toHaveCount(0);
  await expect(notice(page)).toBeVisible();
  expect(await choice(page)).toBeNull();
  expect(await page.evaluate(() => sessionStorage.getItem("zipo:intro-seen"))).toBeNull();
  await notice(page).getByRole("button", { name: "Vetëm të nevojshmet" }).click();
  await expect(notice(page)).toHaveCount(0);
  expect((await choice(page)).preferences).toBe(false);
  expect(await page.evaluate(() => sessionStorage.getItem("zipo:intro-seen"))).toBeNull();
  await page.reload();
  await expect(notice(page)).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("zipo:intro-seen"))).toBeNull();
});

test("consent can be withdrawn from the footer with focus returned", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/produktet/");
  await notice(page).getByRole("button", { name: "Prano preferencat" }).click();
  await expect(notice(page)).toHaveCount(0);
  expect((await choice(page)).preferences).toBe(true);
  expect(await page.evaluate(() => sessionStorage.getItem("zipo:intro-seen"))).toBe("1");
  await page.reload();
  await expect(notice(page)).toHaveCount(0);
  const settings = page.locator("footer").getByRole("button", { name: "Cilësimet e cookies" });
  await settings.click();
  await expect(notice(page).locator("h2")).toBeFocused();
  await notice(page).getByRole("button", { name: "Vetëm të nevojshmet" }).click();
  await expect(notice(page)).toHaveCount(0);
  await expect(settings).toBeFocused();
  expect((await choice(page)).preferences).toBe(false);
  expect(await page.evaluate(() => sessionStorage.getItem("zipo:intro-seen"))).toBeNull();
});

for (const width of [320, 1440]) {
  test(`the notice and policy stay usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 926 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/produktet/?kategoria=telefona");
    const box = await notice(page).boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `.impeccable/review/privacy-notice-${width}.png` });
    await notice(page).getByRole("link", { name: "Si përdoren të dhënat" }).click();
    await expect(page).toHaveURL(/\/privatesia\/$/);
    await expect(page.locator("h1")).toHaveText("Privatësia dhe cookies");
    await notice(page).getByRole("button", { name: "Vetëm të nevojshmet" }).click();
    await expect(page.getByRole("status")).toContainText("Janë të lejuara vetëm");
    await expect(notice(page)).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.impeccable/review/privacy-policy-${width}.png`, fullPage: true });
  });
}

test("expired choices are requested again and optional storage remains disabled", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("zipo:privacy-choice", JSON.stringify({ version: 1, preferences: true, savedAt: 1, expiresAt: 1 + 180 * 86400000 }));
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/privatesia/");
  await expect(notice(page)).toBeVisible();
  await expect(page.getByRole("status")).toContainText("opsionale janë të çaktivizuara");
});

test("blocked browser storage never prevents browsing or privacy choices", async ({ page }) => {
  await page.addInitScript(() => {
    for (const name of ["localStorage", "sessionStorage"]) Object.defineProperty(window, name, { get() { throw new DOMException("Storage disabled", "SecurityError"); } });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/privatesia/");
  await notice(page).getByRole("button", { name: "Vetëm të nevojshmet" }).click();
  await expect(notice(page)).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("Janë të lejuara vetëm");
  await page.getByRole("button", { name: "Ndrysho cilësimet e cookies" }).click();
  await expect(notice(page)).toBeVisible();
});
