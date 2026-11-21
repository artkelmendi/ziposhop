import AppLink from "./AppLink";
import Media from "./Media";
import { productUrl } from "../data/store";
import { useCatalog } from "../data/CatalogContext";
export default function ProductCard({
  product,
  duplicate = false,
  eager = false,
  order = 0,
  skeleton = false,
}) {
  const { categories } = useCatalog();
  return (
    <AppLink
      className="product-card"
      to={productUrl(product.id)}
      tabIndex={duplicate ? -1 : undefined}
      aria-hidden={duplicate || undefined}
      style={{ "--entrance-order": order }}
    >
      <Media
        className="product-visual"
        src={product.thumbnail || product.image}
        eager={eager}
        skeleton={skeleton}
      />
      <span className="product-label">
        {categories.find((category) => category.id === product.category)?.name}
      </span>
      <h3>{product.name}</h3>
      {product.price != null && (
        <p className="product-price">
          {new Intl.NumberFormat("sq-XK", {
            style: "currency",
            currency: "EUR",
          }).format(Number(product.price))}
        </p>
      )}
    </AppLink>
  );
}
