import { test, expect } from "./fixtures";

for (const width of [440, 1440]) {
  test(
    "footer follows content and fills short pages at " + width + "px",
    async ({ page }) => {
      await page.setViewportSize({ width, height: 1200 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      for (const route of [
        "/produktet.html?produkt=unknown",
        "/produktet.html?kategoria=motore",
        "/",
      ]) {
        await page.goto(route);
        const footer = page.locator("footer");
        await expect(
          footer.getByRole("heading", { name: "Na gjen në Pejë" }),
        ).toBeVisible();
        await expect(page.locator("main > .route-skeleton")).toHaveCount(0);
        const layout = await page.evaluate(() => {
          const footer = document
            .querySelector("footer")
            .getBoundingClientRect();
          const main = document.querySelector("main").getBoundingClientRect();
          return {
            bottom: footer.bottom + scrollY,
            top: footer.top,
            mainBottom: main.bottom,
            documentHeight: document.documentElement.scrollHeight,
            viewport: innerHeight,
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        });
        expect(
          Math.abs(layout.bottom - layout.documentHeight),
        ).toBeLessThanOrEqual(1);
        expect(layout.top).toBeGreaterThanOrEqual(layout.mainBottom - 1);
        expect(layout.overflow).toBe(false);
        if (route.includes("unknown"))
          expect(layout.documentHeight).toBe(layout.viewport);
      }
      const footer = page.locator("footer");
      await expect(
        footer
          .getByRole("navigation", { name: "Eksploro dyqanin" })
          .getByRole("link"),
      ).toHaveCount(6);
      await expect(
        footer.getByRole("link", { name: "Na shkruaj në WhatsApp" }),
      ).toHaveAttribute("href", "https://wa.me/38344856416");
      await footer.screenshot({
        path: "test-results/footer-" + width + ".png",
      });
    },
  );
}
