import AppLink from "./AppLink";
export default function Brand() {
  return (
    <AppLink
      className="brand"
      to="/index.html"
      aria-label="ZIPO Mobil Shop — Ballina"
    >
      <span className="wordmark">ZIPO</span>
      <span className="brand-sub">
        MOBIL
        <br />
        SHOP
      </span>
    </AppLink>
  );
}
