import { test, expect } from "./fixtures";
for (const width of [440, 1440]) {
  test("home scroll reveals run once at " + width + "px", async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(() => {
      window.revealStarts = [];
      const original = Element.prototype.animate;
      Element.prototype.animate = function (...args) {
        if (this.matches("[data-scroll-reveal]"))
          window.revealStarts.push(this);
        return original.apply(this, args);
      };
    });
    await page.goto("/");
    await expect(page.locator("#gjej-pajisjen")).toHaveCount(0);
    const featured = page
      .locator("[data-scroll-reveal]")
      .filter({ has: page.locator("#produkti-i-kerkuar") });
    // Cross the pre-entry boundary before scrolling the section into view.
    await featured.evaluate(element => scrollTo({
      top: element.getBoundingClientRect().top + scrollY - innerHeight - 48,
      behavior: "instant",
    }));
    await expect
      .poll(() =>
        featured.evaluate(
          (element) =>
            window.revealStarts.filter((node) => node === element).length,
        ),
      )
      .toBe(1);
    await featured.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        featured.evaluate(
          (element) =>
            element
              .getAnimations()
              .filter((animation) => animation.playState === "running").length,
        ),
      )
      .toBe(0);
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await featured.scrollIntoViewIfNeeded();
    expect(
      await featured.evaluate(
        (element) =>
          window.revealStarts.filter((node) => node === element).length,
      ),
    ).toBe(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.locator("#vizito-dyqanin").scrollIntoViewIfNeeded();
    await expect(page.locator("#vizito-dyqanin .media-frame")).toHaveAttribute(
      "aria-busy",
      "false",
    );
    await expect
      .poll(() =>
        page
          .locator("#vizito-dyqanin [data-scroll-reveal]")
          .evaluateAll((elements) =>
            elements.reduce(
              (count, element) =>
                count +
                element
                  .getAnimations()
                  .filter((animation) => animation.playState === "running")
                  .length,
              0,
            ),
          ),
      )
      .toBe(0);
    await page
      .locator("#vizito-dyqanin")
      .screenshot({ path: "test-results/visit-" + width + ".png" });
    await page
      .getByRole("link", { name: "Si të na gjesh", exact: true })
      .click();
    await expect(page).toHaveURL(/kontakti\/$/);
  });
}
test("reduced motion leaves home sections visible without scroll animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const featured = page
    .locator("[data-scroll-reveal]")
    .filter({ has: page.locator("#produkti-i-kerkuar") });
  await featured.scrollIntoViewIfNeeded();
  expect(
    await featured.evaluate((element) => element.getAnimations().length),
  ).toBe(0);
  await expect(
    page.getByRole("heading", { name: "Produkti më i kërkuar" }),
  ).toBeVisible();
});
