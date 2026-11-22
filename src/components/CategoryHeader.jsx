import Media from "./Media";
import { categoryBanners } from "../data/categoryBanners";
import { bannerSources, bannerSizes } from "../lib/categoryImages";
import styles from "./CategoryHeader.module.css";

export default function CategoryHeader({ category }) {
  const banner = Object.hasOwn(categoryBanners, category.id) ? categoryBanners[category.id] : null;
  const image = banner?.image || category.image || category.artwork?.[0];
  return (
    <div className={`catalog-top ${styles.banner}`} data-category={category.id}>
      {image && (
        <div className={styles.backdrop} aria-hidden="true">
          <Media
            src={image}
            srcSet={banner ? bannerSources(banner) : undefined}
            sizes={banner ? bannerSizes : undefined}
            className={styles.photo}
            eager
            fetchPriority="high"
          />
        </div>
      )}
      <div className={styles.copy}>
        <h1>{category.name}</h1>
      </div>
    </div>
  );
}
