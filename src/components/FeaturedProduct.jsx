import AppLink from "./AppLink";
import Media from "./Media";
import ProductPrice from "./ProductPrice";
import { useCatalog } from "../data/CatalogContext";
import { productUrl } from "../data/store";
import styles from "./HomeHighlights.module.css";

export default function FeaturedProduct({ productId }) {
  const { products, settings } = useCatalog();
  productId ??= settings.featured_product_id;
  const product = products.find((item) => item.id === productId);
  if (!product) return null;
  return (
    <section
      className={"wrap " + styles.featureSection}
      aria-labelledby="featured-title"
      id="produkti-i-kerkuar"
    >
      <div className={styles.heading}>
        <h2 id="featured-title">Produkti më i kërkuar</h2>
      </div>
      <div className={styles.feature}>
        <Media
          className={styles.photo}
          src={product.views?.[1]?.[1] || product.image}
          alt={product.name}
        />
        <div className={styles.featureCopy}>
          <h3>{product.name}</h3>
          <ProductPrice value={product.price} className="detail-price" />
          <p>{product.description}</p>
          <dl className={styles.specs}>
            {product.specs.slice(1).map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <AppLink className="btn btn-dark" to={productUrl(product.id)}>
            Shiko produktin
          </AppLink>
        </div>
      </div>
    </section>
  );
}
