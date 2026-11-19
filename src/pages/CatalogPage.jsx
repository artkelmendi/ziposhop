import { useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import AppLink from "../components/AppLink";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";
import Icon from "../components/Icon";
import { categories, products } from "../data/catalog";
import { catalogUrl, categoryName } from "../data/store";
import ProductPage from "./ProductPage";
import "./CatalogPage.css";

const PAGE_SIZE = 24;
function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function CatalogSearch({ value, onChange, directory = false }) {
  const input = useRef(null);
  const { hash } = useLocation();
  useEffect(() => {
    if (hash === "#kerko") {
      input.current?.focus({ preventScroll: true });
      input.current?.scrollIntoView({ block: "center" });
    }
  }, [hash]);
  return (
    <form
      className="catalog-search"
      role="search"
      onSubmit={(event) => event.preventDefault()}
    >
      <Icon name="search" />
      <label className="sr-only" htmlFor="catalog-search">
        {directory ? "Kërko kategori" : "Kërko produkt"}
      </label>
      <input
        ref={input}
        type="search"
        id="catalog-search"
        autoComplete="off"
        value={value}
        placeholder={
          directory
            ? "Kërko një kategori ose produkt…"
            : "Kërko brenda kategorisë…"
        }
        onChange={(event) => onChange(event.target.value)}
      />
    </form>
  );
}

function CategoryDirectory() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const results = categories.filter((category) =>
    normalize(
      category.name +
        " " +
        category.description +
        " " +
        products
          .filter((product) => product.category === category.id)
          .map((product) => product.name)
          .join(" "),
    ).includes(normalize(query)),
  );
  return (
    <div className="wrap catalog-main category-directory">
      <nav className="breadcrumb" aria-label="Vendndodhja">
        <AppLink to="/index.html">Ballina</AppLink>
        <span>/</span>Produktet
      </nav>
      <div className="catalog-top">
        <h1>Katalogu i produkteve</h1>
        <p>Zgjidh kategorinë për të parë produktet.</p>
      </div>
      <CatalogSearch value={query} onChange={setQuery} directory />
      <div
        className="category-directory-grid"
        aria-label="Kategoritë e produkteve"
      >
        {results.length ? (
          results.map((category, i) => (
            <CategoryCard key={category.id} category={category} order={i} />
          ))
        ) : (
          <div className="empty-state">
            <h2>Asnjë kategori e gjetur.</h2>
            <p>Provo një emër tjetër ose shiko të gjitha kategoritë.</p>
            <button className="btn btn-dark" onClick={() => setQuery("")}>
              Shiko kategoritë
            </button>
          </div>
        )}
      </div>
      <p className="catalog-note">
        Fotot paraqesin modele ilustruese. Pyet dyqanin për disponueshmërinë.
      </p>
    </div>
  );
}

function CategoryProducts({ category }) {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const results = products.filter(
    (product) =>
      product.category === category.id &&
      normalize(
        product.name +
          " " +
          categoryName(product.category) +
          " " +
          product.specs.flat().join(" "),
      ).includes(normalize(query)),
  );
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const requestedPage = Number(params.get("faqja") || 1);
  const currentPage = Number.isSafeInteger(requestedPage)
    ? Math.min(pageCount, Math.max(1, requestedPage))
    : 1;
  const visible = results.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  function search(value) {
    const next = new URLSearchParams(params);
    next.delete("faqja");
    if (value) next.set("q", value);
    else next.delete("q");
    setParams(next, { replace: true });
  }
  function changePage(page) {
    const next = new URLSearchParams(params);
    if (page === 1) next.delete("faqja");
    else next.set("faqja", String(page));
    setParams(next);
    document
      .getElementById("category-results")
      ?.scrollIntoView({ block: "start" });
  }
  return (
    <div className="wrap catalog-main category-screen">
      <nav className="breadcrumb" aria-label="Vendndodhja">
        <AppLink to="/index.html">Ballina</AppLink>
        <span>/</span>
        <AppLink to="/produktet.html">Produktet</AppLink>
        <span>/</span>
        {category.name}
      </nav>
      <div className="catalog-top">
        <h1>{category.name}</h1>
        <p>{category.description}</p>
      </div>
      <div className="category-toolbar">
        <CatalogSearch value={query} onChange={search} />
        <AppLink className="section-link" to="/produktet.html">
          Ndrysho kategorinë
        </AppLink>
      </div>
      <nav className="filter-list" aria-label="Kategoritë">
        {categories.map((cat) => (
          <AppLink
            key={cat.id}
            className="filter"
            to={catalogUrl(cat.id)}
            aria-current={category.id === cat.id ? "page" : undefined}
          >
            {cat.name}
          </AppLink>
        ))}
      </nav>
      <div id="category-results">
        <div className="catalog-status" aria-live="polite">
          {results.length} {results.length === 1 ? "produkt" : "produkte"}
        </div>
        <div
          className="product-grid catalog-grid category-results"
          id="product-grid"
          key={currentPage}
        >
          {visible.length ? (
            visible.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                order={Math.min(i, 6)}
              />
            ))
          ) : (
            <div className="empty-state">
              <h2>Asnjë produkt i gjetur.</h2>
              <p>Provo një emër tjetër brenda kategorisë.</p>
              <button className="btn btn-dark" onClick={() => search("")}>
                Hiqe kërkimin
              </button>
            </div>
          )}
        </div>
        {pageCount > 1 && (
          <nav className="catalog-pagination" aria-label="Faqet e produkteve">
            <button
              className="btn btn-outline"
              disabled={currentPage === 1}
              onClick={() => changePage(currentPage - 1)}
            >
              E mëparshme
            </button>
            <span aria-live="polite">
              Faqja {currentPage} nga {pageCount}
            </span>
            <button
              className="btn btn-outline"
              disabled={currentPage === pageCount}
              onClick={() => changePage(currentPage + 1)}
            >
              Tjetra
            </button>
          </nav>
        )}
      </div>
      <p className="catalog-note">
        Katalog ilustrues. Dyqani konfirmon çmimin dhe disponueshmërinë e
        secilit model.
      </p>
    </div>
  );
}

export default function CatalogPage() {
  const [params] = useSearchParams();
  if (params.has("produkt")) {
    const id = params.get("produkt");
    return (
      <ProductPage
        key={id}
        product={products.find((product) => product.id === id)}
      />
    );
  }
  const category = categories.find((cat) => cat.id === params.get("kategoria"));
  return category ? (
    <CategoryProducts category={category} />
  ) : (
    <CategoryDirectory />
  );
}
