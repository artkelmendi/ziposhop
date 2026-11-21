import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { resolvePath, useLocation, useNavigate } from "react-router-dom";
import { NavigationContext } from "./components/AppLink";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PageSkeleton from "./components/PageSkeleton";
import RouteError from "./components/RouteError";
import { useIntroCovered } from "./components/BrandIntro";
import { useCatalog } from "./data/CatalogContext";

const HomePage = lazy(() => import("./pages/HomePage"));
const CatalogPage = lazy(() => import("./pages/CatalogPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const pages = { home: HomePage, catalog: CatalogPage, contact: ContactPage };

function PageEntry({ children, location, title, loading }) {
  const introCovered = useIntroCovered();
  const [entering, setEntering] = useState(true);
  useEffect(() => {
    if (introCovered || loading) return;
    const timer = setTimeout(() => setEntering(false), 1500);
    const frame = requestAnimationFrame(() => {
      if (location.hash && location.hash !== "#kerko")
        document.getElementById(location.hash.slice(1))?.scrollIntoView();
      else if (!location.hash) window.scrollTo({ top: 0, behavior: "instant" });
    });
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [introCovered, loading, location.hash]);
  useEffect(() => {
    document.title = title;
  }, [title]);
  return (
    <main
      id="kryesore"
      tabIndex={-1}
      className={entering ? "page-entering" : ""}
    >
      {children}
    </main>
  );
}

export default function App() {
  const { categories, products, loading, error, refresh } = useCatalog();
  const location = useLocation();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const timer = useRef(null);
  const page =
    location.pathname === "/kontakti.html"
      ? "contact"
      : location.pathname === "/produktet.html"
        ? "catalog"
        : "home";
  const params = new URLSearchParams(location.search);
  const productId = params.get("produkt");
  const category = !params.has("q") && categories.find(
    (item) => item.id === params.get("kategoria"),
  );
  const title = productId
    ? (products.find((product) => product.id === productId)?.name ||
        "Modeli nuk u gjet") + " — ZIPO Mobil Shop"
    : page === "home"
      ? "ZIPO Mobil Shop — Teknologji në lëvizje"
      : page === "catalog"
        ? (category?.name || "Produktet") + " — ZIPO Mobil Shop"
        : "Kontakti — ZIPO Mobil Shop";
  useEffect(() => {
    setLeaving(false);
  }, [location]);
  useEffect(() => () => clearTimeout(timer.current), []);
  function transition(to) {
    clearTimeout(timer.current);
    const destination = resolvePath(to, location.pathname);
    if (
      destination.pathname === location.pathname &&
      destination.search === location.search
    ) {
      if (destination.hash === "#kerko")
        document.getElementById("catalog-search")?.focus();
      else if (destination.hash)
        document.getElementById(destination.hash.slice(1))?.scrollIntoView();
      navigate(to);
      return;
    }
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) {
      navigate(to);
      return;
    }
    setLeaving(true);
    timer.current = setTimeout(() => navigate(to), 180);
  }
  const Page = pages[page];
  const contentLoading = loading && page !== "contact";
  const contentError = error && page !== "contact";
  const routeKey =
    page +
    "-" +
    (productId ||
      category?.id ||
      "directory") +
    (page === "home"
      ? "-" + (new URLSearchParams(location.search).get("hero") || "studio")
      : "");
  return (
    <NavigationContext.Provider value={transition}>
      <a className="skip-link" href="#kryesore">
        Kalo te përmbajtja
      </a>
      <Header loading={leaving} />
      <div className={"page-content" + (leaving ? " route-out" : "")}>
        <PageEntry
          key={routeKey}
          location={location}
          title={title}
          loading={contentLoading}
        >
          <RouteError key={page}>
            <Suspense
              fallback={
                <PageSkeleton page={page} directory={!productId && !category} />
              }
            >
              {contentLoading ? (
                <PageSkeleton page={page} directory={!productId && !category} />
              ) : contentError ? (
                <div className="wrap catalog-main">
                  <div className="empty-state">
                    <h1>Katalogu nuk u ngarkua</h1>
                    <p role="alert">{error}</p>
                    <button className="btn btn-dark" onClick={refresh}>
                      Provo përsëri
                    </button>
                  </div>
                </div>
              ) : (
                <Page />
              )}
            </Suspense>
          </RouteError>
        </PageEntry>
      </div>
      <Footer />
    </NavigationContext.Provider>
  );
}
