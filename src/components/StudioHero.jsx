import HeroAmbience from "./HeroAmbience";
import AppLink from "./AppLink";
import Media from "./Media";
import { catalogUrl, productUrl } from "../data/store";
import styles from "./StudioHero.module.css";
import { useCatalog } from "../data/CatalogContext";

const displayProducts = [
  {
    id: "niu-nqi-sport",
    name: "NIU NQi Sport",
    image: "moto-niu.webp",
    category: "motore",
    position: "moto",
  },
  {
    id: "kukirin-g2",
    name: "KuKirin G2",
    image: "scooter-g2.webp",
    category: "trotineta",
    position: "scooter",
  },
  {
    id: "ipad-air-m4-11",
    name: "iPad Air 11″ M4",
    image: "tablet-air-blue.webp",
    category: "tableta",
    position: "tablet",
  },
  {
    id: "iphone-18-pro-max",
    name: "iPhone 18 Pro Max",
    finish: "Burgundy",
    image: "phone-18-pro-max-burgundy.webp",
    category: "telefona",
    position: "phone",
  },
  {
    id: "iphone-air",
    name: "iPhone Air",
    image: "phone-air-blue.webp",
    category: "telefona",
    position: "air",
  },
  {
    id: "watch-se-3",
    name: "Apple Watch SE 3",
    image: "watch-se-3.webp",
    category: "aksesore",
    position: "watch",
  },
  {
    id: "airpods-pro-3",
    name: "AirPods Pro 3",
    image: "audio-airpods-pro-3.webp",
    category: "aksesore",
    position: "audio",
  },
];

export default function StudioHero() {
  const { products, categories, demo } = useCatalog();
  return (
    <section className={styles.hero} aria-label="Zbulo koleksionin ZIPO">
      <HeroAmbience />
      <div className={styles.intro}>
        <h1 className={styles.title}>
          <span>Për çdo ditë</span>
          <span>Për çdo lëvizje</span>
        </h1>
        <p>Telefona, lëvizje elektrike dhe pajisje për ritmin tënd.</p>
        <AppLink className="btn btn-dark" to={catalogUrl()}>
          Zbulo produktet
        </AppLink>
      </div>
      <div className={styles.stage}>
        <div className={styles.ground} aria-hidden="true" />
        {displayProducts.map((product, i) => {
          const record = products.find(
            (item) => item.id === product.id || item.name === product.name,
          );
          const category = categories.find((item) => item.id === product.category);
          return (
            <AppLink
              key={product.position}
              to={
                record
                  ? productUrl(record.id)
                  : category
                    ? catalogUrl(product.category)
                    : catalogUrl()
              }
              className={[styles.product, styles[product.position]].join(" ")}
              style={{ "--order": i }}
              aria-label={
                record || demo
                  ? "Shiko " + product.name + (product.finish ? " — " + product.finish : "")
                  : "Shfleto " + (category?.name || "produktet")
              }
              data-category={product.category}
            >
              <Media className={styles.photo} src={product.image} eager />
            </AppLink>
          );
        })}
      </div>
      <AppLink className={styles.browse} to="/index.html#kategorite">
        Eksploro kategoritë
      </AppLink>
    </section>
  );
}
