import { test, expect } from "./fixtures";
import { adminBackend, login } from "./admin-backend";

test("unsaved product, category and homepage changes survive cancelled navigation", async ({
  page,
}) => {
  await adminBackend(page);
  await login(page);
  const nav = page.getByRole("navigation", { name: "Administrimi" });
  await page.getByRole("button", { name: "Shto produkt", exact: true }).click();
  await page.getByLabel("Emri i produktit").fill("Ende pa ruajtur");
  page.once("dialog", (dialog) => dialog.dismiss());
  await nav.getByRole("button", { name: "Kategoritë" }).click();
  await expect(page.getByLabel("Emri i produktit")).toHaveValue(
    "Ende pa ruajtur",
  );
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Dil", exact: true }).click();
  await expect(page.getByLabel("Emri i produktit")).toHaveValue(
    "Ende pa ruajtur",
  );
  page.once("dialog", (dialog) => dialog.accept());
  await nav.getByRole("button", { name: "Kategoritë" }).click();
  await page.getByRole("button", { name: "Shto kategori" }).click();
  await page.getByLabel("Emri i kategorisë").fill("Kategori e paruajtur");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Anulo", exact: true }).click();
  await expect(page.getByLabel("Emri i kategorisë")).toHaveValue(
    "Kategori e paruajtur",
  );
  page.once("dialog", (dialog) => dialog.accept());
  await nav.getByRole("button", { name: "Ballina" }).click();
  await page
    .getByRole("combobox", { name: "Produkti", exact: true })
    .selectOption("iphone-air");
  page.once("dialog", (dialog) => dialog.dismiss());
  await nav.getByRole("button", { name: "Produktet" }).click();
  await expect(
    page.getByRole("combobox", { name: "Produkti", exact: true }),
  ).toHaveValue("iphone-air");
});

test("email/password login handles errors, delayed authorization and logout", async ({
  page,
}) => {
  await adminBackend(page, { slow: true });
  await page.goto("/admin.html");
  await expect(page.locator("[data-brand-intro]")).toHaveCount(0);
  await page.getByLabel("Email", { exact: true }).fill("ziposhop@gmail.com");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Incorrect email or password");
  await page
    .getByLabel("Password", { exact: true })
    .fill("test-password-only");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page.getByLabel("Duke ngarkuar administrimin")).toHaveAttribute(
    "aria-busy",
    "true",
  );
  await expect(
    page.getByRole("heading", { name: "Produktet", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Dil", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Login" }),
  ).toBeVisible();
});

test("authenticated users outside the admin allowlist cannot enter the dashboard", async ({
  page,
}) => {
  const backend = await adminBackend(page, { denied: true });
  await login(page);
  await expect(
    page.getByRole("heading", { name: "Qasja nuk u konfirmua" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Shto produkt", exact: true }),
  ).toHaveCount(0);
  expect(backend.writes).toBe(0);
});

for (const width of [440, 1440]) {
  test(`products can be uploaded, saved, edited and deleted at ${width}px`, async ({
    page,
  }) => {
    const backend = await adminBackend(page);
    await page.setViewportSize({ width, height: 1000 });
    await login(page);
    await page
      .getByRole("button", { name: "Shto produkt", exact: true })
      .click();
    await page.getByLabel("Emri i produktit").fill("Produkt provë");
    await page.getByLabel(/Çmimi/).fill("429.50");
    await page
      .getByRole("combobox", { name: "Kategoria", exact: true })
      .selectOption("telefona");
    await page
      .getByLabel("Përshkrimi", { exact: true })
      .fill("Produkt vetëm për testin e administrimit.");
    await page
      .locator('input[type="file"]')
      .setInputFiles("public/assets/phone-air-blue.webp");
    await expect(page.getByAltText("Foto 1")).toBeVisible();
    await page.getByRole("checkbox", { name: /Shfaq në dyqan/ }).check();
    await page
      .getByRole("button", { name: "Ruaj produktin", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Produkt provë", exact: true }),
    ).toBeVisible();
    expect(backend.uploads).toHaveLength(2);
    expect(backend.catalog.products.at(-1).published).toBe(true);
    expect(backend.catalog.products.at(-1).price).toBe(429.50);
    await page
      .getByRole("button", { name: "Produkt provë", exact: true })
      .click();
    await page.getByLabel("Emri i produktit").fill("Produkt i ndryshuar");
    await expect(page.getByLabel(/Çmimi/)).toHaveValue("429.5");
    await page.getByLabel(/Çmimi/).fill("399");
    backend.failedSave = true;
    await page
      .getByRole("button", { name: "Ruaj produktin", exact: true })
      .click();
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByLabel("Emri i produktit")).toHaveValue(
      "Produkt i ndryshuar",
    );
    await page
      .getByRole("button", { name: "Ruaj produktin", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Produkt i ndryshuar", exact: true }),
    ).toBeVisible();
    expect(backend.catalog.products.find(product => product.name === "Produkt i ndryshuar").price).toBe(399);
    await page
      .getByRole("button", { name: "Produkt i ndryshuar", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Fshije produktin", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toContainText("Produkt i ndryshuar");
    await page
      .getByRole("button", { name: "Anulo", exact: true })
      .last()
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page
      .getByRole("button", { name: "Fshije produktin", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Fshije", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Produktet", exact: true }),
    ).toBeVisible();
    expect(
      backend.catalog.products.some(
        (product) => product.name === "Produkt i ndryshuar",
      ),
    ).toBe(false);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  });
}

test("new categories and homepage selections persist after reloading", async ({
  page,
}) => {
  const backend = await adminBackend(page);
  backend.catalog.settings.collection_product_ids = Array.from(
    { length: 12 },
    (_, index) => "deleted-product-" + index,
  );
  await login(page);
  await page
    .getByRole("navigation", { name: "Administrimi" })
    .getByRole("button", { name: "Kategoritë" })
    .click();
  await page.getByRole("button", { name: "Shto kategori" }).click();
  await page.getByLabel("Emri i kategorisë").fill("Laptopë");
  await page
    .getByLabel("Përshkrimi", { exact: true })
    .fill("Laptopë për punë dhe studim.");
  await page.getByRole("button", { name: "Ruaj kategorinë" }).click();
  await expect(
    page.getByRole("heading", { name: "Laptopë", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Administrimi" })
    .getByRole("button", { name: "Ballina" })
    .click();
  await page
    .getByRole("combobox", { name: "Produkti", exact: true })
    .selectOption("iphone-air");
  await page.getByRole("checkbox", { name: "iPhone 17", exact: true }).check();
  await page.getByRole("button", { name: "Ruaj ballinën" }).click();
  await expect(page.getByRole("status")).toHaveText("Ndryshimet u ruajtën.");
  await expect(
    page.getByRole("combobox", { name: "Produkti", exact: true }),
  ).toHaveValue("iphone-air");
  // Saving an unchanged selection must leave the editor usable as well.
  await page.getByRole("button", { name: "Ruaj ballinën" }).click();
  await expect(page.getByRole("button", { name: "Ruaj ballinën" })).toBeEnabled();
  await page.reload();
  await page
    .getByRole("navigation", { name: "Administrimi" })
    .getByRole("button", { name: "Ballina" })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Produkti", exact: true }),
  ).toHaveValue("iphone-air");
  await page.goto("/produktet.html");
  await expect(
    page
      .locator(".category-directory-grid")
      .getByRole("link", { name: "Laptopë", exact: true }),
  ).toBeVisible();
  await page.goto("/");
  await expect(page.locator("#produkti-i-kerkuar h3")).toHaveText("iPhone Air");
  expect(backend.catalog.settings.featured_product_id).toBe("iphone-air");
});

test("admin search and pagination keep an expanded catalog to 20 rows", async ({
  page,
}) => {
  const backend = await adminBackend(page);
  const original = backend.catalog.products[0];
  backend.catalog.products = Array.from({ length: 200 }, (_, index) => ({
    ...original,
    id: `example-${index}`,
    name: `Model ${String(index).padStart(3, "0")}`,
  }));
  await login(page);
  await expect(page.locator("tbody tr")).toHaveCount(20);
  await page.getByRole("button", { name: "Faqja tjetër" }).click();
  await expect(
    page.getByRole("button", { name: "Model 020", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("searchbox", { name: "Kërko produkte" })
    .fill("Model 199");
  await expect(page.locator("tbody tr")).toHaveCount(1);
});
