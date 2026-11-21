export const formatPrice = value => new Intl.NumberFormat("sq-XK", {
  style: "currency", currency: "EUR",
  minimumFractionDigits: Number(value) % 1 ? 2 : 0,
  maximumFractionDigits: 2,
}).format(Number(value));

export default function ProductPrice({ value, className = "product-price" }) {
  if (value == null || value === "") return null;
  return <p className={className}>{formatPrice(value)}</p>;
}
