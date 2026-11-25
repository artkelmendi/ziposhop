import { test, expect } from "./fixtures";

test.use({ viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true });

test("real phone swipes transfer velocity, preserve vertical scrolling and keep taps working", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "Real touch-path verification uses Chromium's input protocol; pointer behavior is covered in both engines.");
  await page.addInitScript(() => sessionStorage.setItem("zipo:intro-seen", "1"));
  await page.goto("/");
  const rail = page.locator(".collection-window");
  await rail.scrollIntoViewIfNeeded();
  await expect(rail).toHaveAttribute("data-motion", "auto");
  const input = await context.newCDPSession(page);
  async function swipe(from, to) {
    const touch = (x, y) => ({ x, y, id: 1, radiusX: 3, radiusY: 3, force: 1 });
    await input.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [touch(...from)] });
    for (let step = 1; step <= 10; step++) {
      const x = from[0] + (to[0] - from[0]) * step / 10;
      const y = from[1] + (to[1] - from[1]) * step / 10;
      await input.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [touch(x, y)] });
      await page.waitForTimeout(12);
    }
    await input.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  }
  let box = await rail.boundingBox();
  await swipe([350, box.y + 120], [80, box.y + 120]);
  await expect(rail).toHaveAttribute("data-motion", "settling");
  await expect.poll(() => rail.locator(".collection-track").evaluate(node => node.getAnimations()[0].playbackRate)).toBeGreaterThan(2);
  await expect(page).toHaveURL(/\/$/);
  await expect(rail).toHaveAttribute("data-motion", "auto");
  box = await rail.boundingBox();
  await swipe([80, box.y + 120], [350, box.y + 120]);
  await expect.poll(() => rail.locator(".collection-track").evaluate(node => node.getAnimations()[0].playbackRate)).toBeLessThan(0);
  await expect(rail).toHaveAttribute("data-motion", "auto");
  const before = await page.evaluate(() => scrollY);
  box = await rail.boundingBox();
  await swipe([220, box.y + 180], [224, Math.max(130, box.y + 30)]);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 40);
  await expect(rail).not.toHaveAttribute("data-motion", "dragging");
  await rail.scrollIntoViewIfNeeded();
  await expect(rail).toHaveAttribute("data-motion", "auto");
  const target = await rail.evaluate(node => [...node.querySelectorAll(".product-card")].map(link => {
    const box = link.getBoundingClientRect();
    return { x: box.x + box.width / 2, y: box.y + 80, href: link.getAttribute("href") };
  }).find(link => link.x > 40 && link.x < innerWidth - 40 && link.y > 130 && link.y < innerHeight - 30));
  expect(target).toBeTruthy();
  await page.touchscreen.tap(target.x, target.y);
  await expect(page).toHaveURL(new RegExp(target.href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"));
});
