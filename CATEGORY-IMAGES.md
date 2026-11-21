# Category banner images

Dedicated category-result backdrops, sourced November 21, 2026. These do not replace the shop's product photos or category-directory artwork. Local WebP files avoid requests to third-party image hosts. Responsive 960px variants serve smaller screens; desktop files retain the source detail up to 3200px, without upscaling. The motorcycle image uses a 3000 × 2000 detail crop from the original; the other images retain their original composition. The banner crops and softens them in CSS.

| Category | Source | Original | Local file |
| --- | --- | --- | --- |
| iPhone & telefona | [Apple iPhone 17 Pro newsroom](https://www.apple.com/newsroom/2025/09/apple-unveils-iphone-17-pro-and-iphone-17-pro-max/), camera close-up image download | 3840 × 2160 | `public/assets/category-telefona.webp` |
| Motorë elektrikë | [NIU NQi Sport](https://global.niu.com/product/nqi-sport), front studio photograph | 8000 × 4500 | `public/assets/category-motore.webp` |
| Trotineta elektrikë | [NIU KQi300](https://global.niu.com/product/KQi-300), handlebar detail | 2106 × 723 | `public/assets/category-trotineta.webp` |
| Tableta | [Apple iPad Air newsroom](https://www.apple.com/newsroom/2025/03/apple-introduces-ipad-air-with-powerful-m3-chip-and-new-magic-keyboard/), hero image download | 3840 × 2160 | `public/assets/category-tableta.webp` |
| Aksesorë | [Apple AirPods Pro 3 newsroom](https://www.apple.com/newsroom/2025/09/introducing-airpods-pro-3-the-ultimate-audio-experience/), hero image download | 2160 × 2160 | `public/assets/category-aksesore.webp` |

NIU originals:

- [NQi Sport studio photo](https://cdn.sanity.io/images/cd9iwvgl/production/c21db0e43ad07d36f8264d81f9c837b2e4840548-8000x4500.jpg)
- [KQi300 handlebar detail](https://cdn.sanity.io/images/cd9iwvgl/production/273737d261c824103956cbdf14c7f02dcbb6733a-2106x723.jpg)

`src/data/categoryBanners.js` maps these assets to the five established category IDs. New categories use their own category image until a dedicated banner is added. Decorative category imagery does not assert product stock; the product list comes from the catalog.
