# Apple catalog update

Verified against Apple's official product pages on November 22, 2026. Fourteen additional model/size entries are defined in `src/data/apple2026.js`. Prices are temporary euro amounts for the owner to edit; they are not Apple's advertised prices or a confirmed shop quote.

| Models | Manufacturer source |
| --- | --- |
| iPhone 18 Pro and iPhone 18 Pro Max | [Apple announcement](https://www.apple.com/newsroom/2026/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/), [Apple Store photos](https://www.apple.com/shop/buy-iphone/iphone-18-pro) |
| iPhone Duo | [Apple](https://www.apple.com/iphone-duo/), [Apple Store photos](https://www.apple.com/shop/buy-iphone/iphone-duo) |
| iPhone 17e | [Apple](https://www.apple.com/iphone-17e/), [Apple Store photos](https://www.apple.com/shop/buy-iphone/iphone-17e) |
| iPad Air 11″ / 13″ M4 | [Apple](https://www.apple.com/ipad-air/), [Apple Store photos](https://www.apple.com/shop/buy-ipad/ipad-air) |
| iPad Pro 11″ / 13″ M5 | [Apple](https://www.apple.com/ipad-pro/), [Apple Store photos](https://www.apple.com/shop/buy-ipad/ipad-pro) |
| iPad mini A20 Pro | [Apple](https://www.apple.com/ipad-mini/), [Apple Store photos](https://www.apple.com/shop/buy-ipad/ipad-mini) |
| iPad 11″ A16 | [Apple](https://www.apple.com/ipad-11/), [Apple Store photos](https://www.apple.com/shop/buy-ipad/ipad) |
| Apple Watch Series 12 and Ultra 4 | [Series 12](https://www.apple.com/newsroom/2026/09/introducing-apple-watch-series-12-with-the-all-new-health-sensing-system/), [Ultra 4](https://www.apple.com/newsroom/2026/09/apple-unveils-apple-watch-ultra-4/), [Apple Watch photos](https://www.apple.com/watch/) |
| AirPods 5 | [Apple](https://www.apple.com/airpods-5/), [Apple Store photos](https://www.apple.com/shop/buy-airpods/airpods-5) |
| AirPods Max 2 | [Apple](https://www.apple.com/airpods-max/), [Apple product photos](https://www.apple.com/airpods/) |

Every new local image has a `.webp.json` sidecar with its exact download URL, dimensions and processing. Device shapes, finishes and screens were not generated or retouched. Manufacturer images were optimized and excess outer canvas was cropped. Apple's current iPad shop pages reuse some image filenames dated 2024; these were downloaded from the current M4/M5 listings.

The hero, electronics service panel, category compositions and alternate hero use iPhone 18 Pro Max imagery. The phone-category backdrop uses the original 2160 × 3024 Apple Newsroom photograph, with a 960-pixel-wide mobile variant. Existing iPhone 17 inventory entries remain their actual products, with their own correct photos and prices.

## Database import status

The fourteen records are prepared in `supabase/migrations/202611220001_apple_lineup.sql`; applying this update to the live database still requires an authenticated administrator. Frontend deployment does not apply SQL migrations. The update inserts missing products and preserves existing products, prices and homepage selections. It skips existing names as well as existing IDs, including products previously added through the admin. It can be regenerated with `node scripts/generate-apple-update.mjs`.

The live catalog continues to come from Supabase. Unconfigured previews include the new records. Hero links resolve by product ID or exact model name, so records created with the admin's generated IDs work too; until imported, those links lead to the phone category.
