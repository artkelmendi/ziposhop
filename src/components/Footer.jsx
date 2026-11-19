import Brand from "./Brand";
import AppLink from "./AppLink";
import { store } from "../data/store";
import { categories } from "../data/catalog";
import { catalogUrl } from "../data/store";
import styles from "./Footer.module.css";
export default function Footer() {
  return (
    <footer className={styles.footer} id="footer">
      <div className={"wrap " + styles.content}>
        <div className={styles.about}>
          <Brand />
          <p>Telefona, lëvizje elektrike dhe aksesorë në Pejë.</p>
          <a
            className={styles.social}
            href={store.instagram}
            target="_blank"
            rel="noopener"
          >
            @mobilshopzipo
          </a>
        </div>
        <nav className={styles.links} aria-label="Eksploro dyqanin">
          <h2>Eksploro</h2>
          <AppLink to="/produktet.html">Të gjitha kategoritë</AppLink>
          {categories.map((category) => (
            <AppLink key={category.id} to={catalogUrl(category.id)}>
              {category.name}
            </AppLink>
          ))}
        </nav>
        <div className={styles.contact}>
          <h2>Na gjen në Pejë</h2>
          <address>
            {store.address}
            <br />
            {store.city}
          </address>
          <a href={store.phoneHref}>{store.phone}</a>
          <a href={store.whatsapp} target="_blank" rel="noopener">
            Na shkruaj në WhatsApp
          </a>
          <a href={store.map} target="_blank" rel="noopener">
            Hap hartën
          </a>
        </div>
      </div>
      <div className={"wrap " + styles.bottom}>
        <span>© {new Date().getFullYear()} ZIPO Mobil Shop</span>
        <AppLink to="/kontakti.html">Kontakti</AppLink>
      </div>
    </footer>
  );
}
