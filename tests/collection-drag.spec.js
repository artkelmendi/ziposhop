import { test, expect, fixtureCatalog } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 428, height: 926 });
  await page.addInitScript(() => sessionStorage.setItem("zipo:intro-seen", "1"));
});

const position = rail => rail.locator(".collection-track").evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41);

test("touching a product immediately takes over motion, including an existing flick", async ({ page }) => {
  await page.goto("/");
  const rail = page.locator(".collection-window");
  await rail.scrollIntoViewIfNeeded();
  await expect(rail).toHaveAttribute("data-motion", "auto");
  const box = await rail.boundingBox();
  const y = box.y + 100;
  await page.mouse.move(330, y);
  await page.mouse.down();
  const held = await position(rail);
  await page.waitForTimeout(180);
  expect(Math.abs(await position(rail) - held)).toBeLessThan(0.5);
  await page.mouse.move(90, y, { steps: 10 });
  await page.mouse.up();
  await expect(rail).toHaveAttribute("data-motion", "settling");
  await page.mouse.move(240, y);
  await page.mouse.down();
  const grabbed = await position(rail);
  await page.waitForTimeout(150);
  expect(Math.abs(await position(rail) - grabbed)).toBeLessThan(0.5);
  await page.mouse.move(300, y);
  await page.mouse.up();
  await expect(page).toHaveURL(/\/$/);
});

test("a held drag follows every pixel and reverses repeatedly across the loop without limits", async ({ page }) => {
  await page.goto("/");
  const rail = page.locator(".collection-window");
  await rail.scrollIntoViewIfNeeded();
  await expect(rail).toHaveAttribute("data-motion", "auto");
  const width = await rail.locator(".collection-group").first().evaluate(node => node.getBoundingClientRect().width);
  const box = await rail.boundingBox();
  await page.mouse.move(220, box.y + 110);
  await page.mouse.down();
  let previousX = 220;
  let previous = await position(rail);
  for (const nextX of [-width * 2 - 135, width * 2 + 190, -width * 3, 300, 100, 320].map(Math.round)) {
    await page.mouse.move(nextX, box.y + 110, { steps: 20 });
    const current = await position(rail);
    const error = ((current - previous - (nextX - previousX)) % width + width) % width;
    expect(Math.min(error, width - error)).toBeLessThan(1);
    previous = current;
    previousX = nextX;
    await expect(rail).toHaveAttribute("data-motion", "dragging");
  }
  await page.mouse.up();
  await expect(page).toHaveURL(/\/$/);
});

test("background price refreshes keep the order and preserve a held gesture", async ({ page }) => {
  const catalog = fixtureCatalog();
  let requests = 0;
  await page.route("**/rest/v1/products?**", route => {
    requests++;
    return route.fulfill({ json: catalog.products.map(product => ({ ...product, price: product.price + requests })) });
  });
  await page.goto("/");
  const rail = page.locator(".collection-window");
  await rail.scrollIntoViewIfNeeded();
  await expect(rail).toHaveAttribute("data-motion", "auto");
  const primary = rail.locator(".collection-group").first();
  const order = await primary.locator("h3").allTextContents();
  const box = await rail.boundingBox();
  await page.mouse.move(220, box.y + 100);
  await page.mouse.down();
  const held = await position(rail);
  await page.evaluate(() => {
    const now = Date.now;
    Date.now = () => now() + 61000;
    window.dispatchEvent(new Event("focus"));
  });
  await expect.poll(() => requests).toBe(2);
  await expect(rail).toHaveAttribute("data-motion", "held");
  expect(await primary.locator("h3").allTextContents()).toEqual(order);
  expect(Math.abs(await position(rail) - held)).toBeLessThan(0.5);
  await page.mouse.move(120, box.y + 100, { steps: 10 });
  await expect(rail).toHaveAttribute("data-motion", "dragging");
  await page.mouse.up();
});

test("keyboard focus exposes any primary product and still opens its clean URL", async ({ page }) => {
  await page.goto("/");
  const rail = page.locator(".collection-window");
  await rail.scrollIntoViewIfNeeded();
  await expect(rail).toHaveAttribute("data-motion", "auto");
  const links = rail.locator('.collection-group').first().locator('.product-card:not([aria-hidden="true"])');
  const last = links.last();
  const href = await last.getAttribute("href");
  await page.keyboard.press("Tab");
  await last.focus();
  const box = await last.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(428);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new URL(href, "http://127.0.0.1:4174").href);
});
