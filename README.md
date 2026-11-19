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
- `src/pages/` contains the home, catalog, product detail and contact views.
- `src/data/catalog.js` contains the illustrative product records and categories. `src/data/store.js` contains the shop details and URL helpers.
- `public/collection.json` selects products for the continuous collection. It is fetched at runtime and shuffled once per home-page visit.
- `public/assets/` contains the product images, map and locally hosted font.
- `src/styles/` contains the storefront design and shared loading styles.
- `build/loading-shell.js` supplies a delayed placeholder before the application bundle loads.

## Navigation and production output

The existing `/index.html`, `/produktet.html` and `/kontakti.html` URLs remain entry points. Category, search and product links use query parameters. React Router handles navigation and browser history after startup.

Vite generates content-hashed script and stylesheet filenames. Every HTML entry points to the same compiled application, so updates to the shared navigation reach every page.

The production host serves `dist/` using `.openai/hosting.json`. The catalog and featured selection are ready to connect to the owner's chosen inventory system.

## Verification

`npm test` builds the production app and runs the browser regression tests in installed Google Chrome. The suite checks consistent menu rows across routes, persistent navigation, resizing, Escape and outside-click behavior, and delayed product images.
