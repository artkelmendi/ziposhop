import { devices } from "@playwright/test";
import { test, expect } from "./fixtures";

const { defaultBrowserType, ...phone } = devices["iPhone 13 Pro Max"];
test.use(phone);

test("iPhone 13 Pro Max hero stays light through scrolling and rotation", async ({ page, browserName }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const draw = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function (...args) {
      const result = draw.apply(this, args);
      if (window.captureHero && this.canvas.closest('section[aria-label="Zbulo koleksionin ZIPO"]')) {
        window.captureHero = false;
        const pixels = new Uint8Array(this.canvas.width * this.canvas.height * 4);
        this.readPixels(0, 0, this.canvas.width, this.canvas.height, this.RGBA, this.UNSIGNED_BYTE, pixels);
        let black = 0;
        let darkBottom = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i] + pixels[i + 1] + pixels[i + 2] < 60) black++;
          if (i < this.canvas.width * 4 && Math.min(pixels[i], pixels[i + 1], pixels[i + 2]) < 250) darkBottom++;
        }
        window.heroRaster = { black, darkBottom, width: this.canvas.width, height: this.canvas.height };
      }
      return result;
    };
  });
  await page.goto("/");
  await expect(page.locator("[data-brand-intro]")).toHaveCount(0);
  const hero = page.getByRole("region", { name: "Zbulo koleksionin ZIPO" });
  await expect(hero.locator("[data-renderer=webgl]")).toBeAttached();
  await expect(hero.locator("[aria-busy=true]")).toHaveCount(0);

  async function checkFrame() {
    await page.evaluate(() => { window.heroRaster = null; window.captureHero = true; });
    await expect.poll(() => page.evaluate(() => window.heroRaster)).not.toBeNull();
    const frame = await page.evaluate(() => window.heroRaster);
    expect(frame.black).toBe(0);
    expect(frame.darkBottom).toBe(0);
    await expect(page.getByRole("banner")).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(page.getByRole("banner")).toHaveCSS("backdrop-filter", "none");
    expect(frame.width).toBeGreaterThan(400);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    return frame;
  }

  const portrait = await checkFrame();
  await page.screenshot({ path: `.impeccable/review/iphone13-${browserName}-portrait.png` });
  await page.evaluate(() => scrollTo({ top: 240, behavior: "instant" }));
  await checkFrame();
  await page.screenshot({ path: `.impeccable/review/iphone13-${browserName}-scroll.png` });
  await page.setViewportSize({ width: 926, height: 428 });
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect.poll(() => hero.locator("canvas").evaluate(el => el.width)).toBeGreaterThan(portrait.width);
  await checkFrame();
  await page.screenshot({ path: `.impeccable/review/iphone13-${browserName}-landscape.png` });
  await page.setViewportSize(phone.viewport);
  await expect.poll(() => hero.locator("canvas").evaluate(el => el.width)).toBe(portrait.width);
  await checkFrame();
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Kthehu lart", exact: true }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator("main")).toHaveCSS("outline-style", "none");
  await checkFrame();
  await expect(page.locator('#sherbimet img[src*="phone-18-pro-max"]')).toHaveCount(1);
  expect(errors).toEqual([]);
});
