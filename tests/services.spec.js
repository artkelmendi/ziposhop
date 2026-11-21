import { test, expect } from "./fixtures";

async function enterHome(page, width, height, reducedMotion = "no-preference") {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion });
  await page.addInitScript(() => sessionStorage.setItem("zipo:intro-seen", "1"));
  await page.goto("/");
  await expect(page.locator("#produkti-i-kerkuar")).toBeAttached();
  await expect(page.locator("main")).not.toHaveClass("page-entering");
  return page.locator("#sherbimet");
}

async function jumpToService(section, id, fraction = 0) {
  await section.locator(`#zipo-${id}`).evaluate((marker, fraction) => {
    const section = document.querySelector("#sherbimet");
    const pin = parseFloat(getComputedStyle(section).getPropertyValue("--panel-top"));
    const height = marker.nextElementSibling.offsetHeight;
    scrollTo({ top: marker.getBoundingClientRect().top + scrollY - pin - height * fraction, behavior: "instant" });
  }, fraction);
}

for (const [width, height] of [[390, 844], [440, 956], [768, 1000], [1440, 1000]]) {
  test(`layered services, direct navigation and reverse scrolling at ${width}px`, async ({ page, browserName }) => {
    const captures = `.impeccable/review/services/${browserName}`;
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const section = await enterHome(page, width, height);
    const nav = section.getByRole("navigation", { name: "Shërbimet ZIPO" });
    await expect(section).toHaveAttribute("data-stacked", "true");
    expect(await section.evaluate(node => document.querySelector("#produkti-i-kerkuar").compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING)).toBeTruthy();
    await expect(section.locator("article")).toHaveCount(3);
    for (const [id, label] of [["produkte", "Produkte"], ["servis", "Servis"], ["dergesa", "Dërgesa"]]) {
      await jumpToService(section, id);
      await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "step");
      const panel = section.locator(`article[aria-labelledby="service-${id}-title"]`);
      await expect(panel.locator("[data-media-state]").first()).toHaveAttribute("data-media-state", "ready");
      await expect(panel.locator('[data-media-state="loading"]')).toHaveCount(0);
      await expect(panel.locator('[data-media-state="error"]')).toHaveCount(0);
      await expect.poll(() => nav.locator("span").evaluate(node => node.getAnimations().length)).toBe(0);
      const bounds = await panel.evaluate(node => {
        const box = node.getBoundingClientRect();
        const action = node.querySelector("a").getBoundingClientRect();
        return {
          visible: box.top >= 64 && box.bottom <= innerHeight,
          actionVisible: action.top >= box.top && action.bottom <= box.bottom,
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      expect(bounds).toEqual({ visible: true, actionVisible: true, horizontalOverflow: false });
      await page.screenshot({ path: `${captures}/${id}-${width}.png` });
    }
    // Covered links must be brought back into view when reached by keyboard.
    await page.keyboard.press("Tab");
    await section.getByRole("link", { name: "Pyet për servisin", exact: true }).focus();
    await expect(nav.getByRole("link", { name: "Servis", exact: true })).toHaveAttribute("aria-current", "step");
    await nav.getByRole("link", { name: "Produkte", exact: true }).click();
    await expect(nav.getByRole("link", { name: "Produkte", exact: true })).toHaveAttribute("aria-current", "step");
    await jumpToService(section, "servis", 0.5);
    await expect.poll(() => section.locator("article").first().evaluate(node => Number(node.style.getPropertyValue("--covered")))).toBeGreaterThan(0.3);
    await page.screenshot({ path: `${captures}/transition-${width}.png` });
    await jumpToService(section, "produkte");
    await expect.poll(() => section.locator("article").first().evaluate(node => Number(node.style.getPropertyValue("--covered")))).toBe(0);
    expect(errors).toEqual([]);
    if (width === 440 || width === 1440) {
      await page.locator("#instagram").scrollIntoViewIfNeeded();
      await expect(page.locator('[data-media-state="loading"]')).toHaveCount(0);
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({ path: `${captures}/home-${width}.png`, fullPage: true });
      await jumpToService(section, "produkte");
    }
    if (width === 1440) {
      await section.getByRole("link", { name: "Shfleto produktet", exact: true }).click();
      await expect(page).toHaveURL(/produktet\.html$/);
      await expect(page.locator("h1")).toHaveText("Katalogu i produkteve");
    }
  });
}

test("services stay readable with reduced motion, short screens and resizing", async ({ page }) => {
  const section = await enterHome(page, 440, 956, "reduce");
  const nav = section.getByRole("navigation", { name: "Shërbimet ZIPO" });
  await expect(section).toHaveAttribute("data-stacked", "false");
  await nav.getByRole("link", { name: "Dërgesa", exact: true }).click();
  await expect(nav.getByRole("link", { name: "Dërgesa", exact: true })).toHaveAttribute("aria-current", "step");
  expect(await section.locator("article").evaluateAll(nodes => nodes.every(node => getComputedStyle(node).position === "relative" && getComputedStyle(node).transform === "none"))).toBe(true);
  for (const link of await section.locator('article a[target="_blank"]').all()) {
    await expect(link).toHaveAttribute("href", /^https:\/\/wa\.me\/38344856416\?text=/);
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(section).toHaveAttribute("data-stacked", "true");
  await page.setViewportSize({ width: 320, height: 667 });
  await expect(section).toHaveAttribute("data-stacked", "false");
  await jumpToService(section, "servis");
  await expect(section.getByRole("heading", { name: /Ekran i ri\.\s*Energji e re\./ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(section).toHaveAttribute("data-stacked", "true");
  await jumpToService(section, "dergesa");
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await jumpToService(section, "servis");
  await expect(nav.getByRole("link", { name: "Servis", exact: true })).toHaveAttribute("aria-current", "step");
});
