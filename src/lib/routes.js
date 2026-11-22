export const pagePaths = {
  home: "/",
  catalog: "/produktet/",
  contact: "/kontakti/",
  faq: "/pyetje/",
  privacy: "/privatesia/",
  admin: "/admin/",
};

export function cleanPath(pathname) {
  if (pathname === "/index.html") return "/";
  for (const path of Object.values(pagePaths)) {
    if (path === "/") continue;
    const stem = path.slice(0, -1);
    if ([stem, stem + ".html", path + "index.html"].includes(pathname))
      return path;
  }
  return pathname;
}

export function pageForPath(pathname) {
  return Object.entries(pagePaths).find(([, path]) => path === cleanPath(pathname))?.[0] || "home";
}

// Keep old bookmarks and password recovery links working without a second request.
export function normalizeAddress() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const path = window.location.pathname.slice(base.length) || "/";
  const clean = cleanPath(path);
  if (clean !== path)
    history.replaceState(history.state, "", base + clean + location.search + location.hash);
}
