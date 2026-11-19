import AppLink from "./AppLink";
import Media from "./Media";
import { catalogUrl } from "../data/store";
import styles from "./CategoryCard.module.css";

export default function CategoryCard({ category, compact = false, order = 0 }) {
  return (
    <AppLink
      to={catalogUrl(category.id)}
      aria-label={category.name}
      className={[
        styles.card,
        compact ? styles.compact : styles.feature,
        styles[category.id],
      ].join(" ")}
      style={{ "--entrance-order": order }}
    >
      <div className={styles.copy}>
        <h3>{category.name}</h3>
        {!compact && <p>{category.description}</p>}
      </div>
      <div className={styles.artwork} aria-hidden="true">
        {category.artwork.map((image, i) => (
          <Media
            key={image}
            className={[styles.item, styles["item" + i]].join(" ")}
            src={image}
            eager
          />
        ))}
      </div>
    </AppLink>
  );
}
