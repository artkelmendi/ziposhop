import { Fragment, useEffect, useRef, useState } from "react";
import AppLink from "./AppLink";
import Icon from "./Icon";
import Media from "./Media";
import { imageUrl } from "../lib/backend";
import { catalogUrl, store } from "../data/store";
import styles from "./ServicesSection.module.css";

const services = [
  {
    id: "elektronike",
    label: "Elektronikë",
    title: ["Elektronikë"],
    description: "Telefona, tableta, ora inteligjente dhe aksesorë.",
    action: "Shiko produktet",
    to: catalogUrl(),
  },
  {
    id: "levizje",
    label: "Transport elektrik",
    title: ["Transport elektrik"],
    description: "Motorë dhe trotineta elektrike për lëvizjet e përditshme.",
    action: "Motorë elektrikë",
    to: catalogUrl("motore"),
    secondary: { label: "Trotineta elektrike", to: catalogUrl("trotineta") },
  },
  {
    id: "servis",
    label: "Servisim",
    title: ["Servisim"],
    description: "Ndërrim ekrani dhe baterie për telefonin tuaj.",
    action: "Na kontaktoni",
    message: "Përshëndetje ZIPO! Dua të pyes për servisimin e telefonit tim.",
  },
];

function ServiceArtwork({ id }) {
  if (id === "elektronike") {
    return (
      <div className={styles.productScene} aria-hidden="true">
        <Media src="tablet-air-blue.webp" className={styles.tablet} />
        <Media src="phone-18-pro-max-burgundy.webp" className={styles.phone} />
        <Media src="audio-airpods-pro-3.webp" className={styles.audio} />
      </div>
    );
  }
  if (id === "levizje") {
    return (
      <div className={styles.mobilityScene} aria-hidden="true">
        <Media src="moto-niu.webp" className={styles.motor} />
        <Media src="scooter-g2.webp" className={styles.scooter} />
      </div>
    );
  }
  if (id === "servis") {
    return (
      <Media
        src="services/repair.webp"
        srcSet={`${imageUrl("services/repair-mobile.webp")} 800w, ${imageUrl("services/repair.webp")} 1600w`}
        sizes="(max-width: 750px) 90vw, 45vw"
        alt="Punë me kujdes në pjesët e brendshme të një telefoni"
        className={styles.repairPhoto}
      />
    );
  }
  return null;
}

export default function ServicesSection() {
  const root = useRef(null);
  const markers = useRef([]);
  const panels = useRef([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = root.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = false;
    let measure = true;
    let pinTop = 0;
    let heights = [];
    let stacked = false;

    function update() {
      frame = 0;
      if (document.hidden) return;
      if (measure) {
        pinTop = parseFloat(getComputedStyle(markers.current[0]).scrollMarginTop);
        heights = panels.current.map(panel => panel.offsetHeight);
        stacked = !reduced.matches && heights.every(height => height + pinTop + 24 <= innerHeight);
        section.dataset.stacked = String(stacked);
        measure = false;
      }
      if (!visible) return;
      const positions = markers.current.map(marker => marker.getBoundingClientRect().top);
      let current = 0;
      positions.forEach((top, index) => {
        if (top <= pinTop + heights[index] * 0.4) current = index;
      });
      setActive(previous => previous === current ? previous : current);
      panels.current.forEach((panel, index) => {
        const next = positions[index + 1];
        const covered = stacked && next != null
          ? Math.max(0, Math.min(1, (pinTop + heights[index] - next) / heights[index]))
          : 0;
        panel.style.setProperty("--covered", covered.toFixed(4));
      });
    }
    function schedule() {
      if (!visible && !measure) return;
      if (!frame) frame = requestAnimationFrame(update);
    }
    function resize() { measure = true; schedule(); }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
    }, { rootMargin: "150px 0px" });
    observer.observe(section);
    const sizes = new ResizeObserver(resize);
    panels.current.forEach(panel => sizes.observe(panel));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", resize);
    reduced.addEventListener("change", resize);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      sizes.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", resize);
      reduced.removeEventListener("change", resize);
    };
  }, []);

  function showService(index, immediate = false) {
    const pinTop = parseFloat(getComputedStyle(markers.current[index]).scrollMarginTop);
    const top = markers.current[index].getBoundingClientRect().top + scrollY - pinTop;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: immediate || matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  return (
    <section className={`wrap ${styles.section}`} id="sherbimet" ref={root} aria-labelledby="services-title">
      <h2 id="services-title">Çfarë ofrojmë</h2>
      <div className={styles.dock}>
        <nav className={styles.tabs} aria-label="Shërbimet ZIPO" style={{ "--active": active }}>
          <span className={styles.indicator} aria-hidden="true" />
          {services.map((service, index) => (
            <a
              key={service.id}
              href={`#zipo-${service.id}`}
              aria-current={active === index ? "step" : undefined}
              onClick={event => { event.preventDefault(); showService(index); }}
            >
              {service.label}
            </a>
          ))}
        </nav>
      </div>
      <div className={styles.deck}>
        {services.map((service, index) => (
          <Fragment key={service.id}>
            <span
              id={`zipo-${service.id}`}
              className={styles.marker}
              ref={node => { markers.current[index] = node; }}
              aria-hidden="true"
            />
            <article
              className={[styles.panel, styles[service.id]].filter(Boolean).join(" ")}
              aria-labelledby={`service-${service.id}-title`}
              ref={node => { panels.current[index] = node; }}
              style={{ "--layer": index + 1 }}
              onFocusCapture={event => {
                if (event.target.matches(":focus-visible") && active !== index) showService(index, true);
              }}
            >
              <div className={styles.copy}>
                <h3 id={`service-${service.id}-title`}>
                  {service.title.map(line => <span key={line}>{line}</span>)}
                </h3>
                <p>{service.description}</p>
                {service.message ? (
                  <a
                    className={`btn btn-dark ${styles.action}`}
                    href={`${store.whatsapp}?text=${encodeURIComponent(service.message)}`}
                    target="_blank"
                    rel="noopener"
                  >
                    {service.action}<Icon name="arrow" />
                  </a>
                ) : (
                  <div className={styles.actions}>
                    <AppLink className="btn btn-dark" to={service.to}>
                      {service.action}<Icon name="arrow" />
                    </AppLink>
                    {service.secondary && (
                      <AppLink className={styles.secondary} to={service.secondary.to}>
                        {service.secondary.label}<Icon name="arrow" />
                      </AppLink>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.art}><ServiceArtwork id={service.id} /></div>
            </article>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
