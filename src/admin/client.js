import { createClient } from "@supabase/supabase-js";
import { backendConfigured, backendKey, backendUrl } from "../lib/backend";

export const supabase = backendConfigured
  ? createClient(backendUrl, backendKey, {
      global: {
        fetch: (url, options = {}) => {
          const timeout = AbortSignal.timeout(12000);
          const signal =
            options.signal && AbortSignal.any
              ? AbortSignal.any([options.signal, timeout])
              : options.signal || timeout;
          return fetch(url, { ...options, signal });
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function friendlyError(error) {
  if (error?.code === "23505")
    return "Ky emër përdoret tashmë. Provo një emër tjetër.";
  if (error?.code === "23503")
    return "Kategoria ka ende produkte. Zhvendosi ose fshiji ato përpara se të fshish kategorinë.";
  if (error?.code === "42501" || error?.status === 403)
    return "Nuk ke leje për këtë veprim. Hyr përsëri si administrator.";
  if (error?.message?.includes("fetch") || error?.name === "TypeError")
    return "Lidhja u ndërpre. Kontrollo internetin dhe provo përsëri.";
  return "Veprimi nuk u krye. Provo përsëri; ndryshimet e tua janë ende në formular.";
}

export async function loadAdminCatalog() {
  const [categories, products, settings] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order").order("name"),
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase.from("homepage_settings").select("*").eq("id", 1).single(),
  ]);
  for (const result of [categories, products, settings])
    if (result.error) throw result.error;
  return {
    categories: categories.data,
    products: products.data,
    settings: settings.data,
  };
}

export const slugify = (name) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);

export async function saveRecord(table, record, existing) {
  const query = existing
    ? supabase.from(table).update(record).eq("id", existing.id)
    : supabase.from(table).insert(record);
  const result = await query.select().single();
  if (result.error) throw result.error;
  return result.data;
}

export async function deleteRecord(table, id) {
  const { error, data } = await supabase
    .from(table)
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Delete denied");
}
