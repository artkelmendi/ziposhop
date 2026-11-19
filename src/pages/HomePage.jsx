import Hero from "../components/Hero";
import Collection from "../components/Collection";
import AppLink from "../components/AppLink";
import Media from "../components/Media";
import Icon from "../components/Icon";
import { categories } from "../data/catalog";
import { catalogUrl } from "../data/store";
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
            <AppLink
              key={cat.id}
              className="category-tile"
              data-cat={cat.id}
              to={catalogUrl(cat.id)}
              style={{ "--entrance-order": i }}
            >
              <Media className="category-photo" src={cat.image} eager />
              <span className="category-name">{cat.name}</span>
            </AppLink>
          ))}
        </div>
      </section>
      <Collection />
    </>
  );
}
