export default function Skeleton({ variant = "media", className = "" }) {
  return (
    <span
      className={["skeleton", "skeleton-" + variant, className].join(" ")}
      aria-hidden="true"
    >
      {variant === "card" && (
        <>
          <span className="skeleton-photo" />
          <span className="skeleton-label" />
          <span className="skeleton-title" />
        </>
      )}
      {variant === "detail" && (
        <>
          <span className="skeleton-heading" />
          <span className="skeleton-copy" />
          <span className="skeleton-specs" />
        </>
      )}
    </span>
  );
}
