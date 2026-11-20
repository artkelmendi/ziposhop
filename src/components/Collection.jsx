import { useEffect, useRef, useState } from "react";
import AppLink from "./AppLink";
import ProductCard from "./ProductCard";
import Skeleton from "./Skeleton";
import Icon from "./Icon";
import { products } from "../data/catalog";

export default function Collection() {
  const [selection, setSelection] = useState(null);
  const [paused, setPaused] = useState(
    () => matchMedia("(prefers-reduced-motion:reduce)").matches,
  );
  const [repetitions, setRepetitions] = useState(1);
  const [duration, setDuration] = useState(65);
  const viewport = useRef(null);
  const group = useRef(null);
  const track = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let active = true;
    async function load() {
      let pool = products;
      try {
        const response = await fetch(import.meta.env.BASE_URL + "collection.json", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Collection unavailable");
        const config = await response.json();
        if (Array.isArray(config.productIds))
          pool = products.filter((product) =>
            config.productIds.includes(product.id),
          );
      } catch {
        /* Keep the local assortment available after a failed request. */
      }
      clearTimeout(timeout);
      if (!active) return;
      const shuffled = [...pool];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setSelection(shuffled);
    }
    load();
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion:reduce)");
    const change = () => setPaused(reduced.matches);
    reduced.addEventListener("change", change);
    return () => reduced.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    if (!selection?.length) return;
    function resize() {
      const card = group.current?.firstElementChild;
      if (!card) return;
      const stride =
        card.getBoundingClientRect().width +
        parseFloat(getComputedStyle(group.current).columnGap);
      const count = Math.max(
        1,
        Math.ceil(viewport.current.clientWidth / (stride * selection.length)),
      );
      setRepetitions(count);
      setDuration((stride * selection.length * count) / 34);
    }
    const observer = new ResizeObserver(resize);
    observer.observe(viewport.current);
    resize();
    return () => observer.disconnect();
  }, [selection]);
  if (selection?.length === 0) return null;
  const cards = selection
    ? Array.from({ length: paused ? 1 : repetitions }, () => selection).flat()
    : [];
  return (
    <section
      className={"selection" + (paused ? " is-paused" : "")}
      id="perzgjedhja"
      aria-labelledby="selection-title"
    >
      <div className="wrap">
        <div className="section-heading">
          <h2 id="selection-title">Nga koleksioni</h2>
          <div className="collection-actions">
            {selection && (
              <button
                className="round-control"
                id="collection-motion"
                aria-label={paused ? "Vazhdo lëvizjen" : "Ndalo lëvizjen"}
                aria-pressed={paused}
                onClick={() => {
                  setPaused((value) => !value);
                  viewport.current.scrollLeft = 0;
                }}
              >
                <Icon name={paused ? "play" : "pause"} />
              </button>
            )}
            <AppLink className="section-link" to="/produktet.html">
              Hap katalogun <Icon name="grid" />
            </AppLink>
          </div>
        </div>
        <div
          className="collection-window"
          id="featured-grid"
          ref={viewport}
          aria-busy={!selection}
        >
          {!selection ? (
            <div className="collection-placeholder">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton variant="card" key={i} />
              ))}
            </div>
          ) : (
            <div
              className="collection-track"
              ref={track}
              style={{ "--loop-duration": duration + "s" }}
            >
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  className={
                    "collection-group" + (copy ? " collection-repeat" : "")
                  }
                  ref={!copy ? group : undefined}
                  aria-hidden={copy ? true : undefined}
                  onFocus={(event) => {
                    if (copy || !event.target.matches(":focus-visible")) return;
                    if (paused) {
                      event.target.scrollIntoView({
                        block: "nearest",
                        inline: "nearest",
                      });
                      return;
                    }
                    const animation = track.current.getAnimations()[0];
                    if (animation)
                      animation.currentTime =
                        (Math.max(
                          0,
                          event.target.offsetLeft -
                            group.current.offsetLeft -
                            12,
                        ) /
                          group.current.offsetWidth) *
                        duration *
                        1000;
                    viewport.current.scrollLeft = 0;
                  }}
                >
                  {cards.map((product, i) => (
                    <ProductCard
                      key={product.id + "-" + i}
                      product={product}
                      eager
                      duplicate={!!copy || i >= selection.length}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="catalog-note">
          Modele ilustruese. Pyet dyqanin për çmimin dhe disponueshmërinë.
        </p>
      </div>
    </section>
  );
}
