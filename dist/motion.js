"use strict";

const PageMotion = (() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const main = document.querySelector("main");
  let departure;
  let navigationTimer;
  let recoveryTimer;
  let entranceTimer;
  let awaitingVisibility = false;
  const status = document.createElement("span");
  status.className = "sr-only";
  status.setAttribute("role", "status");
  document.body.append(status);

  function resetNavigation() {
    departure?.cancel();
    clearTimeout(navigationTimer);
    clearTimeout(recoveryTimer);
    delete document.documentElement.dataset.navigationLoading;
    status.textContent = "";
  }

  function enter() {
    resetNavigation();
    clearTimeout(entranceTimer);
    document.body.classList.remove("page-entering");
    if (reduced.matches) return;
    if (document.visibilityState !== "visible") {
      awaitingVisibility = true;
      return;
    }
    awaitingVisibility = false;
    [
      ".category-tile",
      "#product-grid>.product-card",
      ".related .product-card",
      ".still-piece",
    ].forEach((selector) => {
      document.querySelectorAll(selector).forEach((element, index) => {
        element.style.setProperty("--entrance-order", Math.min(index, 6));
      });
    });
    // Restart after a restored history entry and when a background tab becomes visible.
    void main.offsetWidth;
    document.body.classList.add("page-entering");
    entranceTimer = setTimeout(
      () => document.body.classList.remove("page-entering"),
      1500,
    );
  }

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
      (link.target && link.target !== "_self") ||
      link.hasAttribute("download")
    )
      return;
    const destination = new URL(link.href);
    if (
      destination.origin !== location.origin ||
      (destination.pathname === location.pathname &&
        destination.search === location.search)
    )
      return;
    if (reduced.matches || !main.animate) return;
    event.preventDefault();
    resetNavigation();
    document.body.classList.remove("page-entering");
    navigationTimer = setTimeout(() => {
      document.documentElement.dataset.navigationLoading = "";
      status.textContent = "Duke hapur faqen…";
    }, 200);
    departure = main.animate(
      [
        { opacity: 1, transform: "translateY(0) scale(1)" },
        { opacity: 0.35, transform: "translateY(-18px) scale(.985)" },
      ],
      { duration: 260, easing: "cubic-bezier(.4,0,.7,.2)", fill: "forwards" },
    );
    departure.onfinish = () => location.assign(destination.href);
    // Restore the current page if a request is cancelled or cannot navigate.
    recoveryTimer = setTimeout(resetNavigation, 8000);
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) enter();
  });
  document.addEventListener("visibilitychange", () => {
    if (awaitingVisibility && document.visibilityState === "visible") enter();
  });
  reduced.addEventListener("change", () => {
    resetNavigation();
    document.body.classList.remove("page-entering");
  });
  return { enter };
})();
