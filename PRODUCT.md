# ZIPO Mobil Shop

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React, Vite and React Router. Shared components provide the header, footer, product cards, hero, continuous collection, image loading and skeleton states. Navigation styles live in Header.module.css. The production build uses hashed assets.

The production catalog, categories and homepage selections are stored in Supabase and read through CatalogContext. The separate admin.html entry provides email/password sign-in and the product, category and homepage editors. Database row-level security restricts edits to verified allowlisted administrators. The original illustrative records in src/data/catalog.js and public/collection.json remain for unconfigured previews and test fixtures. Store details live in src/data/store.js. Development, deployment and administration are documented in README.md and ADMIN.md.

## Product purpose

Introduce the Pejë shop and let visitors explore phones, electric motorcycles, electric scooters, tablets and accessories, with inquiries handled by WhatsApp. The owner manages the catalog through a private admin account.

## Content

The preview uses Albanian for local shoppers. Models are illustrative. The shop confirms prices and availability directly. Its public profile lists Rr. Mbretëresha Teutë, Pejë and the WhatsApp number +383 44 856 416.

## Brand commitments

A predominantly white storefront, clean product imagery sourced independently of Instagram, a prominent product hero and smooth scrolling transitions.

The established, self-hosted Instrument Sans typography is preserved during palette and control refinements.

The header links to Produktet and Kontakti. Categories are explored from the home page and catalog. Headings use one consistent sans-serif family with plain punctuation. Each page has a visible entrance sequence. Page layouts and headings render immediately, without skeleton screens. Delayed skeletons are limited to catalog product cards, product detail photos and admin product rows; home, contact, category artwork and authentication have none. The public footer has no admin link.

Produktet first opens a category directory. Selecting a category shows its products, with a maximum of 24 products per page. A compact animated disclosure replaces the category chip row. Category pages have no inline search; the header search opens the catalog's general search, which finds products across all categories. Search state and pagination are shareable through URL parameters. Home and catalog category artwork share one component and show representative families of devices. The displayed products remain illustrative pending the owner's inventory.

Category results use a shallow, pale blue banner with the category title and description, plus representative artwork on larger screens. Shared surfaces carry a faint blue tint while white remains dominant. The admin login is minimal and in English. Admin sections and editors share brief, interruptible exit and entrance transitions; controls and save results provide quiet feedback, with a reduced-motion alternative.

## Preview sources

The address and contact details are transcribed from the [shop listing](https://100dyqane.com/dyqan/mobilshopzipo). The product illustrations come from the manufacturers. Image use for the final public storefront should follow the owner's supplier agreements.

- [KuKirin G2](https://kukirinmobility.com/products/kukirin-g2-electric-scooter)
- [NIU NQi Sport](https://global.niu.com/product/nqi-sport)
- [Apple iPhone 17 Pro](https://www.apple.com/newsroom/2025/09/apple-unveils-iphone-17-pro-and-iphone-17-pro-max/)
- [Apple iPhone 15 Pro](https://www.apple.com/shop/refurbished/iphone/iphone-15-pro)
- [Apple iPad Air](https://www.apple.com/shop/buy-ipad/ipad-air)
- [Apple AirPods Pro 3](https://www.apple.com/shop/buy-airpods/airpods-pro-3)
- [Apple Watch SE](https://www.apple.com/shop/buy-watch/apple-watch-se)
- [Apple iPhone 17](https://www.apple.com/shop/buy-iphone/iphone-17)
- [Apple iPhone Air](https://www.apple.com/shop/buy-iphone/iphone-air)
- [OpenStreetMap street geometry for the Pejë map](https://www.openstreetmap.org/way/138470351)
