import AppLink from "../components/AppLink";
import Accordion from "../components/Accordion";
import Icon from "../components/Icon";
import { questions } from "../data/faq";
import { store } from "../data/store";
import styles from "./FaqPage.module.css";

export default function FaqPage() {
  return (
    <div className={`wrap catalog-main ${styles.page}`}>
      <nav className="breadcrumb" aria-label="Vendndodhja">
        <AppLink to="/index.html">Ballina</AppLink><span>/</span>Pyetje të shpeshta
      </nav>
      <div className="catalog-top">
        <h1>Pyetje të shpeshta</h1>
        <p>Gjithçka që ju duhet të dini përpara se të zgjidhni.</p>
      </div>
      <div className={styles.layout}>
        <div className={styles.help}>
          <p>Keni një pyetje tjetër? Ekipi ynë ju ndihmon të gjeni produktin që kërkoni.</p>
          <a className="btn btn-dark" href={store.whatsapp} target="_blank" rel="noopener">
            <Icon name="message" /> Na shkruani në WhatsApp
          </a>
          <AppLink className="section-link" to="/kontakti.html">Na vizitoni në Pejë <Icon name="arrow" /></AppLink>
        </div>
        <Accordion items={questions} />
      </div>
    </div>
  );
}
