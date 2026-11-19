import { test, expect } from "@playwright/test";

test("category product cards enter once without restarting after page entry or scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 440, height: 956 });
  await page.addInitScript(() => {
    window.productEntrances = [];
    document.addEventListener("animationstart", (event) => {
      if (event.target.matches("#product-grid > .product-card")) {
        window.productEntrances.push({
          href: event.target.getAttribute("href"),
          name: event.animationName,
        });
      }
    });
  });
  await page.goto("/produktet.html?kategoria=telefona");
  await expect(page.locator("#product-grid > .product-card")).toHaveCount(4);
  await expect(page.locator("main")).not.toHaveClass("page-entering");
  await page.locator("#product-grid").scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 600);
  await page.mouse.wheel(0, -600);
  const cards = await page
    .locator("#product-grid > .product-card")
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("href")),
    );
  await expect
    .poll(() => page.evaluate(() => window.productEntrances.length))
    .toBe(cards.length);
  const entrances = await page.evaluate(() => window.productEntrances);
  for (const href of cards)
    expect(entrances.filter((event) => event.href === href)).toEqual([
      { href, name: "category-product-enter" },
    ]);
});
