import Brand from "./Brand";
import AppLink from "./AppLink";
import Icon from "./Icon";
import ScrollReveal from "./ScrollReveal";
import { store } from "../data/store";
import { useCatalog } from "../data/CatalogContext";
import { catalogUrl } from "../data/store";
import { usePrivacy } from "./PrivacyConsent";
import styles from "./Footer.module.css";
export default function Footer() {
  const { categories } = useCatalog();
  const { showSettings } = usePrivacy();
  function backToTop() {
    document.getElementById("kryesore")?.focus({ preventScroll: true });
    window.scrollTo({
      top: 0,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }
  return (
    <footer className={styles.footer} id="footer">
      <ScrollReveal className={`wrap ${styles.outro}`}>
        <div className={styles.signature}><Brand /></div>
        <div>
          <a className={styles.conversation} href={store.whatsapp} target="_blank" rel="noopener">
            <span>Na shkruaj në WhatsApp</span><span className={styles.arrow}><Icon name="arrow" /></span>
          </a>
        </div>
      </ScrollReveal>
      <div className={"wrap " + styles.content}>
        <nav className={styles.links} aria-label="Eksploro dyqanin">
          <h2>Eksploro</h2>
          <div className={styles.categories}>
            <AppLink to="/produktet/">Të gjitha kategoritë</AppLink>
            {categories.map((category) => (
              <AppLink key={category.id} to={catalogUrl(category.id)}>
                {category.name}
              </AppLink>
            ))}
          </div>
        </nav>
        <div className={styles.contact}>
          <h2>Na gjen në Pejë</h2>
          <address>
            {store.address}
            <br />
            {store.city}
          </address>
          <a href={store.map} target="_blank" rel="noopener">
            Hap hartën<Icon name="arrow" />
          </a>
        </div>
        <div className={styles.direct}>
          <h2>Na kontakto</h2>
          <a className={styles.phone} href={store.phoneHref}>{store.phone}</a>
          <a className={styles.social} href={store.instagram} target="_blank" rel="noopener">
            <Icon name="instagram" /><span>Instagram<small>@mobilshopzipo</small></span>
          </a>
        </div>
      </div>
      <div className={"wrap " + styles.bottom}>
        <span>© {new Date().getFullYear()} ZIPO Mobil Shop</span>
        <nav aria-label="Informacion">
          <AppLink to="/kontakti/">Kontakti</AppLink>
          <AppLink to="/pyetje/">Pyetje të shpeshta</AppLink>
          <AppLink to="/privatesia/">Privatësia</AppLink>
          <button type="button" onClick={showSettings}>Cilësimet e cookies</button>
        </nav>
        <button className={styles.backToTop} type="button" onClick={backToTop}>
          Kthehu lart<Icon name="arrow" />
        </button>
      </div>
    </footer>
  );
}
