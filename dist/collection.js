"use strict";

async function initCollection() {
  const viewport = document.querySelector("#featured-grid");
  const section = document.querySelector("#perzgjedhja");
  const motionButton = document.querySelector("#collection-motion");
  let pool = products;
  try {
    const response = await fetch("collection.json", {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Collection unavailable");
    const config = await response.json();
    if (Array.isArray(config.productIds)) {
      const ids = new Set(config.productIds);
      pool = products.filter((product) => ids.has(product.id));
    }
  } catch {
    // A failed configuration request still leaves the catalog available.
  }
  if (!pool.length) {
    section.hidden = true;
    viewport.setAttribute("aria-busy", "false");
    return;
  }
  // Shuffle once per visit. Both halves keep exactly the same ordering.
  const selection = [...pool];
  for (let i = selection.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selection[i], selection[j]] = [selection[j], selection[i]];
  }
  const primary = document.createElement("div");
  primary.className = "collection-group";
  primary.innerHTML = selection.map(productCard).join("");
  const track = document.createElement("div");
  track.className = "collection-track";
  track.append(primary);
  viewport.replaceChildren(track);
  viewport.setAttribute("aria-busy", "false");
  const cardCount = selection.length;
  let lastWidth = -1;
  function sizeLoop() {
    const first = primary.firstElementChild;
    const stride =
      first.getBoundingClientRect().width +
      parseFloat(getComputedStyle(primary).columnGap);
    if (!stride) return;
    const width = viewport.clientWidth;
    if (width === lastWidth) return;
    lastWidth = width;
    primary.querySelectorAll("[data-filler]").forEach((el) => el.remove());
    const repetitions = Math.max(1, Math.ceil(width / (stride * cardCount)));
    for (let i = 1; i < repetitions; i++) {
      for (const product of selection) {
        primary.insertAdjacentHTML("beforeend", productCard(product));
        primary.lastElementChild.dataset.filler = "";
      }
    }
    track.querySelector(".collection-repeat")?.remove();
    const repeat = document.createElement("div");
    repeat.className = "collection-group collection-repeat";
    repeat.innerHTML = selection.map(productCard).join("").repeat(repetitions);
    repeat.setAttribute("aria-hidden", "true");
    track.append(repeat);
    // Preload this small curated set before its cards travel into view.
    track.querySelectorAll("img").forEach((image) => {
      image.loading = "eager";
    });
    track
      .querySelectorAll(".collection-repeat a,[data-filler]")
      .forEach((a) => {
        a.tabIndex = -1;
        a.setAttribute("aria-hidden", "true");
      });
    track.style.setProperty(
      "--loop-duration",
      (stride * cardCount * repetitions) / 34 + "s",
    );
  }
  sizeLoop();
  new ResizeObserver(sizeLoop).observe(viewport);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = reduced.matches;
  function setPaused(value) {
    paused = value;
    section.classList.toggle("is-paused", value);
    motionButton.setAttribute("aria-pressed", String(value));
    motionButton.setAttribute(
      "aria-label",
      value ? "Vazhdo lëvizjen" : "Ndalo lëvizjen",
    );
    motionButton.title = motionButton.getAttribute("aria-label");
    motionButton.innerHTML = icon(value ? "play" : "pause");
    if (!value) viewport.scrollLeft = 0;
  }
  setPaused(paused);
  motionButton.hidden = false;
  motionButton.addEventListener("click", () => setPaused(!paused));
  reduced.addEventListener("change", (e) => setPaused(e.matches));
  primary.addEventListener("focusin", (event) => {
    if (!event.target.matches(":focus-visible")) return;
    if (paused) {
      event.target.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "instant",
      });
      return;
    }
    // Bring keyboard focus into view without stopping the loop.
    const animation = track.getAnimations()[0];
    if (!animation) return;
    const offset = event.target.offsetLeft - primary.offsetLeft;
    const duration = Number(animation.effect.getTiming().duration);
    animation.currentTime =
      (Math.max(0, offset - 12) / primary.offsetWidth) * duration;
    viewport.scrollLeft = 0;
  });
}
