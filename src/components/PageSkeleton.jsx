import Skeleton from "./Skeleton";
export default function PageSkeleton({ page }) {
  if (page === "home")
    return (
      <div
        className="route-skeleton wrap"
        aria-busy="true"
        aria-label="Duke ngarkuar faqen"
      >
        <div className="detail-layout">
          <Skeleton variant="detail" />
          <div className="detail-photo">
            <Skeleton />
          </div>
        </div>
      </div>
    );
  return (
    <div
      className="route-skeleton wrap catalog-main"
      aria-busy="true"
      aria-label="Duke ngarkuar faqen"
    >
      <Skeleton variant="detail" />
      <div className="product-grid">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton variant="card" key={i} />
        ))}
      </div>
    </div>
  );
}
