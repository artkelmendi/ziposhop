import Brand from "./Brand";
import AppLink from "./AppLink";
import { store } from "../data/store";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-bottom">
        <Brand />
        <div className="footer-links">
          <AppLink to="/kontakti.html">Kontakti</AppLink>
          <a href={store.phoneHref}>{store.phone}</a>
          <a href={store.instagram} target="_blank" rel="noopener">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
