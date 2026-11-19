# ZIPO storefront

The storefront runs on React, Vite and React Router. The home, catalog, product detail and contact views share one application layout and header.

## Run locally

Install dependencies with `npm ci`, then run `npm run dev`. Open `http://127.0.0.1:4173/`.

`npm run build` generates `dist/`. `npm run preview` serves that build on the same port. Run one server on port 4173 at a time.

## Source structure

- `src/App.jsx` owns routing, page transitions and the persistent layout.
- `src/components/Header.jsx` and `Header.module.css` own all desktop and mobile navigation. Desktop and mobile links use distinct scoped classes.
- `src/components/Media.jsx` and `Skeleton.jsx` handle loading, image decoding and unavailable images. Skeletons appear after 200 milliseconds.
- `src/components/Hero.jsx`, `Collection.jsx`, `ProductCard.jsx`, `Brand.jsx` and `Footer.jsx` provide shared storefront components.
- `src/components/CategoryCard.jsx` and its scoped stylesheet provide the shared product compositions for the home page and category directory.
- `src/components/ScrollReveal.jsx` adds a single viewport entrance to home sections. It leaves content visible by default, disconnects after its first intersection, and respects reduced-motion preferences.
- VisitShop.jsx provides the Pejë map and links to the contact page.
- `src/pages/` contains the home, catalog, product detail and contact views.
- `src/data/catalog.js` contains the illustrative product records and categories. `src/data/store.js` contains the shop details and URL helpers.
- `src/data/homeContent.js` selects the featured product. The Instagram section links directly to the profile configured in store.js.

- `public/collection.json` selects products for the continuous collection. It is fetched at runtime and shuffled once per home-page visit.
- `public/assets/` contains the product images, map and locally hosted font.
- `src/styles/` contains the storefront design and shared loading styles.
- `build/loading-shell.js` supplies a delayed placeholder before the application bundle loads.

`FeaturedProduct` accepts a `productId` prop so the future admin-backed homepage settings can supply its selection. The image, description, specifications and “Shiko produktin” destination all resolve from that same ID. The current preview defaults to `featuredProductId` in `src/data/homeContent.js`.

## Navigation and production output

The existing `/index.html`, `/produktet.html` and `/kontakti.html` URLs remain entry points. Category, search and product links use query parameters. React Router handles navigation and browser history after startup.

The default home page uses the unified product display in `StudioHero.jsx`. The previous hero remains available at `/index.html?hero=classic` through the original `Hero.jsx`. The Git tag `design/home-classic-2026-11-19` preserves the full source state before this alternative.

Produktet opens the category directory. Selecting a category opens its products using `?kategoria=telefona` and equivalent category IDs. Search applies within that category, and product lists paginate at 24 items using `faqja`. Category changes have their own route entry so their headings and products animate on navigation and browser back.

Vite generates content-hashed script and stylesheet filenames. Every HTML entry points to the same compiled application, so updates to the shared navigation reach every page.

The production host serves `dist/` using `.openai/hosting.json`. The catalog and featured selection are ready to connect to the owner's chosen inventory system.

## Verification

`npm test` builds the production app and runs the browser regression tests in installed Google Chrome. The suite checks consistent menu rows across routes, persistent navigation, resizing, Escape and outside-click behavior, and delayed product images.
