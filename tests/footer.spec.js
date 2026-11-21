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
        await expect(footer).not.toContainText(/Le të flasim|për pajisjen tënde/i);
        await expect(
          footer.getByRole("heading", { name: "Na gjen në Pejë" }),
        ).toBeVisible();
        await expect(page.locator(".products-loading")).toHaveCount(0);
        await expect(footer.getByRole("link", { name: "Administrimi", exact: true })).toHaveCount(0);
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

for (const width of [320, 768, 1440]) {
  test(`footer contact links, keyboard return and navigation work at ${width}px`, async ({ page, browserName }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/kontakti.html");
    const footer = page.locator("footer");
    await footer.scrollIntoViewIfNeeded();
    await expect(footer.getByRole("link", { name: "Na shkruaj në WhatsApp" })).toHaveAttribute("href", "https://wa.me/38344856416");
    await expect(footer.getByRole("link", { name: "+383 44 856 416", exact: true })).toHaveAttribute("href", "tel:+38344856416");
    await expect(footer.getByRole("link", { name: /Instagram/ })).toHaveAttribute("href", "https://www.instagram.com/mobilshopzipo/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await footer.screenshot({ path: `.impeccable/review/footer/${browserName}-${width}.png` });
    const back = footer.getByRole("button", { name: "Kthehu lart" });
    await back.focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(page.locator("main")).toBeFocused();
    await footer.getByRole("navigation", { name: "Informacion" }).getByRole("link", { name: "Pyetje të shpeshta" }).click();
    await expect(page).toHaveURL(/pyetje\.html$/);
    await expect(page.locator("h1")).toHaveText("Pyetje të shpeshta");
  });
}
