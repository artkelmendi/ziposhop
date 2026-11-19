import Hero from "../components/Hero";
import Collection from "../components/Collection";
import AppLink from "../components/AppLink";
import CategoryCard from "../components/CategoryCard";
import Icon from "../components/Icon";
import { categories } from "../data/catalog";
export default function HomePage() {
  return (
    <>
      <Hero />
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
        <div className="category-grid">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} compact order={i} />
          ))}
        </div>
      </section>
      <Collection />
    </>
  );
}
