import AppLink from "../components/AppLink";
import Icon from "../components/Icon";
import Media from "../components/Media";
import { store } from "../data/store";
export default function ContactPage() {
  return (
    <div className="wrap contact-page">
      <nav className="breadcrumb" aria-label="Vendndodhja">
        <AppLink to="/">Ballina</AppLink>
        <span>/</span>Kontakti
      </nav>
      <div className="contact-layout">
        <section className="contact-info">
          <h1>
            Na gjen
            <br />
            në Pejë
          </h1>
          <p>
            Për çmimin, ngjyrën ose disponueshmërinë e një modeli, na shkruaj
            ose kalo në dyqan.
          </p>
          <a
            className="btn btn-dark"
            href={store.whatsapp}
            target="_blank"
            rel="noopener"
          >
            <Icon name="message" />
            Na shkruaj në WhatsApp
          </a>
          <dl className="contact-facts">
            <div>
              <dt>Dyqani</dt>
              <dd>
                {store.address}
                <br />
                {store.city}
              </dd>
            </div>
            <div>
              <dt>Telefoni</dt>
              <dd>
                <a href={store.phoneHref}>{store.phone}</a>
              </dd>
            </div>
            <div>
              <dt>Instagram</dt>
              <dd>
                <a href={store.instagram} target="_blank" rel="noopener">
                  @mobilshopzipo
                </a>
              </dd>
            </div>
          </dl>
        </section>
        <section className="contact-map" aria-label="Harta e zonës së dyqanit">
          <Media
            className="contact-map-media"
            src="peje-map.webp"
            alt="Hartë e qendrës së Pejës, në zonën e rrugës Mbretëresha Teutë"
            eager
          />
          <div className="map-caption">
            <div>
              <h2>Pejë</h2>
              <span>{store.address}</span>
            </div>
            <a
              className="btn btn-dark"
              href={store.map}
              target="_blank"
              rel="noopener"
            >
              <Icon name="pin" />
              Hap hartën
            </a>
          </div>
          <small className="map-credit">
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener"
            >
              © OpenStreetMap contributors
            </a>
          </small>
        </section>
      </div>
    </div>
  );
}
