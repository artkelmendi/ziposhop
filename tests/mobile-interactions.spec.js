import { test, expect } from "./fixtures";
import { collectionPosition, collectionSpeed } from "./collection-motion";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 428, height: 926 });
  await page.addInitScript(() => sessionStorage.setItem("zipo:intro-seen", "1"));
});

test("the mobile menu animates both ways and reverses cleanly", async ({ page, browserName }) => {
  await page.goto("/produktet/");
  const toggle = page.getByRole("button", { name: "Hap menunë" });
  const menu = page.locator("#mobile-nav");
  await toggle.click();
  await expect(menu).toHaveAttribute("aria-hidden", "false");
  expect(await menu.evaluate(node => node.getAnimations().length)).toBeGreaterThan(0);
  await expect(menu).toHaveCSS("opacity", "1");
  await expect(menu).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  await page.screenshot({ path: `.impeccable/review/mobile-interactions/${browserName}-menu.png` });
  await page.getByRole("button", { name: "Mbyll menunë" }).click();
  await expect(menu).toHaveAttribute("inert", "");
  expect(await menu.evaluate(node => node.getAnimations().length)).toBeGreaterThan(0);
  await expect(menu).toHaveCSS("visibility", "hidden");
  await toggle.click();
  await page.waitForTimeout(75);
  await page.getByRole("button", { name: "Mbyll menunë" }).click();
  await page.waitForTimeout(40);
  await toggle.click();
  await expect(menu).toHaveAttribute("aria-hidden", "false");
  await expect(menu).toHaveCSS("opacity", "1");
  await menu.getByRole("link", { name: "Kontakti", exact: true }).click();
  await expect(page).toHaveURL(/\/kontakti\/$/);
  await expect(menu).toHaveCSS("visibility", "hidden");
  await page.getByRole("button", { name: "Hap menunë" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Hap menunë" })).toBeFocused();
  await expect(menu).toHaveCSS("visibility", "hidden");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Hap menunë" }).click();
  expect(await menu.evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
});

async function collection(page) {
  await page.goto("/");
  const rail = page.locator(".collection-window");
  await rail.scrollIntoViewIfNeeded();
  await expect(rail).toHaveAttribute("data-motion", "auto");
  return rail;
}

async function flick(page, rail, direction) {
  const box = await rail.boundingBox();
  const from = direction === "left" ? box.width * 0.8 : box.width * 0.2;
  const to = direction === "left" ? box.width * 0.2 : box.width * 0.8;
  const y = box.y + 100;
  await page.mouse.move(from, y);
  await page.mouse.down();
  for (let step = 1; step <= 8; step++) {
    await page.mouse.move(from + (to - from) * step / 8, y);
    await page.waitForTimeout(12);
  }
  await expect(rail).toHaveAttribute("data-motion", "dragging");
  await page.mouse.up();
  await expect(rail).toHaveAttribute("data-motion", "settling");
}

for (const direction of ["left", "right"]) {
  test(`a ${direction} flick follows release velocity and returns to the continuous default speed`, async ({ page, browserName }) => {
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const rail = await collection(page);
    const track = rail.locator(".collection-track");
    await flick(page, rail, direction);
    const speed = await collectionSpeed(track);
    expect(direction === "left" ? speed : -speed).toBeGreaterThan(70);
    await expect(page).toHaveURL(/\/$/);
    await expect(rail).toHaveAttribute("data-motion", "auto");
    expect(Math.abs(await collectionSpeed(track) - 34)).toBeLessThan(12);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.impeccable/review/mobile-interactions/${browserName}-${direction}.png` });
    expect(errors).toEqual([]);
  });
}

test("a new swipe interrupts momentum and vertical drift stays inside the strip", async ({ page }) => {
  const rail = await collection(page);
  await expect(rail).toHaveCSS("touch-action", "pinch-zoom");
  await flick(page, rail, "left");
  await flick(page, rail, "right");
  expect(await collectionSpeed(rail.locator(".collection-track"))).toBeLessThan(-30);
  await expect(rail).toHaveAttribute("data-motion", "auto");
  const box = await rail.boundingBox();
  await page.mouse.move(box.width / 2, box.y + 120);
  await page.mouse.down();
  await page.mouse.move(box.width / 2 + 2, box.y + 180, { steps: 5 });
  await expect(rail).toHaveAttribute("data-motion", "dragging");
  await page.mouse.up();
  await expect(rail).toHaveAttribute("data-motion", "auto");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("#perzgjedhja")).toHaveClass(/has-reduced-motion/);
  await expect(rail).toHaveCSS("overflow-x", "auto");
  await expect(rail).toHaveCSS("touch-action", "pinch-zoom");
  expect(await rail.locator(".collection-track").evaluate(node => node.getAnimations().length)).toBe(0);
  await rail.evaluate(node => node.scrollLeft = 250);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(rail).toHaveAttribute("data-motion", "auto");
  expect(await rail.evaluate(node => node.scrollLeft)).toBe(0);
});

test("the continuous loop suspends offscreen and resumes at the same normal speed", async ({ page }) => {
  const rail = await collection(page);
  await flick(page, rail, "left");
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(rail).toHaveAttribute("data-motion", "inactive");
  const track = rail.locator(".collection-track");
  const before = await collectionPosition(track);
  await page.waitForTimeout(150);
  expect(await collectionPosition(track)).toBe(before);
  await rail.scrollIntoViewIfNeeded();
  await expect(rail).toHaveAttribute("data-motion", "auto");
  expect(Math.abs(await collectionSpeed(track) - 34)).toBeLessThan(12);
});
