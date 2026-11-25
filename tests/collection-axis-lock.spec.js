import { test, expect } from "./fixtures";
import { collectionPosition } from "./collection-motion";

test.use({ viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true });

for (const reduced of [false, true]) {
  test(`touch gestures stay horizontal inside the product strip${reduced ? " with reduced motion" : ""}`, async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "Native touch input uses Chromium's input protocol; the cross-engine drag test covers WebKit.");
    await page.addInitScript(() => sessionStorage.setItem("zipo:intro-seen", "1"));
    if (reduced) await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const rail = page.locator(".collection-window");
    await rail.scrollIntoViewIfNeeded();
    if (!reduced) await expect(rail).toHaveAttribute("data-motion", "auto");
    const input = await context.newCDPSession(page);
    const box = await rail.boundingBox();
    const startY = box.y + 150;
    const beforeY = await page.evaluate(() => scrollY);
    const beforeX = reduced ? await rail.evaluate(node => node.scrollLeft) : await collectionPosition(rail.locator(".collection-track"));
    const point = (x, y) => ({ x, y, id: 1, radiusX: 3, radiusY: 3, force: 1 });
    await input.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point(320, startY)] });
    // Lead with vertical movement, then swipe horizontally with continued drift.
    for (let i = 1; i <= 6; i++) {
      await input.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [point(320 - i, startY - i * 5)] });
      await page.waitForTimeout(16);
    }
    for (let i = 1; i <= 10; i++) {
      await input.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [point(314 - i * 20, startY - 30 - i * 4)] });
      await page.waitForTimeout(16);
    }
    expect(Math.abs(await page.evaluate(() => scrollY) - beforeY)).toBeLessThan(1);
    if (!reduced) {
      await expect(rail).toHaveAttribute("data-motion", "dragging");
      expect(Math.abs(await collectionPosition(rail.locator(".collection-track")) - beforeX)).toBeGreaterThan(100);
    } else {
      expect(await rail.evaluate(node => node.scrollLeft)).toBeGreaterThan(beforeX + 100);
    }
    await input.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(page).toHaveURL(/\/$/);
    // A fresh gesture outside the strip must still scroll the page normally.
    const heading = page.locator("#selection-title");
    await heading.scrollIntoViewIfNeeded();
    const headingBox = await heading.boundingBox();
    const outsideStart = await page.evaluate(() => scrollY);
    await input.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point(200, headingBox.y + 10)] });
    for (let i = 1; i <= 10; i++) {
      await input.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [point(200, headingBox.y + 10 - i * 8)] });
      await page.waitForTimeout(16);
    }
    await input.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(outsideStart + 20);
  });
}
