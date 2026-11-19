"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const home = document.body.dataset.page === "home";
const params = new URLSearchParams(location.search);
function markNavigation(key) {
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const current = link.dataset.nav === key;
    link.classList.toggle("active", current);
    if (current) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

// The header stays in place as one page departs and the next arrives.
const reducePageMotion = matchMedia("(prefers-reduced-motion: reduce)");
let departure;
document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (
    !link ||
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    link.target === "_blank" ||
    link.hasAttribute("download") ||
    reducePageMotion.matches
  )
    return;
  const destination = new URL(link.href);
  if (
    destination.origin !== location.origin ||
    (destination.pathname === location.pathname &&
      destination.search === location.search)
  )
    return;
  if (!document.querySelector("main").animate) return;
  event.preventDefault();
  departure?.cancel();
  departure = document.querySelector("main").animate(
    [
      { opacity: 1, transform: "translateY(0)" },
      { opacity: 0.82, transform: "translateY(-7px)" },
    ],
    { duration: 145, easing: "cubic-bezier(.4,0,.8,.4)", fill: "forwards" },
  );
  departure.onfinish = () => location.assign(destination.href);
});
function enterPage() {
  departure?.cancel();
  departure = undefined;
  if (!reducePageMotion.matches)
    document.querySelector("main").animate?.(
      [
        { opacity: 0.78, transform: "translateY(11px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 410, easing: "cubic-bezier(.16,1,.3,1)" },
    );
}
enterPage();
window.addEventListener("pageshow", (event) => {
  if (event.persisted) enterPage();
});
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
matchMedia("(min-width:1101px)").addEventListener("change", () =>
  setMenu(false),
);

function initHome() {
  initCollection();
  const slides = [
    {
      product: null,
      title: "Teknologji<br><em>në lëvizje</em>",
      type: "ZIPO",
      category: "Pesë kategori",
      description:
        "Nga telefonat te lëvizja elektrike. Zbulo pajisjet që i japin ritëm ditës tënde.",
      cta: "Shfleto produktet",
      href: catalogUrl(),
    },
    {
      product: "iphone-17-pro",
      title: "iPhone<br><em>17 Pro</em>",
      type: "17",
      category: "Telefon",
      description:
        "Një vështrim nga afër në Cosmic Orange. Eksploro iPhone dhe modelet e tjera në katalog.",
      cta: "Eksploro telefonat",
      href: catalogUrl("telefona"),
    },
    {
      product: "niu-nqi-sport",
      title: "Qyteti me<br><em>energji</em>",
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
    $(".hero-single").hidden = !product;
    $(".still-life").hidden = Boolean(product);
    if (product) $("#hero-image").src = "assets/" + product.image;
    $("#hero-model").textContent = product?.name || "Koleksioni ZIPO";
    $("#hero-category").textContent = entry.category;
    $("#hero-caption").href = product ? productUrl(product.id) : catalogUrl();
    $("#hero-type").textContent = entry.type;
    $("#slide-count").textContent = String(slide + 1).padStart(2, "0");
    if (animate) {
      hero.classList.remove("is-changing");
      void hero.offsetWidth;
      hero.classList.add("is-changing");
      $("#slide-announcement").textContent =
        `Pamja ${slide + 1} nga 3. ${product?.name || "Koleksioni ZIPO"}.`;
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
    document.querySelectorAll(".category-tile").forEach((el) => {
      if (el.getBoundingClientRect().top >= innerHeight) observer.observe(el);
    });
  }
}

function initCatalog() {
  const input = $("#catalog-search");
  let category = params.get("kategoria");
  if (!categories.some((cat) => cat.id === category)) category = "";
  input.value = params.get("q") || "";
  function normalize(value) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }
  function updateResults(changeUrl) {
    markNavigation(category || "catalog");
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
  delete document.documentElement.dataset.detailBoot;
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
  markNavigation(product.category);
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
else if (document.body.dataset.page === "catalog" && params.has("produkt"))
  initDetail(products.find((product) => product.id === params.get("produkt")));
else if (document.body.dataset.page === "catalog") initCatalog();
