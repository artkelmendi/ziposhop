import { categories } from "./catalog";
export const store = {
  phone: "+383 44 856 416",
  phoneHref: "tel:+38344856416",
  whatsapp: "https://wa.me/38344856416",
  instagram: "https://www.instagram.com/mobilshopzipo/",
  address: "Rr. Mbretëresha Teutë",
  city: "Pejë, Kosovë",
  map: "https://www.google.com/maps/search/?api=1&query=Mobil+Shop+ZIPO+Rruga+Mbret%C3%ABresha+Teut%C3%AB+Pej%C3%AB",
};
export const catalogUrl = (category) =>
  "/produktet/" +
  (category ? "?kategoria=" + encodeURIComponent(category) : "");
export const productUrl = (id) =>
  "/produktet/?produkt=" + encodeURIComponent(id);
export const categoryName = (id) =>
  categories.find((category) => category.id === id)?.name || "";
