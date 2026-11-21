import Media from "./Media";
import { categoryBanners } from "../data/categoryBanners";
import { imageUrl } from "../lib/backend";
import styles from "./CategoryHeader.module.css";

export default function CategoryHeader({ category }) {
  const banner = categoryBanners[category.id];
  const image = banner?.image || category.image || category.artwork?.[0];
  return (
    <div className={`catalog-top ${styles.banner}`} data-category={category.id}>
      {image && (
        <div className={styles.backdrop} aria-hidden="true">
          <Media
            src={image}
            srcSet={
              banner
                ? `${imageUrl(image.replace(".webp", "-mobile.webp"))} 960w, ${imageUrl(image)} ${banner.width}w`
                : undefined
            }
            sizes={
              banner
                ? "(max-width: 700px) 100vw, (max-width: 1440px) 92vw, 1320px"
                : undefined
            }
            className={styles.photo}
            eager
          />
        </div>
      )}
      <div className={styles.copy}>
        <h1>{category.name}</h1>
      </div>
    </div>
  );
}
