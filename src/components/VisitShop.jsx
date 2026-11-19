import AppLink from "./AppLink";
import Media from "./Media";
import ScrollReveal from "./ScrollReveal";
import { store } from "../data/store";
import styles from "./HomeDiscovery.module.css";

export default function VisitShop() {
  return (
    <section
      className={"wrap " + styles.visit}
      id="vizito-dyqanin"
      aria-labelledby="visit-title"
    >
      <ScrollReveal className={styles.visitCopy}>
        <h2 id="visit-title">Eja t’i shohësh nga afër</h2>
        <p>
          Na vizito në Pejë. Shiko koleksionin dhe pyet për modelin që të
          intereson.
        </p>
        <address>
          {store.address}
          <br />
          {store.city}
        </address>
        <div className={styles.visitActions}>
          <AppLink className="btn btn-dark" to="/kontakti.html">
            Si të na gjesh
          </AppLink>
          <a
            className="section-link"
            href={store.map}
            target="_blank"
            rel="noopener"
          >
            Hap hartën
          </a>
        </div>
      </ScrollReveal>
      <ScrollReveal variant="image" className={styles.map}>
        <Media
          className={styles.mapPhoto}
          src="peje-map.webp"
          alt="Rruga Mbretëresha Teutë dhe qendra e Pejës"
        />
        <small>
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener"
          >
            © OpenStreetMap contributors
          </a>
        </small>
      </ScrollReveal>
    </section>
  );
}
