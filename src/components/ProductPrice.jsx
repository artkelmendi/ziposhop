export const formatPrice = value => new Intl.NumberFormat("sq-XK", {
  style: "currency", currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(Number(value));

export default function ProductPrice({ value, className = "product-price" }) {
  if (value == null || value === "") return null;
  return <p className={className}>{formatPrice(value)}</p>;
}
