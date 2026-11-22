# ZIPO Mobil Shop

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React, Vite and React Router. Shared components provide the header, footer, product cards, hero, continuous collection, image loading and skeleton states. Navigation styles live in Header.module.css. The production build uses hashed assets.

The production catalog, categories and homepage selections are stored in Supabase and read through CatalogContext. The separate /admin/ entry provides email/password sign-in and the product, category and homepage editors. Database row-level security restricts edits to verified allowlisted administrators. The initial records in src/data/catalog.js and public/collection.json remain for unconfigured previews and test fixtures. Store details live in src/data/store.js. Development, deployment and administration are documented in README.md and ADMIN.md.

## Product purpose

Introduce the Pejë shop and let visitors explore phones, electric motorcycles, electric scooters, tablets and accessories, with inquiries handled by WhatsApp. The owner manages the catalog through a private admin account.

## Content

The storefront uses Albanian for local shoppers. The nine initial products have temporary euro prices requested by the owner; these are stored in Supabase and editable in the admin. Public product pages do not display illustrative-model notices. The shop confirms availability directly. Its public profile lists Rr. Mbretëresha Teutë, Pejë and the WhatsApp number +383 44 856 416.

Displayed euro prices always include two decimal places. Integer values display as 799.00, and entered cents such as 799.99 are preserved; formatting does not change the saved amount.

## Brand commitments

A predominantly white storefront, clean product imagery sourced independently of Instagram, a prominent product hero and smooth scrolling transitions.

The established, self-hosted Instrument Sans typography is preserved during palette and control refinements.

The studio homepage hero has a subtle interactive blue water texture confined to its side corners, at 52% strength over a near-white surface, fading into white at the bottom. Pointer movement bends the texture; clicks and taps add ripples. It pauses outside the viewport and in hidden tabs, with a static reduced-motion alternative and a light CSS fallback when WebGL is unavailable. The canvas renders an opaque, complete background in one shader pass without CSS masks or opacity layers; resizing clears it to a pale background immediately. The mobile header is solid white, avoiding content bleeding through it during scrolling. Restrained aqua accents appear in the hero action hover, category-link underline, featured-product surface and Instagram icon; white remains dominant. No yellow accents are used.

The hero pairs iPhone 18 Pro Max in Burgundy with iPhone Air in Sky Blue at its original slim size and position. The electronics panel, category compositions, phone-category banner and alternate hero use current iPhone 18 Pro imagery. Fourteen additional Apple model/size entries and an additive database update are prepared; the live database import remains pending administrator sign-in. Sources and deployment/import distinctions are documented in APPLE-PRODUCTS.md. The moving collection has no pause control and continues on hover; the system's reduced-motion preference provides its static alternative.

The header links to Produktet, Pyetje të shpeshta and Kontakti. Categories are explored from the home page and catalog. Headings use one consistent sans-serif family with plain punctuation. Each page has a visible entrance sequence. Page layouts and headings render immediately, without skeleton screens. Delayed skeletons are limited to catalog product cards, product detail photos and admin product rows; home, contact, category artwork and authentication have none. The public footer has no admin link.

Page URLs omit .html through real directory entry points, preserving direct refreshes on GitHub Pages. Old bookmarks normalize without losing search parameters or hashes. Category banner images use dedicated responsive WebPs, selected-image preloading and a decoded-image opacity transition; headings never wait for the photo. Privacy choices are available in a small Albanian notice and the footer. Optional display storage is disabled until accepted, consent or refusal lasts 180 days, and withdrawing consent clears the optional intro-session preference. There are no advertising or analytics scripts. The /privatesia/ page explains browser caching, local storage, hosting services and contact details.

Produktet first opens a category directory. Selecting a category shows its products, with a maximum of 24 products per page. A compact animated disclosure replaces the category chip row. Category pages have no inline search; the header search opens the catalog's general search, which finds products across all categories. Search state and pagination are shareable through URL parameters. Home and catalog category artwork share one component and show representative families of devices. The owner can edit the initial catalog entries and prices in the admin.

Category results use a shallow, pale blue banner with the category title over faint, enlarged product photography on mobile and desktop, without a description. The five main categories have dedicated high-resolution banner assets with smaller responsive files for phones; product and category-card photos remain separate. Image sources are recorded in CATEGORY-IMAGES.md. Custom categories fall back to their uploaded category image or a plain blue surface. Shared surfaces carry a faint blue tint while white remains dominant. The admin login is minimal and in English. Admin sections and editors share brief, interruptible exit and entrance transitions; controls and save results provide quiet feedback, with a reduced-motion alternative.

Homepage scroll reveals start before content enters the viewport. Phone reveals use short, gentle movement without image scaling or clipping, and already-visible sections stay opaque after fast swipes or anchor jumps. Each section reveals once after its content has a measurable layout. The visit map also fades in when its image finishes loading.

Below the featured product, three layered panels present electronics (phones, tablets, smartwatches and accessories), electric motorbikes and scooters, and display/battery repair. The owner corrected the earlier delivery suggestion; no delivery service is advertised. Motorbikes and scooters have separate direct category links. Native sticky panels layer while scrolling; a compact navigation follows the current panel and allows direct selection. Keyboard focus brings covered actions into view. Reduced motion and viewports too short for a complete panel use a normal readable sequence. Repair inquiries use WhatsApp, without invented service prices, timeframes, warranties or authorization claims.

The shared public footer has a pale blue surface, a moderately sized existing ZIPO wordmark and a simple WhatsApp link above the category, location and contact information. Compact vertical spacing keeps it short on mobile and desktop without shrinking the information text. It has no promotional heading. A small return-to-top control restores keyboard focus to the main content. The footer remains after the page content on every route and has no admin link.

The Pyetje të shpeshta page contains six professional Albanian answers, including owner-confirmed product originality, used products and inventory beyond the website. A reusable single-open accordion animates expansion and collapse, supports keyboard interaction and respects reduced motion. Additional answers describe the existing WhatsApp inquiry flow, availability and shop location. No warranty, delivery or payment policy has been invented.

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
