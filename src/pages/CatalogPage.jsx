import { useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import AppLink from "../components/AppLink";
import CategoryCard from "../components/CategoryCard";
import CategoryHeader from "../components/CategoryHeader";
import CategoryFilter from "../components/CategoryFilter";
import ProductCard from "../components/ProductCard";
import ProductLoading from "../components/ProductLoading";
import Icon from "../components/Icon";
import { useCatalog, useCategory } from "../data/CatalogContext";
import ProductPage from "./ProductPage";
import "./CatalogPage.css";

const PAGE_SIZE = 24;
function normalize(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function CatalogSearch({ value, onChange }) {
  const input = useRef(null);
  const { hash } = useLocation();
  useEffect(() => {
    if (hash === "#kerko") {
      input.current?.focus({ preventScroll: true });
      input.current?.scrollIntoView({ block: "center" });
    }
  }, [hash]);
  return (
    <form className="catalog-search" role="search" onSubmit={event => event.preventDefault()}>
      <Icon name="search" />
      <label className="sr-only" htmlFor="catalog-search">Kërko produkte</label>
      <input
        ref={input}
        type="search"
        id="catalog-search"
        autoComplete="off"
        value={value}
        placeholder="Kërko produkte…"
        onChange={event => onChange(event.target.value)}
      />
    </form>
  );
}

function CatalogResults({ results, category, onClear }) {
  const { loading, error, refresh } = useCatalog();
  const [params, setParams] = useSearchParams();
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const requestedPage = Number(params.get("faqja") || 1);
  const currentPage = Number.isSafeInteger(requestedPage)
    ? Math.min(pageCount, Math.max(1, requestedPage)) : 1;
  const visible = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  function changePage(page) {
    const next = new URLSearchParams(params);
    if (page === 1) next.delete("faqja");
    else next.set("faqja", String(page));
    setParams(next);
    document.getElementById("category-results")?.scrollIntoView({ block: "start" });
  }
  return (
    <div id="category-results">
      <div className="catalog-controls">
        <p className="catalog-status" role="status">
          {loading ? "Duke ngarkuar produktet…" : `${results.length} ${results.length === 1 ? "produkt" : "produkte"}`}
        </p>
        <CategoryFilter category={category} />
      </div>
      {loading ? <ProductLoading /> : error ? (
        <div className="empty-state">
          <p role="alert">{error}</p>
          <button className="btn btn-dark" onClick={refresh}>Provo përsëri</button>
        </div>
      ) : <div className="product-grid catalog-grid category-results" id="product-grid" key={currentPage}>
        {visible.length ? visible.map((product, i) => (
          <ProductCard key={product.id} product={product} order={Math.min(i, 6)} skeleton />
        )) : (
          <div className="empty-state">
            <h2>{onClear ? "Asnjë produkt i gjetur." : "Produktet po vijnë së shpejti."}</h2>
            <p>{onClear ? "Provo një emër ose model tjetër." : "Kontakto dyqanin për produktet në këtë kategori."}</p>
            {onClear && <button className="btn btn-dark" onClick={onClear}>Hiqe kërkimin</button>}
          </div>
        )}
      </div>}
      {pageCount > 1 && (
        <nav className="catalog-pagination" aria-label="Faqet e produkteve">
          <button className="btn btn-outline" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>
            E mëparshme
          </button>
          <span aria-live="polite">Faqja {currentPage} nga {pageCount}</span>
          <button className="btn btn-outline" disabled={currentPage === pageCount} onClick={() => changePage(currentPage + 1)}>
            Tjetra
          </button>
        </nav>
      )}
    </div>
  );
}

function CategoryDirectory() {
  const { categories, products, loading, error, refresh } = useCatalog();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const searching = Boolean(normalize(query));
  const results = products.filter(product => normalize([
    product.name,
    product.description,
    categories.find(category => category.id === product.category)?.name,
    product.specs.flat().join(" "),
  ].join(" ")).includes(normalize(query)));
  function search(value) {
    const next = new URLSearchParams();
    if (value) next.set("q", value);
    setParams(next, { replace: true });
  }
  return (
    <div className="wrap catalog-main category-directory">
      <nav className="breadcrumb" aria-label="Vendndodhja">
        <AppLink to="/index.html">Ballina</AppLink>
        <span>/</span>Produktet
      </nav>
      <div className="catalog-top">
        <h1>Katalogu i produkteve</h1>
        <p>{searching ? "Rezultate nga të gjitha kategoritë." : "Zgjidh kategorinë për të parë produktet."}</p>
      </div>
      <CatalogSearch value={query} onChange={search} />
      {searching ? (
        <CatalogResults results={results} onClear={() => search("")} />
      ) : (
        <div className="category-directory-grid" aria-label="Kategoritë e produkteve">
          {loading ? <p role="status">Duke ngarkuar kategoritë…</p> : error ? (
            <div className="empty-state">
              <p role="alert">{error}</p>
              <button className="btn btn-dark" onClick={refresh}>Provo përsëri</button>
            </div>
          ) : categories.length ? categories.map((category, i) => (
            <CategoryCard key={category.id} category={category} order={i} />
          )) : (
            <div className="empty-state">
              <h2>Katalogu po përgatitet.</h2>
              <p>Kontakto dyqanin për produktet dhe disponueshmërinë.</p>
            </div>
          )}
        </div>
      )}
      <p className="catalog-note">Kontakto dyqanin për porositë dhe disponueshmërinë.</p>
    </div>
  );
}

function CategoryProducts({ category }) {
  const { products } = useCatalog();
  const results = products.filter(product => product.category === category.id);
  return (
    <div className="wrap catalog-main category-screen">
      <nav className="breadcrumb" aria-label="Vendndodhja">
        <AppLink to="/index.html">Ballina</AppLink>
        <span>/</span>
        <AppLink to="/produktet.html">Produktet</AppLink>
        <span>/</span>{category.name}
      </nav>
      <CategoryHeader category={category} />
      <CatalogResults results={results} category={category} />
      <p className="catalog-note">Dyqani konfirmon çmimin dhe disponueshmërinë e secilit model.</p>
    </div>
  );
}

export default function CatalogPage() {
  const { products } = useCatalog();
  const [params] = useSearchParams();
  const category = useCategory(!params.has("q") ? params.get("kategoria") : null);
  if (params.has("produkt")) {
    const id = params.get("produkt");
    return <ProductPage key={id} product={products.find(product => product.id === id)} />;
  }
  return category ? <CategoryProducts category={category} /> : <CategoryDirectory />;
}
