import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import AppLink from "./AppLink";
import { useCatalog } from "../data/CatalogContext";
import { categories as initialCategories } from "../data/catalog";
import { catalogUrl } from "../data/store";
import { pageForPath } from "../lib/routes";
import styles from "./CategoryNav.module.css";

export default function CategoryNav({ onNavigate }) {
  const { categories, products, loading, error } = useCatalog();
  const location = useLocation();
  const rail = useRef(null);
  const items = loading || error ? initialCategories : categories;
  const params = new URLSearchParams(location.search);
  const inCatalog = pageForPath(location.pathname) === "catalog";
  const selected = inCatalog && !params.has("q")
    ? params.get("kategoria") || products.find(product => product.id === params.get("produkt"))?.category
    : null;

  useEffect(() => {
    const active = rail.current?.querySelector('[aria-current="page"]');
    if (!active) return;
    const container = rail.current.getBoundingClientRect();
    const link = active.getBoundingClientRect();
    if (link.left < container.left || link.right > container.right) {
      // Only move the category rail; never move the page during a route entrance.
      rail.current.scrollTo({
        left: rail.current.scrollLeft + link.left - container.left - (container.width - link.width) / 2,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    }
  }, [selected, inCatalog, items]);

  return (
    <nav className={styles.nav} aria-label="Shfleto kategoritë">
      <div className={styles.rail} ref={rail}>
        <ul className={styles.links}>
          <li><AppLink className={styles.link} to={catalogUrl()} aria-current={inCatalog && !selected ? "page" : undefined} onClick={onNavigate}>Të gjitha</AppLink></li>
          {items.map(category => (
            <li key={category.id}>
              <AppLink className={styles.link} to={catalogUrl(category.id)} aria-current={selected === category.id ? "page" : undefined} onClick={onNavigate}>
                {category.name}
              </AppLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
