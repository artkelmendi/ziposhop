import { categoryBanners } from "../data/categoryBanners";
import { imageUrl } from "./backend";

export const bannerSizes = "(max-width: 700px) 90vw, (max-width: 1680px) 90vw, 1512px";

export function bannerSources(banner) {
  return banner.widths.map(width => `${imageUrl(`${banner.stem}-${width}.webp`)} ${width}w`).join(", ");
}

// Preload only the selected destination, never all category photographs.
export function preloadCategoryImage(to) {
  if (typeof to !== "string") return;
  const destination = new URL(to, window.location.href);
  if (!/\/produktet(?:\.html|\/)?$/.test(destination.pathname)) return;
  const id = destination.searchParams.get("kategoria");
  const banner = Object.hasOwn(categoryBanners, id) ? categoryBanners[id] : null;
  if (!banner || destination.searchParams.has("produkt") || destination.searchParams.has("q")) return;
  if (document.head.querySelector(`link[data-category-preload="${id}"]`)) return;
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = imageUrl(banner.image);
  link.imageSrcset = bannerSources(banner);
  link.imageSizes = bannerSizes;
  link.fetchPriority = "high";
  link.dataset.categoryPreload = id;
  document.head.append(link);
}
