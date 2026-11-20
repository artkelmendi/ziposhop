import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { resolvePath, useLocation, useNavigate } from "react-router-dom";
import { NavigationContext } from "./components/AppLink";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PageSkeleton from "./components/PageSkeleton";
import RouteError from "./components/RouteError";
import { useIntroCovered } from "./components/BrandIntro";
import { categories, products } from "./data/catalog";

const HomePage = lazy(() => import("./pages/HomePage"));
const CatalogPage = lazy(() => import("./pages/CatalogPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const pages = { home: HomePage, catalog: CatalogPage, contact: ContactPage };

function PageEntry({ children, location, title }) {
  const introCovered = useIntroCovered();
  const [entering, setEntering] = useState(true);
  useEffect(() => {
    document.title = title;
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
  }, [introCovered]);
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
  const productId = new URLSearchParams(location.search).get("produkt");
  const category = categories.find(
    (item) => item.id === new URLSearchParams(location.search).get("kategoria"),
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
  return (
    <NavigationContext.Provider value={transition}>
      <a className="skip-link" href="#kryesore">
        Kalo te përmbajtja
      </a>
      <Header loading={leaving} />
      <div className={"page-content" + (leaving ? " route-out" : "")}>
        <RouteError key={page}>
          <Suspense
            fallback={
              <main id="kryesore">
                <PageSkeleton page={page} directory={!productId && !category} />
              </main>
            }
          >
            <PageEntry
              key={
                page +
                "-" +
                (productId || category?.id || "directory") +
                (page === "home"
                  ? "-" +
                    (new URLSearchParams(location.search).get("hero") ||
                      "studio")
                  : "")
              }
              location={location}
              title={title}
            >
              <Page />
            </PageEntry>
          </Suspense>
        </RouteError>
      </div>
      <Footer />
    </NavigationContext.Provider>
  );
}
