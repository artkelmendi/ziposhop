import AppLink from "./AppLink";
import Media from "./Media";
import { categoryName, productUrl } from "../data/store";
export default function ProductCard({
  product,
  duplicate = false,
  eager = false,
  order = 0,
}) {
  return (
    <AppLink
      className="product-card"
      to={productUrl(product.id)}
      tabIndex={duplicate ? -1 : undefined}
      aria-hidden={duplicate || undefined}
      style={{ "--entrance-order": order }}
    >
      <Media className="product-visual" src={product.image} eager={eager} />
      <span className="product-label">{categoryName(product.category)}</span>
      <h3>{product.name}</h3>
    </AppLink>
  );
}
