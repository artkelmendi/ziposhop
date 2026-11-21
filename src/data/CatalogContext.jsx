import { createContext, useContext, useEffect, useRef, useState } from "react";
import { categories, products } from "./catalog";
import { featuredProductId } from "./homeContent";
import { backendConfigured, readCatalog } from "../lib/backend";

const sample = {
  categories,
  products,
  settings: { featured_product_id: featuredProductId },
  demo: true,
};
const CatalogContext = createContext({
  ...sample,
  loading: false,
  error: null,
  refresh() {},
});
export const useCatalog = () => useContext(CatalogContext);

export function useCategory(id) {
  const catalog = useCatalog();
  return catalog.categories.find(category => category.id === id) ||
    ((catalog.loading || catalog.error) && id
      ? categories.find(category => category.id === id) || { id, name: "Produktet", description: "", artwork: [] }
      : null);
}

export default function CatalogProvider({ children }) {
  const [state, setState] = useState(
    backendConfigured
      ? {
          categories: [],
          products: [],
          settings: {},
          loading: true,
          error: null,
          demo: false,
        }
      : { ...sample, loading: false, error: null },
  );
  const [revision, setRevision] = useState(0);
  const refreshed = useRef(0);
  useEffect(() => {
    if (!backendConfigured) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    let active = true;
    readCatalog(controller.signal)
      .then((catalog) => {
        if (active) {
          refreshed.current = Date.now();
          setState({ ...catalog, loading: false, error: null, demo: false });
        }
      })
      .catch(() => {
        if (active)
          setState((value) => ({
            ...value,
            loading: false,
            error: "Katalogu nuk u ngarkua. Provo përsëri.",
          }));
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [revision]);
  useEffect(() => {
    function refresh() {
      if (
        document.visibilityState === "visible" &&
        Date.now() - refreshed.current > 60000
      )
        setRevision((value) => value + 1);
    }
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return (
    <CatalogContext.Provider
      value={{ ...state, refresh: () => setRevision((value) => value + 1) }}
    >
      {children}
    </CatalogContext.Provider>
  );
}
