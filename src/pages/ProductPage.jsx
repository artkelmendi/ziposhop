import { useState } from "react";
import AppLink from "../components/AppLink";
import Media from "../components/Media";
import ProductCard from "../components/ProductCard";
import Icon from "../components/Icon";
import { products } from "../data/catalog";
import { catalogUrl, categoryName, store } from "../data/store";
export default function ProductPage({ product }) {
  const [choice, setChoice] = useState(0);
  if (!product)
    return (
      <div className="wrap catalog-main">
        <div className="empty-state">
          <h1>Modeli nuk u gjet.</h1>
          <p>Shfleto modelet e tjera në katalog.</p>
          <AppLink className="btn btn-dark" to="/produktet.html">
            Hap katalogun
          </AppLink>
        </div>
      </div>
    );
  const options = product.finishes || product.views;
  const option = options?.[choice];
  const image = option?.at(-1) || product.image;
  const name = product.name + (product.finishes ? " (" + option[0] + ")" : "");
  const inquiry =
    store.whatsapp +
    "?text=" +
    encodeURIComponent(
      "Përshëndetje ZIPO! Më intereson " +
        name +
        ". A është në dispozicion dhe sa kushton?",
    );
  const related = products
    .filter((item) => item.id !== product.id)
    .sort(
      (a, b) =>
        Number(b.category === product.category) -
        Number(a.category === product.category),
    )
    .slice(0, 4);
  return (
    <div className="wrap catalog-main" id="detail-view">
      <nav className="breadcrumb" aria-label="Vendndodhja">
        <AppLink to="/index.html">Ballina</AppLink>
        <span>/</span>
        <AppLink to="/produktet.html">Produktet</AppLink>
        <span>/</span>
        <AppLink to={catalogUrl(product.category)}>
          {categoryName(product.category)}
        </AppLink>
      </nav>
      <article className="detail-layout">
        <Media
          className="detail-photo"
          src={image}
          alt={product.name + (option ? " — " + option[0] : "")}
          eager
          id="detail-image"
        />
        <div className="detail-copy">
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          {options && (
            <div
              className="image-options"
              role="group"
              aria-label={product.finishes ? "Ngjyra" : "Pamja"}
            >
              {options.map((item, i) => (
                <button
                  className="option"
                  key={item[0]}
                  aria-pressed={choice === i}
                  onClick={() => setChoice(i)}
                >
                  {product.finishes && (
                    <span className="swatch" style={{ background: item[1] }} />
                  )}
                  {item[0]}
                </button>
              ))}
            </div>
          )}
          <dl className="detail-specs">
            {product.specs.map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <a
            className="btn btn-dark"
            id="product-inquiry"
            href={inquiry}
            target="_blank"
            rel="noopener"
          >
            <Icon name="message" />
            Pyet në WhatsApp
          </a>
          <p className="catalog-note">
            Model ilustrues. Kontakto dyqanin për çmimin dhe disponueshmërinë.
          </p>
        </div>
      </article>
      <section className="related">
        <div className="section-heading">
          <h2>Shiko edhe</h2>
          <AppLink className="section-link" to="/produktet.html">
            Të gjitha produktet
          </AppLink>
        </div>
        <div className="product-grid">
          {related.map((item, i) => (
            <ProductCard key={item.id} product={item} order={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
