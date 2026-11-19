import Media from "./Media";
import styles from "./CategoryCard.module.css";

export default function CategoryArtwork({ category, className = "" }) {
  return (
    <div
      className={[styles.artwork, styles[category.id], className].join(" ")}
      aria-hidden="true"
    >
      {category.artwork.map((image, i) => (
        <Media
          key={image}
          className={[styles.item, styles["item" + i]].join(" ")}
          src={image}
          eager
        />
      ))}
    </div>
  );
}
