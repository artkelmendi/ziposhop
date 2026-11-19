import AppLink from "./AppLink";
import CategoryArtwork from "./CategoryArtwork";
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
      <CategoryArtwork category={category} />
    </AppLink>
  );
}
