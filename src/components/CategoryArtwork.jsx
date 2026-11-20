import Media from "./Media";
import styles from "./CategoryCard.module.css";
import Icon from "./Icon";

export default function CategoryArtwork({ category, className = "" }) {
  const artwork = category.artwork?.length
    ? category.artwork
    : category.image
      ? [category.image]
      : [];
  const known = [
    "telefona",
    "motore",
    "trotineta",
    "tableta",
    "aksesore",
  ].includes(category.id);
  return (
    <div
      className={[
        styles.artwork,
        known ? styles[category.id] : styles.generic,
        className,
      ].join(" ")}
      aria-hidden="true"
    >
      {!artwork.length && (
        <div className={styles.noArtwork}>
          <Icon name="box" />
        </div>
      )}
      {artwork.slice(0, 4).map((image, i) => (
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
