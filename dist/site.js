"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const home = document.body.dataset.page === "home";
const params = new URLSearchParams(location.search);
const paths = {
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
const navItems = [
  ["Ballina", "index.html", "home"],
  ["Produktet", "produktet.html", "catalog"],
  ["Kategoritë", home ? "#kategorite" : "index.html#kategorite", "categories"],
  ["Kontakti", "#kontakt", "contact"],
];
const navigation = navItems
  .map(([label, href, page]) => {
    const current = page === document.body.dataset.page;
    return `<a class="nav-link${current ? " active" : ""}" href="${href}"${current ? ' aria-current="page"' : ""}>${label}</a>`;
  })
  .join("");

$("#header").innerHTML = `<div class="header-inner">${brand}
  <nav class="main-nav" aria-label="Navigimi kryesor">${navigation}</nav>
  <div class="header-tools"><a class="icon-btn search-shortcut" href="produktet.html#kerko" aria-label="Kërko në katalog">${icon("search")}</a>
  <span class="tools-divider"></span><a class="location-link" href="#kontakt">${icon("pin")} Pejë, Kosovë</a>
  <button class="icon-btn mobile-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Hap menunë">${icon("menu")}</button></div>
  </div><nav id="mobile-nav" class="mobile-nav" aria-label="Navigimi në telefon" hidden>${navigation}</nav>`;

$("#kontakt").innerHTML = `<div class="wrap"><div class="contact-main">
  <div class="contact-copy"><h2>Na vizito në Pejë<span class="accent">.</span></h2><p>Rr. Mbretëresha Teutë, Pejë, Kosovë</p></div>
  <div class="contact-actions"><a class="btn btn-light" href="${whatsapp}" target="_blank" rel="noopener">${icon("message")} Na shkruaj në WhatsApp</a>
  <a class="map-link" href="${mapUrl}" target="_blank" rel="noopener">${icon("pin")} Hap hartën</a></div></div>
  <div class="footer-bottom">${brand}<div class="footer-links"><a href="tel:+38344856416">+383 44 856 416</a><a href="${instagram}" target="_blank" rel="noopener">Instagram</a></div></div></div>`;

document.querySelectorAll("[data-icon]").forEach((el) => {
  el.innerHTML = icon(el.dataset.icon);
});
const mobileMenu = $("#mobile-nav");
const mobileToggle = $(".mobile-toggle");
function setMenu(open) {
  mobileMenu.hidden = !open;
  mobileToggle.setAttribute("aria-expanded", String(open));
  mobileToggle.setAttribute("aria-label", open ? "Mbyll menunë" : "Hap menunë");
  mobileToggle.innerHTML = icon(open ? "close" : "menu");
}
mobileToggle.addEventListener("click", () => setMenu(mobileMenu.hidden));
mobileMenu.addEventListener("click", () => setMenu(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !mobileMenu.hidden) {
    setMenu(false);
    mobileToggle.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!mobileMenu.hidden && !event.composedPath().includes($("#header")))
    setMenu(false);
});
matchMedia("(min-width:751px)").addEventListener("change", () =>
  setMenu(false),
);

function productCard(product) {
  return `<a class="product-card" href="${productUrl(product.id)}">
    <div class="product-visual"><img loading="lazy" decoding="async" src="assets/${product.image}" alt=""></div>
    <span class="product-label">${categoryName(product.category)}</span><h3>${product.name}</h3></a>`;
}

function initHome() {
  $("#category-grid").innerHTML = categories
    .map(
      (
        cat,
      ) => `<a class="category-tile" data-cat="${cat.id}" href="${catalogUrl(cat.id)}">
    <span class="category-photo"><img decoding="async" src="assets/${cat.image}" alt=""></span>
    <span class="category-name">${cat.name}</span></a>`,
    )
    .join("");
  $("#featured-grid").innerHTML = products
    .slice(0, 4)
    .map(productCard)
    .join("");
  const slides = [
    {
      product: "kukirin-g2",
      title: "Teknologji<br> në lëvizje",
      type: "G2",
      category: "Trotinet elektrik",
      description:
        "Nga telefonat te lëvizja elektrike. Zbulo pajisjet që i japin ritëm ditës tënde.",
      cta: "Shfleto produktet",
      href: catalogUrl(),
    },
    {
      product: "iphone-17-pro",
      title: "iPhone<br> 17 Pro",
      type: "17",
      category: "Telefon",
      description:
        "Një vështrim nga afër në Cosmic Orange. Eksploro iPhone dhe modelet e tjera në katalog.",
      cta: "Eksploro telefonat",
      href: catalogUrl("telefona"),
    },
    {
      product: "niu-nqi-sport",
      title: "Qyteti me<br> energji",
      type: "NQi",
      category: "Motor elektrik",
      description:
        "Dy rrota elektrike për rrugët e përditshme. Zbulo NIU NQi Sport në katalog.",
      cta: "Eksploro motorët",
      href: catalogUrl("motore"),
    },
  ];
  const hero = $(".hero");
  let slide = 0;
  function renderSlide(animate) {
    const entry = slides[slide];
    const product = products.find((item) => item.id === entry.product);
    hero.dataset.slide = String(slide);
    $("#hero-title").innerHTML = entry.title + '<span class="accent">.</span>';
    $("#hero-description").textContent = entry.description;
    $("#hero-primary").href = entry.href;
    $("#hero-primary").textContent = entry.cta;
    $("#hero-image").src = "assets/" + product.image;
    $("#hero-model").textContent = product.name;
    $("#hero-category").textContent = entry.category;
    $("#hero-caption").href = productUrl(product.id);
    $("#hero-type").textContent = entry.type;
    $("#slide-count").textContent = String(slide + 1).padStart(2, "0");
    if (animate) {
      hero.classList.remove("is-changing");
      void hero.offsetWidth;
      hero.classList.add("is-changing");
      $("#slide-announcement").textContent =
        `Pamja ${slide + 1} nga 3. ${product.name}.`;
    }
  }
  const step = (amount) => {
    slide = (slide + amount + slides.length) % slides.length;
    renderSlide(true);
  };
  $("#prev-slide").innerHTML = icon("prev");
  $("#next-slide").innerHTML = icon("next");
  $("#prev-slide").addEventListener("click", () => step(-1));
  $("#next-slide").addEventListener("click", () => step(1));
  hero.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      step(event.key === "ArrowLeft" ? -1 : 1);
    }
  });
  let touchStart;
  hero.addEventListener(
    "touchstart",
    (event) => {
      touchStart = [event.touches[0].clientX, event.touches[0].clientY];
    },
    { passive: true },
  );
  hero.addEventListener(
    "touchend",
    (event) => {
      if (!touchStart) return;
      const dx = event.changedTouches[0].clientX - touchStart[0];
      const dy = event.changedTouches[0].clientY - touchStart[1];
      if (Math.abs(dx) > 55 && Math.abs(dx) > 2 * Math.abs(dy))
        step(dx < 0 ? 1 : -1);
      touchStart = undefined;
    },
    { passive: true },
  );
  renderSlide(false);
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (
        ticking ||
        reducedMotion.matches ||
        window.innerWidth < 751 ||
        scrollY > hero.offsetHeight + 100
      )
        return;
      ticking = true;
      requestAnimationFrame(() => {
        $(".hero-visual").style.setProperty(
          "--parallax",
          Math.min(24, scrollY * 0.06) + "px",
        );
        ticking = false;
      });
    },
    { passive: true },
  );
  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-on-scroll");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(".category-tile,.selection .product-card,.contact-main")
      .forEach((el) => {
        if (el.getBoundingClientRect().top >= innerHeight) observer.observe(el);
      });
  }
}

function initCatalog() {
  const input = $("#catalog-search");
  let category = params.get("kategoria");
  if (!categories.some((cat) => cat.id === category)) category = "";
  input.value = params.get("q") || "";
  const filters = [{ id: "", name: "Të gjitha" }, ...categories];
  $("#filters").innerHTML = filters
    .map(
      (cat) =>
        `<button type="button" class="filter" data-category="${cat.id}">${cat.name}</button>`,
    )
    .join("");
  function normalize(value) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }
  function updateResults(changeUrl) {
    const query = normalize(input.value);
    const results = products.filter(
      (product) =>
        (!category || product.category === category) &&
        normalize(
          product.name +
            " " +
            categoryName(product.category) +
            " " +
            product.specs.flat().join(" "),
        ).includes(query),
    );
    $("#filters")
      .querySelectorAll("button")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.category === category),
        ),
      );
    $("#result-count").textContent =
      results.length + (results.length === 1 ? " produkt" : " produkte");
    $("#product-grid").innerHTML = results.length
      ? results.map(productCard).join("")
      : `<div class="empty-state">
      <h2>Asnjë produkt i gjetur.</h2><p>Provo një emër tjetër ose hiqi filtrat.</p><button class="btn btn-dark" id="reset-filters">Hiqi filtrat</button></div>`;
    if (changeUrl) {
      const url = new URL(location.href);
      url.search = "";
      url.hash = "";
      if (category) url.searchParams.set("kategoria", category);
      if (input.value.trim()) url.searchParams.set("q", input.value.trim());
      history.replaceState(null, "", url);
    }
  }
  $("#filters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    category = button.dataset.category;
    updateResults(true);
  });
  $("#product-grid").addEventListener("click", (event) => {
    if (event.target.id !== "reset-filters") return;
    category = "";
    input.value = "";
    updateResults(true);
    input.focus();
  });
  input.addEventListener("input", () => updateResults(true));
  $("#search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    updateResults(true);
  });
  updateResults(false);
  function focusSearch() {
    if (location.hash === "#kerko") {
      input.focus({ preventScroll: true });
      input.scrollIntoView({ block: "center" });
    }
  }
  window.addEventListener("hashchange", focusSearch);
  $(".search-shortcut").addEventListener("click", (event) => {
    if (!location.search && location.hash === "#kerko") {
      event.preventDefault();
      focusSearch();
    }
  });
  focusSearch();
}

function initDetail(product) {
  $("#catalog-view").hidden = true;
  const view = $("#detail-view");
  view.hidden = false;
  if (!product) {
    document.title = "Modeli nuk u gjet — ZIPO";
    view.innerHTML =
      '<div class="empty-state"><h1>Modeli nuk u gjet.</h1><p>Shfleto modelet e tjera në katalog.</p><a class="btn btn-dark" href="produktet.html">Hap katalogun</a></div>';
    return;
  }
  document.title = product.name + " — ZIPO Mobil Shop";
  const category = categoryName(product.category);
  const alternatives = product.finishes || product.views;
  const options = alternatives
    ? `<div class="image-options" role="group" aria-label="${product.finishes ? "Ngjyra" : "Pamja"}">${alternatives
        .map(
          (option, index) =>
            `<button class="option" data-choice="${index}" aria-pressed="${index === 0}">${product.finishes ? `<span class="swatch" style="background:${option[1]}"></span>` : ""}${option[0]}</button>`,
        )
        .join("")}</div>`
    : "";
  const related = products
    .filter((item) => item.id !== product.id)
    .sort(
      (a, b) =>
        Number(b.category === product.category) -
        Number(a.category === product.category),
    )
    .slice(0, 4);
  view.innerHTML = `<nav class="breadcrumb" aria-label="Vendndodhja"><a href="index.html">Ballina</a><span>/</span><a href="produktet.html">Produktet</a><span>/</span><a href="${catalogUrl(product.category)}">${category}</a></nav>
    <article class="detail-layout"><div class="detail-photo"><img src="assets/${product.image}" alt="${product.name}" id="detail-image"></div>
      <div class="detail-copy"><h1>${product.name}<span class="accent">.</span></h1><p>${product.description}</p>
      ${options}<dl class="detail-specs">${product.specs.map(([key, value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`).join("")}</dl>
      <a class="btn btn-dark" id="product-inquiry" href="${whatsapp}" target="_blank" rel="noopener">${icon("message")} Pyet në WhatsApp</a>
      <p class="catalog-note">Model ilustrues. Kontakto dyqanin për çmimin dhe disponueshmërinë.</p></div></article>
      <section class="related"><div class="section-heading"><h2>Shiko edhe<span class="accent">.</span></h2><a class="section-link" href="produktet.html">Të gjitha produktet</a></div>
      <div class="product-grid">${related.map(productCard).join("")}</div></section>`;
  function choose(index) {
    const option = alternatives?.[index];
    const name =
      product.name + (product.finishes ? " (" + option[0] + ")" : "");
    $("#product-inquiry").href =
      whatsapp +
      "?text=" +
      encodeURIComponent(
        "Përshëndetje ZIPO! Më intereson " +
          name +
          ". A është në dispozicion dhe sa kushton?",
      );
    if (!option) return;
    $("#detail-image").src = "assets/" + option.at(-1);
    $("#detail-image").alt = product.name + " — " + option[0];
    view
      .querySelectorAll("[data-choice]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(Number(button.dataset.choice) === index),
        ),
      );
  }
  choose(0);
  view.addEventListener("click", (event) => {
    const button = event.target.closest("[data-choice]");
    if (button) choose(Number(button.dataset.choice));
  });
}

if (home) initHome();
else if (params.has("produkt"))
  initDetail(products.find((product) => product.id === params.get("produkt")));
else initCatalog();
