export const backendUrl = (import.meta.env.VITE_SUPABASE_URL || "").replace(
  /\/$/,
  "",
);
export const backendKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
export const backendConfigured = Boolean(backendUrl && backendKey);

export function imageUrl(src) {
  if (!src) return "";
  if (/^https:\/\//i.test(src) || src.startsWith("blob:")) return src;
  return import.meta.env.BASE_URL + "assets/" + src;
}

export function normalizeProduct(product) {
  const images = Array.isArray(product.images) ? product.images : [];
  return {
    ...product,
    specs: Array.isArray(product.specs) ? product.specs : [],
    views: product.finishes?.length
      ? product.views
      : images.length > 1
        ? images.map((image, i) => ["Pamja " + (i + 1), image.url])
        : product.views,
  };
}

export async function readCatalog(signal) {
  const headers = { apikey: backendKey };
  async function query(path) {
    const response = await fetch(backendUrl + "/rest/v1/" + path, {
      headers,
      signal,
    });
    if (!response.ok) throw new Error("Katalogu nuk u ngarkua. Provo përsëri.");
    return response.json();
  }
  const [categories, products, settings] = await Promise.all([
    query("categories?select=*&order=sort_order.asc,name.asc"),
    query("products?select=*&order=sort_order.asc,created_at.desc&limit=1000"),
    query("homepage_settings?select=*&id=eq.1"),
  ]);
  return {
    categories,
    products: products.map(normalizeProduct),
    settings: settings[0] || {},
  };
}
