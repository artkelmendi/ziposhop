import { useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import AppLink from "../components/AppLink";
import ProductCard from "../components/ProductCard";
import Icon from "../components/Icon";
import { categories, products } from "../data/catalog";
import { categoryName } from "../data/store";
import ProductPage from "./ProductPage";

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const { hash } = useLocation();
  const input = useRef(null);
  const category = categories.some((cat) => cat.id === params.get("kategoria"))
    ? params.get("kategoria")
    : "";
  const query = params.get("q") || "";
  const id = params.get("produkt");
  useEffect(() => {
    if (hash === "#kerko") {
      input.current?.focus({ preventScroll: true });
      input.current?.scrollIntoView({ block: "center" });
    }
  }, [hash, id]);
  if (params.has("produkt"))
    return (
      <ProductPage
        key={id}
        product={products.find((product) => product.id === id)}
      />
    );
  const results = products.filter(
    (product) =>
      (!category || product.category === category) &&
      normalize(
        product.name +
          " " +
          categoryName(product.category) +
          " " +
          product.specs.flat().join(" "),
      ).includes(normalize(query)),
  );
  function update(key, value) {
    const next = new URLSearchParams(params);
    next.delete("produkt");
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }
  return (
    <div className="wrap catalog-main">
      <nav className="breadcrumb" aria-label="Vendndodhja">
        <AppLink to="/index.html">Ballina</AppLink>
        <span>/</span>Produktet
      </nav>
      <div className="catalog-top">
        <h1>Katalogu i produkteve</h1>
        <p>Eksploro modelet dhe kontakto dyqanin për zgjedhjen tënde.</p>
      </div>
      <form
        className="catalog-search"
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <Icon name="search" />
        <label className="sr-only" htmlFor="catalog-search">
          Kërko produkt
        </label>
        <input
          ref={input}
          type="search"
          id="catalog-search"
          autoComplete="off"
          placeholder="Kërko sipas produktit ose markës…"
          value={query}
          onChange={(event) => update("q", event.target.value)}
        />
      </form>
      <div
        className="filter-list"
        role="group"
        aria-label="Filtro sipas kategorisë"
      >
        {[{ id: "", name: "Të gjitha" }, ...categories].map((cat) => (
          <button
            type="button"
            className="filter"
            key={cat.id}
            aria-pressed={category === cat.id}
            onClick={() => update("kategoria", cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <div className="catalog-status" aria-live="polite">
        {results.length} {results.length === 1 ? "produkt" : "produkte"}
      </div>
      <div className="product-grid catalog-grid" id="product-grid">
        {results.length ? (
          results.map((product, i) => (
            <ProductCard key={product.id} product={product} order={i} />
          ))
        ) : (
          <div className="empty-state">
            <h2>Asnjë produkt i gjetur.</h2>
            <p>Provo një emër tjetër ose hiqi filtrat.</p>
            <button
              className="btn btn-dark"
              onClick={() => {
                setParams({}, { replace: true });
                input.current.focus();
              }}
            >
              Hiqi filtrat
            </button>
          </div>
        )}
      </div>
      <p className="catalog-note">
        Katalog ilustrues. Dyqani konfirmon çmimin dhe disponueshmërinë e
        secilit model.
      </p>
    </div>
  );
}
