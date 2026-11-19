"use strict";

// Shared by media, collection-card placeholders and the detail loading layout.
class Skeleton extends HTMLElement {
  connectedCallback() {
    this.setAttribute("aria-hidden", "true");
    if (this.childElementCount) return;
    switch (this.getAttribute("variant")) {
      case "card":
        this.innerHTML =
          '<span class="skeleton-photo"></span><span class="skeleton-label"></span><span class="skeleton-title"></span>';
        break;
      case "detail":
        this.innerHTML =
          '<span class="skeleton-heading"></span><span class="skeleton-copy"></span><span class="skeleton-specs"></span>';
        break;
    }
  }
}
customElements.define("zipo-skeleton", Skeleton);

(() => {
  const pending = new WeakMap();
  const containers =
    ".product-visual,.category-photo,.detail-photo,.still-piece,.hero-single,.contact-map-media";
  function track(img) {
    const host = img.closest(containers);
    if (!host || !img.getAttribute("src")) return;
    pending.get(img)?.();
    host.querySelector(".media-failure")?.remove();
    img.classList.remove("media-unavailable");
    if (img.complete && img.naturalWidth) {
      host.setAttribute("aria-busy", "false");
      return;
    }
    let skeleton;
    let active = true;
    host.setAttribute("aria-busy", "true");
    const timer = setTimeout(() => {
      if (active && host.isConnected) {
        skeleton = document.createElement("zipo-skeleton");
        skeleton.className = "media-skeleton";
        host.append(skeleton);
      }
    }, 200);
    function finish() {
      active = false;
      clearTimeout(timer);
      skeleton?.remove();
      img.removeEventListener("load", loaded);
      img.removeEventListener("error", failed);
      host.setAttribute("aria-busy", "false");
      pending.delete(img);
    }
    function loaded() {
      // Retain the placeholder while a large photo decodes.
      img.decode().then(
        () => {
          if (active) finish();
        },
        () => {
          if (active) failed();
        },
      );
    }
    function failed() {
      finish();
      img.classList.add("media-unavailable");
      const note = document.createElement("span");
      note.className = "media-failure";
      note.textContent = "Foto e padisponueshme";
      host.append(note);
    }
    pending.set(img, finish);
    img.addEventListener("load", loaded);
    img.addEventListener("error", failed);
    if (img.complete) img.naturalWidth ? loaded() : failed();
  }
  function scan(node) {
    if (!(node instanceof Element)) return;
    if (node.matches("img")) track(node);
    else node.querySelectorAll("img").forEach(track);
  }
  new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "attributes") track(record.target);
      else record.addedNodes.forEach(scan);
    }
  }).observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["src"],
  });
  scan(document.body);
})();
