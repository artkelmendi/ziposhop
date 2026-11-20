import Hero from "../components/Hero";
import StudioHero from "../components/StudioHero";
import { useSearchParams } from "react-router-dom";
import Collection from "../components/Collection";
import FeaturedProduct from "../components/FeaturedProduct";
import InstagramSection from "../components/InstagramSection";
import VisitShop from "../components/VisitShop";
import ScrollReveal from "../components/ScrollReveal";
import AppLink from "../components/AppLink";
import CategoryCard from "../components/CategoryCard";
import Icon from "../components/Icon";
import { useCatalog } from "../data/CatalogContext";
export default function HomePage() {
  const { categories } = useCatalog();
  const [params] = useSearchParams();
  const classic = params.get("hero") === "classic";
  return (
    <>
      {classic ? <Hero /> : <StudioHero />}
      <section
        className="wrap categories-section"
        id="kategorite"
        aria-labelledby="categories-title"
      >
        <div className="section-heading">
          <h2 id="categories-title">Eksploro kategoritë</h2>
          <AppLink
            className="section-link"
            to="/produktet.html"
            aria-label="Të gjitha produktet"
          >
            <span>
              Të gjitha<span className="long-link-label"> produktet</span>
            </span>
            <Icon name="grid" />
          </AppLink>
        </div>
        <ScrollReveal className="category-grid">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} compact order={i} />
          ))}
        </ScrollReveal>
      </section>
      <ScrollReveal>
        <Collection />
      </ScrollReveal>
      <ScrollReveal>
        <FeaturedProduct />
      </ScrollReveal>
      <VisitShop />
      <ScrollReveal>
        <InstagramSection />
      </ScrollReveal>
    </>
  );
}
