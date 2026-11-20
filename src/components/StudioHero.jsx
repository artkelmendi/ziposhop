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
    id: "ipad-air",
    name: "iPad Air",
    image: "tablet-air-blue.webp",
    category: "tableta",
    position: "tablet",
  },
  {
    id: "iphone-17-pro",
    name: "iPhone 17 Pro",
    image: "phone-17-pro-orange.webp",
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
        {displayProducts.map((product, i) => (
          <AppLink
            key={product.id}
            to={
              products.some((item) => item.id === product.id)
                ? productUrl(product.id)
                : categories.some(
                      (category) => category.id === product.category,
                    )
                  ? catalogUrl(product.category)
                  : catalogUrl()
            }
            className={[styles.product, styles[product.position]].join(" ")}
            style={{ "--order": i }}
            aria-label={
              products.some((item) => item.id === product.id) || demo
                ? "Shiko " + product.name
                : "Shfleto " +
                  (categories.find(
                    (category) => category.id === product.category,
                  )?.name || "produktet")
            }
            data-category={product.category}
          >
            <Media className={styles.photo} src={product.image} eager />
          </AppLink>
        ))}
      </div>
      <AppLink className={styles.browse} to="/index.html#kategorite">
        Eksploro kategoritë
      </AppLink>
    </section>
  );
}
