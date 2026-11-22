import { test as base, expect } from "@playwright/test";
import { categories, initialProducts as products } from "../src/data/catalog";

export function fixtureCatalog() {
  return {
    categories: categories.map((category, sort_order) => ({
      ...category,
      active: true,
      sort_order,
    })),
    products: products.map((product) => ({
      ...product,
      published: true,
      available: true,
      is_demo: true,
      images: [],
      thumbnail: "",
    })),
    settings: {
      id: 1,
      featured_product_id: "kukirin-g2",
      collection_product_ids: [
        "kukirin-g2",
        "iphone-17-pro",
        "ipad-air",
        "airpods-pro-3",
        "niu-nqi-sport",
        "iphone-15-pro",
        "watch-se-3",
      ],
    },
  };
}

export const test = base.extend({
  page: async ({ page }, use) => {
    const catalog = fixtureCatalog();
    await page.route("https://zipo-test.supabase.co/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path === "/rest/v1/categories")
        return route.fulfill({ json: catalog.categories });
      if (path === "/rest/v1/products")
        return route.fulfill({ json: catalog.products });
      if (path === "/rest/v1/homepage_settings")
        return route.fulfill({ json: [catalog.settings] });
      return route.fulfill({ status: 401, json: { message: "Unauthorized" } });
    });
    await use(page);
  },
});
export { expect };
