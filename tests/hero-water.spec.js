import { test, expect } from "./fixtures";

async function observeWater(page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("zipo:intro-seen", "1");
    window.waterFrames = 0;
    window.waterSample = null;
    const draw = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function (...args) {
      const result = draw.apply(this, args);
      if (!this.canvas.closest('section[aria-label="Zbulo koleksionin ZIPO"]')) return result;
      window.waterFrames++;
      if (window.captureWater) {
        window.captureWater = false;
        const sample = (x, y) => {
          const pixels = new Uint8Array(8 * 8 * 4);
          this.readPixels(Math.floor(this.canvas.width * x), Math.floor(this.canvas.height * y), 8, 8, this.RGBA, this.UNSIGNED_BYTE, pixels);
          return { rgba: [...pixels.slice(0, 4)], alpha: pixels[3], sum: pixels.reduce((total, value, i) => total + value * (i + 1), 0) };
        };
        const pixels = new Uint8Array(this.canvas.width * this.canvas.height * 4);
        this.readPixels(0, 0, this.canvas.width, this.canvas.height, this.RGBA, this.UNSIGNED_BYTE, pixels);
        let blackPixels = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i + 3] > 0 && pixels[i] + pixels[i + 1] + pixels[i + 2] < 60) blackPixels++;
        }
        window.waterSample = { left: sample(.08, .8), right: sample(.9, .2), center: sample(.5, .5), bottom: sample(.9, 0), blackPixels };
      }
      return result;
    };
  });
}

async function sampleWater(page) {
  await page.evaluate(() => { window.waterSample = null; window.captureWater = true; });
  await expect.poll(() => page.evaluate(() => window.waterSample)).not.toBeNull();
  return page.evaluate(() => window.waterSample);
}

for (const width of [428, 440, 1440]) {
  test(`water draws only at hero edges, responds and pauses at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 956 });
    await observeWater(page);
    await page.goto("/");
    const hero = page.getByRole("region", { name: "Zbulo koleksionin ZIPO" });
    await expect(hero.locator("[data-renderer=webgl]")).toBeAttached();
    await expect(hero.locator("canvas")).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => window.waterFrames)).toBeGreaterThan(3);
    const before = await sampleWater(page);
    expect(before.left.alpha).toBe(255);
    expect(before.right.alpha).toBe(255);
    expect(before.left.rgba[0]).toBeLessThan(250);
    expect(before.center.rgba.slice(0, 3).every(value => value >= 250)).toBe(true);
    expect(before.bottom.rgba.slice(0, 3).every(value => value >= 250)).toBe(true);
    expect(before.blackPixels).toBe(0);
    const bounds = await hero.boundingBox();
    await page.mouse.move(10, bounds.y + 80);
    await page.mouse.click(10, bounds.y + 80);
    await page.waitForTimeout(250);
    const after = await sampleWater(page);
    expect(after.blackPixels).toBe(0);
    expect(after.left.sum).not.toBe(before.left.sum);
    await expect(hero.locator("[aria-busy=true]")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator("footer").scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    const stopped = await page.evaluate(() => window.waterFrames);
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => window.waterFrames)).toBe(stopped);
    await hero.scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => window.waterFrames)).toBeGreaterThan(stopped);
  });
}

test("reduced motion keeps the water static and the hero usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await observeWater(page);
  await page.goto("/");
  const hero = page.getByRole("region", { name: "Zbulo koleksionin ZIPO" });
  await expect(hero.locator("[data-renderer=webgl]")).toBeAttached();
  await page.waitForTimeout(150);
  const count = await page.evaluate(() => window.waterFrames);
  expect(count).toBeGreaterThan(0);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.waterFrames)).toBe(count);
  await hero.getByRole("link", { name: "Zbulo produktet" }).click();
  await expect(page).toHaveURL(/produktet\/$/);
  await expect(page.locator("main canvas")).toHaveCount(0);
});

test("the hero stays usable when WebGL is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("zipo:intro-seen", "1");
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === "webgl" ? null : getContext.call(this, type, ...args);
    };
  });
  await page.goto("/");
  const hero = page.getByRole("region", { name: "Zbulo koleksionin ZIPO" });
  await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(hero.locator("img")).toHaveCount(7);
  await hero.getByRole("link", { name: "Zbulo produktet" }).click();
  await expect(page).toHaveURL(/produktet\/$/);
});
