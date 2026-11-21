import CategoryArtwork from "./CategoryArtwork";
import styles from "./CategoryHeader.module.css";

export default function CategoryHeader({ category }) {
  return (
    <div className={`catalog-top ${styles.banner}`}>
      <div className={styles.copy}>
        <h1>{category.name}</h1>
        {category.description && <p>{category.description}</p>}
      </div>
      <CategoryArtwork category={category} className={styles.artwork} />
    </div>
  );
}
