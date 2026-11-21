import Skeleton from "./Skeleton";

export default function ProductLoading({ detail = false }) {
  return (
    <div
      className={`products-loading ${detail ? "detail-layout" : "product-grid catalog-grid"}`}
      aria-busy="true"
      aria-label="Duke ngarkuar produktet"
    >
      {detail ? (
        <Skeleton className="detail-photo" />
      ) : Array.from({ length: 4 }, (_, i) => <Skeleton variant="card" key={i} />)}
    </div>
  );
}
