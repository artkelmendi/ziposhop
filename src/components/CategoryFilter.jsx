import { useEffect, useId, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import AppLink from "./AppLink";
import Icon from "./Icon";
import { useCatalog } from "../data/CatalogContext";
import { catalogUrl } from "../data/store";
import styles from "./CategoryFilter.module.css";

export default function CategoryFilter({ category }) {
  const { categories, products } = useCatalog();
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState({ side: "below", space: 420 });
  const root = useRef(null);
  const toggle = useRef(null);
  const focusOnOpen = useRef(null);
  const id = useId();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.key]);
  useEffect(() => {
    function outside(event) {
      if (!root.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    const resize = () => setOpen(false);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", resize);
    };
  }, []);
  useEffect(() => {
    if (!open || !focusOnOpen.current) return;
    const links = root.current.querySelectorAll("nav a");
    links[focusOnOpen.current === "last" ? links.length - 1 : 0]?.focus();
    focusOnOpen.current = null;
  }, [open]);

  function expand() {
    const box = toggle.current.getBoundingClientRect();
    const headerBottom = document.querySelector("header")?.getBoundingClientRect().bottom || 0;
    const below = window.innerHeight - box.bottom - 18;
    const above = box.top - headerBottom - 18;
    const upwards = below < Math.min(420, categories.length * 46 + 64) && above > below;
    setPlacement({
      side: upwards ? "above" : "below",
      space: Math.max(80, Math.min(420, upwards ? above : below)),
    });
    setOpen(true);
  }

  function keydown(event) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      toggle.current?.focus();
    } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      if (!open && !event.key.startsWith("Arrow")) return;
      event.preventDefault();
      if (!open) {
        focusOnOpen.current = event.key === "ArrowUp" ? "last" : "first";
        expand();
        return;
      }
      const links = [...root.current.querySelectorAll("nav a")];
      const index = links.indexOf(document.activeElement);
      const next = event.key === "Home" ? 0
        : event.key === "End" ? links.length - 1
          : (index + (event.key === "ArrowUp" ? -1 : 1) + links.length) % links.length;
      links[next]?.focus();
    }
  }

  return (
    <div
      ref={root}
      className={styles.filter}
      data-open={open}
      data-side={placement.side}
      style={{ "--filter-space": `${placement.space}px` }}
      onKeyDown={keydown}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={toggle}
        type="button"
        className={styles.toggle}
        aria-label={`Filtro kategorinë: ${category?.name || "Të gjitha kategoritë"}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => open ? setOpen(false) : expand()}
      >
        <Icon name="sliders" />
        <span>{category?.name || "Të gjitha kategoritë"}</span>
        <span className={styles.chevron}><Icon name="chevronDown" /></span>
      </button>
      <nav
        id={id}
        className={styles.panel}
        aria-label="Kategoritë"
        aria-hidden={!open}
        inert={!open}
      >
        <AppLink
          to="/produktet.html"
          className={styles.all}
          onClick={() => setOpen(false)}
        >
          Të gjitha kategoritë <Icon name="arrow" />
        </AppLink>
        {categories.map(item => (
          <AppLink
            key={item.id}
            to={catalogUrl(item.id)}
            aria-current={category?.id === item.id ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            <span>{item.name}</span>
            <span className={styles.count}>
              {products.filter(product => product.category === item.id).length}
            </span>
            <span className={styles.selected}>
              {category?.id === item.id && <Icon name="check" />}
            </span>
          </AppLink>
        ))}
      </nav>
    </div>
  );
}
