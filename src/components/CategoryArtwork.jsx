import Media from "./Media";
import styles from "./CategoryCard.module.css";
import Icon from "./Icon";

// Refresh the original promotional artwork, including categories read from DB.
// Actual iPhone 17 product photos and owner-uploaded category photos stay distinct.
const promotionalImage = (image) => image === "phone-17-pro-orange.webp"
  ? "phone-18-pro-max-burgundy.webp"
  : image;

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
          src={promotionalImage(image)}
          eager
        />
      ))}
    </div>
  );
}
