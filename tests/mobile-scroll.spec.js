import { test, expect } from "./fixtures";

async function recordReveals(page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("zipo:intro-seen", "1");
    window.scrollEntrances = [];
    const original = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      if (this.matches("[data-scroll-reveal]")) {
        window.scrollEntrances.push({
          section: this.firstElementChild?.id || this.className,
          top: this.getBoundingClientRect().top,
          viewport: innerHeight,
          frames,
          duration: options.duration,
        });
      }
      return original.call(this, frames, options);
    };
  });
}

for (const width of [390, 440]) {
  test(`mobile reveals begin before visibility and never replay at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 956 });
    await recordReveals(page);
    await page.goto("/");
    await expect(page.locator("#produkti-i-kerkuar")).toBeAttached();
    await expect(page.locator("main")).not.toHaveClass("page-entering");
    const featured = page.locator('[data-scroll-reveal]').filter({ has: page.locator("#produkti-i-kerkuar") });
    await featured.evaluate(node => window.scrollTo({
      top: node.getBoundingClientRect().top + scrollY - innerHeight - 48,
      behavior: "instant",
    }));
    await expect.poll(() => page.evaluate(() => window.scrollEntrances.filter(entry => entry.section === "produkti-i-kerkuar").length)).toBe(1);
    const before = await page.evaluate(() => window.scrollEntrances);
    for (const entry of before) {
      expect(entry.top).toBeGreaterThanOrEqual(entry.viewport);
      expect(entry.frames[0].opacity).toBeGreaterThanOrEqual(0.7);
      expect(entry.duration).toBeLessThanOrEqual(450);
      expect(entry.frames[0].clipPath).toBeUndefined();
    }
    await featured.scrollIntoViewIfNeeded();
    await expect.poll(() => featured.evaluate(node => node.getAnimations().length)).toBe(0);
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await featured.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => window.scrollEntrances.filter(entry => entry.section === "produkti-i-kerkuar").length)).toBe(1);
    await page.locator("#vizito-dyqanin").scrollIntoViewIfNeeded();
    await expect(page.locator("#vizito-dyqanin .media-frame")).toHaveAttribute("aria-busy", "false");
    await expect(page.locator("#vizito-dyqanin .media-frame img")).toHaveCSS("opacity", "1");
    await page.screenshot({ path: `.impeccable/review/mobile-scroll-${width}.png`, animations: "disabled" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("a fast swipe leaves already visible content opaque without a late reveal", async ({ page }) => {
  await page.setViewportSize({ width: 440, height: 956 });
  await recordReveals(page);
  await page.goto("/");
  await expect(page.locator("#produkti-i-kerkuar")).toBeAttached();
  await expect(page.locator("main")).not.toHaveClass("page-entering");
  const featured = page.locator('[data-scroll-reveal]').filter({ has: page.locator("#produkti-i-kerkuar") });
  await featured.evaluate(node => window.scrollTo({ top: node.getBoundingClientRect().top + scrollY - 110, behavior: "instant" }));
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await expect(featured).toHaveCSS("opacity", "1");
  expect(await featured.evaluate(node => node.getAnimations().length)).toBe(0);
  expect(await page.evaluate(() => window.scrollEntrances.filter(entry => entry.section === "produkti-i-kerkuar").length)).toBe(0);
  await expect(page.locator("#produkti-i-kerkuar h3")).toBeVisible();
});
