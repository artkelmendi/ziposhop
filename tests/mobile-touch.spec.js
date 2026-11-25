import { test, expect } from "./fixtures";
import { collectionPosition, collectionSpeed } from "./collection-motion";

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
  expect(await collectionSpeed(rail.locator(".collection-track"))).toBeGreaterThan(70);
  await expect(page).toHaveURL(/\/$/);
  await expect(rail).toHaveAttribute("data-motion", "auto");
  box = await rail.boundingBox();
  await swipe([80, box.y + 120], [350, box.y + 120]);
  expect(await collectionSpeed(rail.locator(".collection-track"))).toBeLessThan(-30);
  await expect(rail).toHaveAttribute("data-motion", "auto");
  const track = rail.locator(".collection-track");
  // Start on photos, labels, prices and the space between cards, then reverse
  // without lifting. Each new touch must also interrupt the previous momentum.
  for (const surface of ["photo", "label", "price", "gap"]) {
    const point = await rail.evaluate((node, surface) => {
      const cards = [...node.querySelectorAll(".product-card")];
      if (surface === "gap") {
        for (let i = 0; i < cards.length - 1; i++) {
          const a = cards[i].getBoundingClientRect();
          const b = cards[i + 1].getBoundingClientRect();
          if (a.right > 100 && b.left < innerWidth - 70) return { x: (a.right + b.left) / 2, y: a.top + 70 };
        }
      }
      const selector = { photo: ".product-visual", label: ".product-label", price: ".product-price" }[surface];
      for (const card of cards) {
        const box = card.querySelector(selector)?.getBoundingClientRect();
        if (box && box.x + box.width / 2 > 100 && box.x + box.width / 2 < innerWidth - 70) return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      }
    }, surface);
    expect(point).toBeTruthy();
    const touch = x => ({ x, y: point.y, id: 1, radiusX: 3, radiusY: 3, force: 1 });
    await input.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [touch(point.x)] });
    await expect(rail).toHaveAttribute("data-motion", "held");
    const held = await collectionPosition(track);
    await page.waitForTimeout(80);
    expect(Math.abs(await collectionPosition(track) - held)).toBeLessThan(0.5);
    const period = await rail.locator(".collection-group").first().evaluate(node => node.getBoundingClientRect().width);
    for (const offset of [-45, -75, -30, 35, -15]) {
      await input.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [touch(point.x + offset)] });
      await expect(rail).toHaveAttribute("data-motion", "dragging");
      await expect.poll(async () => {
        const error = ((await collectionPosition(track) - held - offset) % period + period) % period;
        return Math.min(error, period - error);
      }, { intervals: [16, 16, 32], timeout: 500 }).toBeLessThan(1);
    }
    await input.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(page).toHaveURL(/\/$/);
  }
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
