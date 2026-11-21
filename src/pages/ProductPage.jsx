import { useState } from "react";
import AppLink from "../components/AppLink";
import Media from "../components/Media";
import ProductCard from "../components/ProductCard";
import ProductLoading from "../components/ProductLoading";
import Icon from "../components/Icon";
import { useCatalog } from "../data/CatalogContext";
import { catalogUrl, store } from "../data/store";
export default function ProductPage({ product }) {
  const { products, categories, demo, loading, error, refresh } = useCatalog();
  const [choice, setChoice] = useState(0);
  if (!product && (loading || error)) return (
    <div className="wrap catalog-main">
      <nav className="breadcrumb" aria-label="Vendndodhja">
        <AppLink to="/index.html">Ballina</AppLink><span>/</span>
        <AppLink to="/produktet.html">Produktet</AppLink>
      </nav>
      <div className="catalog-top"><h1>Produkti</h1></div>
      {loading ? <ProductLoading detail /> : <div className="empty-state">
        <p role="alert">{error}</p>
        <button className="btn btn-dark" onClick={refresh}>Provo përsëri</button>
      </div>}
    </div>
  );
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
        ". A është në dispozicion dhe sa kushton? " +
        window.location.href,
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
          {
            categories.find((category) => category.id === product.category)
              ?.name
          }
        </AppLink>
      </nav>
      <article className="detail-layout">
        <Media
          className="detail-photo"
          src={image}
          alt={product.name + (option ? " — " + option[0] : "")}
          eager
          skeleton
          id="detail-image"
        />
        <div className="detail-copy">
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          {product.price != null && (
            <p className="detail-price">
              {new Intl.NumberFormat("sq-XK", {
                style: "currency",
                currency: "EUR",
              }).format(Number(product.price))}
            </p>
          )}
          {product.available === false && (
            <p className="availability-note">
              Për momentin i padisponueshëm. Pyet dyqanin për këtë model.
            </p>
          )}
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
            {demo || product.is_demo
              ? "Model ilustrues. Kontakto dyqanin për çmimin dhe disponueshmërinë."
              : "Kontakto dyqanin për porosinë dhe detajet e produktit."}
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
            <ProductCard key={item.id} product={item} order={i} skeleton />
          ))}
        </div>
      </section>
    </div>
  );
}
