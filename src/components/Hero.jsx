import { useRef, useState } from "react";
import AppLink from "./AppLink";
import Media from "./Media";
import Icon from "./Icon";
import { useCatalog } from "../data/CatalogContext";
import { catalogUrl, productUrl } from "../data/store";

const slides = [
  {
    title: ["Teknologji", "në lëvizje"],
    type: "ZIPO",
    description:
      "Nga telefonat te lëvizja elektrike. Zbulo pajisjet që i japin ritëm ditës tënde.",
    cta: "Shfleto produktet",
    href: catalogUrl(),
    category: "Pesë kategori",
  },
  {
    title: ["iPhone", "18 Pro Max"],
    type: "18",
    product: "iphone-18-pro-max",
    productName: "iPhone 18 Pro Max",
    image: "phone-18-pro-max-burgundy.webp",
    description:
      "Shiko iPhone 18 Pro Max në Burgundy. Eksploro iPhone dhe modelet e tjera në katalog.",
    cta: "Eksploro telefonat",
    href: catalogUrl("telefona"),
    category: "Telefon",
  },
  {
    title: ["Qyteti me", "energji"],
    type: "NQi",
    product: "niu-nqi-sport",
    description:
      "Dy rrota elektrike për rrugët e përditshme. Zbulo NIU NQi Sport në katalog.",
    cta: "Eksploro motorët",
    href: catalogUrl("motore"),
    category: "Motor elektrik",
  },
];
const stills = [
  ["moto", "moto-niu.webp"],
  ["scooter", "scooter-g2.webp"],
  ["tablet", "tablet-air-blue.webp"],
  ["phone", "phone-18-pro-max-burgundy.webp"],
  ["audio", "audio-airpods-pro-3.webp"],
];
export default function Hero() {
  const { products } = useCatalog();
  const [index, setIndex] = useState(0);
  const touch = useRef(null);
  const slide = slides[index];
  const product = products.find((item) => item.id === slide.product || item.name === slide.productName);
  const step = (amount) =>
    setIndex((current) => (current + amount + slides.length) % slides.length);
  return (
    <section
      className={"hero" + (index ? " is-changing" : "")}
      data-slide={index}
      aria-roledescription="karusel"
      aria-label="Përzgjedhje nga koleksioni"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          step(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
      onTouchStart={(event) => {
        touch.current = [event.touches[0].clientX, event.touches[0].clientY];
      }}
      onTouchEnd={(event) => {
        if (!touch.current) return;
        const dx = event.changedTouches[0].clientX - touch.current[0],
          dy = event.changedTouches[0].clientY - touch.current[1];
        if (Math.abs(dx) > 55 && Math.abs(dx) > 2 * Math.abs(dy))
          step(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <div className="hero-shell">
        <div className="hero-visual" aria-hidden="true">
          <span className="hero-type">{slide.type}</span>
          <div className="hero-shadow" />
          {!product && !slide.image ? (
            <div className="still-life">
              {stills.map(([name, image], i) => (
                <Media
                  key={name}
                  className={"still-piece still-" + name}
                  src={image}
                  eager
                  style={{ "--entrance-order": i }}
                />
              ))}
            </div>
          ) : (
            <Media
              key={product?.id || slide.product}
              className="hero-single"
              src={product?.image || slide.image}
              eager
            />
          )}
        </div>
        <div className="hero-copy" key={index}>
          <h1 id="hero-title">
            {slide.title.map((line) => (
              <span className="headline-line" key={line}>
                <span>{line}</span>
              </span>
            ))}
          </h1>
          <p>{slide.description}</p>
          <div className="hero-actions">
            <AppLink className="btn btn-dark" to={slide.href}>
              {slide.cta}
            </AppLink>
            <AppLink className="hero-secondary" to="/index.html#kategorite">
              Shiko kategoritë
            </AppLink>
          </div>
        </div>
        <div className="slide-controls">
          <button
            className="round-control"
            aria-label="Pamja e mëparshme"
            onClick={() => step(-1)}
          >
            <Icon name="prev" />
          </button>
          <span className="slide-position">
            <b>{String(index + 1).padStart(2, "0")}</b>
            <span className="count-line" />
            03
          </span>
          <button
            className="round-control"
            aria-label="Pamja tjetër"
            onClick={() => step(1)}
          >
            <Icon name="next" />
          </button>
        </div>
        <AppLink
          className="hero-caption"
          to={product ? productUrl(product.id) : catalogUrl()}
        >
          <span className="caption-line" />
          <span>
            <strong>{product?.name || "Koleksioni ZIPO"}</strong>
            <small>{slide.category}</small>
          </span>
        </AppLink>
        <div className="sr-only" aria-live="polite">
          {index ? "Pamja " + (index + 1) + " nga 3. " + product?.name : ""}
        </div>
      </div>
    </section>
  );
}
