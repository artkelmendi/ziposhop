"use strict";

const paths = {
  pause: '<path d="M8 5v14M16 5v14" stroke-width="2.5"/>',
  play: '<path d="m8 5 10 7-10 7z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.3"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/>',
  menu: '<path d="M3 8h18M3 16h18"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  prev: '<path d="m14.5 5.5-6 6.5 6 6.5"/>',
  next: '<path d="m9.5 5.5 6 6.5-6 6.5"/>',
  message:
    '<path d="M20.5 11.5A8.5 8.5 0 0 1 8.2 19l-4.7 1.5L5 15.8a8.5 8.5 0 1 1 15.5-4.3Z"/><path d="M8.8 8.2c.9 3.5 2.7 5.4 6.4 6.8"/>',
};
const icon = (name) =>
  `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name]}</svg>`;
const categoryName = (id) => categories.find((item) => item.id === id).name;
const catalogUrl = (id) =>
  "produktet.html" + (id ? "?kategoria=" + encodeURIComponent(id) : "");
const productUrl = (id) => "produktet.html?produkt=" + encodeURIComponent(id);
const whatsapp = "https://wa.me/38344856416";
const mapUrl =
  "https://www.google.com/maps/search/?api=1&query=Mobil+Shop+ZIPO+Rruga+Mbret%C3%ABresha+Teut%C3%AB+Pej%C3%AB";
const instagram = "https://www.instagram.com/mobilshopzipo/";
const brand = `<a class="brand" href="index.html" aria-label="ZIPO Mobil Shop — Ballina"><span class="wordmark">ZIPO</span><span class="brand-sub">MOBIL<br>SHOP</span></a>`;

function storeNavigation(current) {
  const links = [
    ["catalog", "Produktet", catalogUrl()],
    ["contact", "Kontakti", "kontakti.html"],
  ];
  return links
    .map(
      ([key, label, href]) =>
        `<a data-nav="${key}" class="nav-link${key === current ? " active" : ""}" href="${href}"${key === current ? ' aria-current="page"' : ""}>${label}</a>`,
    )
    .join("");
}

function headerMarkup(page) {
  const nav = storeNavigation(page);
  return `<div class="header-inner">${brand}
    <nav class="main-nav" aria-label="Navigimi kryesor">${nav}</nav>
    <div class="header-tools"><a class="icon-btn search-shortcut" href="produktet.html#kerko" aria-label="Kërko në katalog">${icon("search")}</a>
    <span class="tools-divider"></span><a class="location-link" href="kontakti.html">${icon("pin")} Pejë, Kosovë</a>
    <button class="icon-btn mobile-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Hap menunë">${icon("menu")}</button></div></div>
    <nav id="mobile-nav" class="mobile-nav" aria-label="Navigimi në telefon" hidden><a href="index.html">Ballina</a>${nav}</nav>`;
}

function footerMarkup() {
  return `<div class="wrap footer-bottom">${brand}<div class="footer-links"><a href="kontakti.html">Kontakti</a><a href="tel:+38344856416">+383 44 856 416</a><a href="${instagram}" target="_blank" rel="noopener">Instagram</a></div></div>`;
}

function categoryTiles() {
  return categories
    .map(
      (cat) =>
        `<a class="category-tile" data-cat="${cat.id}" href="${catalogUrl(cat.id)}"><span class="category-photo"><img decoding="async" src="assets/${cat.image}" alt=""></span><span class="category-name">${cat.name}</span></a>`,
    )
    .join("");
}

function filterMarkup() {
  return [{ id: "", name: "Të gjitha" }, ...categories]
    .map(
      (cat) =>
        `<button type="button" class="filter" data-category="${cat.id}" aria-pressed="${!cat.id}">${cat.name}</button>`,
    )
    .join("");
}

function productCard(product) {
  return `<a class="product-card" href="${productUrl(product.id)}">
    <div class="product-visual"><img loading="lazy" decoding="async" src="assets/${product.image}" alt=""></div>
    <span class="product-label">${categoryName(product.category)}</span><h3>${product.name}</h3></a>`;
}
