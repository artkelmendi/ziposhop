import { useEffect, useRef, useState } from "react";
import { resolvePath, useLocation, useNavigate } from "react-router-dom";
import { NavigationContext } from "./components/AppLink";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RouteError from "./components/RouteError";
import { useIntroCovered } from "./components/BrandIntro";
import { useCatalog, useCategory } from "./data/CatalogContext";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import ContactPage from "./pages/ContactPage";
import FaqPage from "./pages/FaqPage";
import PrivacyPage from "./pages/PrivacyPage";
import PrivacyConsent from "./components/PrivacyConsent";
import { pageForPath } from "./lib/routes";
import { preloadCategoryImage } from "./lib/categoryImages";

const pages = { home: HomePage, catalog: CatalogPage, contact: ContactPage, faq: FaqPage, privacy: PrivacyPage };

function PageEntry({ children, location, title }) {
  const introCovered = useIntroCovered();
  const [entering, setEntering] = useState(true);
  useEffect(() => {
    if (introCovered) return;
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
  }, [introCovered, location.hash]);
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
  const { products, loading } = useCatalog();
  const location = useLocation();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const timer = useRef(null);
  const page = pageForPath(location.pathname);
  const params = new URLSearchParams(location.search);
  const productId = params.get("produkt");
  const categoryId = !params.has("q") ? params.get("kategoria") : null;
  const category = useCategory(categoryId);
  const title = productId
    ? (products.find((product) => product.id === productId)?.name ||
        (loading ? "Produkti" : "Modeli nuk u gjet")) + " — ZIPO Mobil Shop"
    : page === "home"
      ? "ZIPO Mobil Shop — Teknologji në lëvizje"
      : page === "catalog"
        ? (category?.name || "Produktet") + " — ZIPO Mobil Shop"
        : page === "faq" ? "Pyetje të shpeshta — ZIPO Mobil Shop"
          : page === "privacy" ? "Privatësia dhe cookies — ZIPO Mobil Shop" : "Kontakti — ZIPO Mobil Shop";
  useEffect(() => {
    setLeaving(false);
  }, [location]);
  useEffect(() => () => clearTimeout(timer.current), []);
  function transition(to) {
    clearTimeout(timer.current);
    preloadCategoryImage(to);
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
  const routeKey =
    page +
    "-" +
    (productId ||
      categoryId ||
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
        >
          <RouteError key={page}>
            <Page />
          </RouteError>
        </PageEntry>
      </div>
      <Footer />
      <PrivacyConsent />
    </NavigationContext.Provider>
  );
}
