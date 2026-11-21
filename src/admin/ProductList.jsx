import { useState } from "react";
import { Photo } from "./ui";
import Icon from "../components/Icon";
import styles from "./Admin.module.css";

export default function ProductList({
  products,
  categories,
  onEdit,
  onCreate,
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const filtered = products.filter(
    (product) =>
      (!category || category === product.category) &&
      product.name
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / 20));
  const current = Math.min(page, pageCount);
  return (
    <section className={styles.view}>
      <div className={styles.pageHeading}>
        <div>
          <h1>Produktet</h1>
          <p>{products.length} produkte në katalogun tënd.</p>
        </div>
        <button className={styles.primary} onClick={onCreate}>
          <Icon name="plus" /> Shto produkt
        </button>
      </div>
      <div className={styles.toolbar}>
        <label className={styles.search}>
          <Icon name="search" />
          <input
            type="search"
            aria-label="Kërko produkte"
            placeholder="Kërko produkte…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <select
          aria-label="Filtro kategorinë"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
        >
          <option value="">Të gjitha kategoritë</option>
          {categories.map((category) => (
            <option value={category.id} key={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      {filtered.length ? (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Produkti</th>
                  <th className={styles.hideMobile}>Kategoria</th>
                  <th className={styles.hideMobile}>Çmimi</th>
                  <th>Statusi</th>
                  <th>
                    <span className="sr-only">Veprimet</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered
                  .slice((current - 1) * 20, current * 20)
                  .map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className={styles.productCell}>
                          <div className={styles.tablePhoto}>
                            <Photo src={product.thumbnail || product.image} />
                          </div>
                          <div>
                            <button
                              className={styles.productName}
                              onClick={() => onEdit(product)}
                            >
                              {product.name}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className={styles.hideMobile}>
                        {
                          categories.find(
                            (category) => category.id === product.category,
                          )?.name
                        }
                      </td>
                      <td className={styles.hideMobile}>
                        {product.price == null
                          ? "Pyet për çmimin"
                          : new Intl.NumberFormat("sq-XK", {
                              style: "currency",
                              currency: "EUR",
                            }).format(Number(product.price))}
                      </td>
                      <td>
                        <span
                          className={
                            product.published
                              ? styles.statusLive
                              : styles.statusDraft
                          }
                        >
                          {product.published ? "Publikuar" : "Draft"}
                        </span>
                        {!product.available && (
                          <small className={styles.unavailable}>
                            Jo në dispozicion
                          </small>
                        )}
                      </td>
                      <td>
                        <button
                          className={styles.iconButton}
                          aria-label={`Ndrysho ${product.name}`}
                          onClick={() => onEdit(product)}
                        >
                          <Icon name="edit" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className={styles.pagination}>
            <span>
              {filtered.length} rezultate · Faqja {current} / {pageCount}
            </span>
            <div>
              <button
                className={styles.iconButton}
                aria-label="Faqja e mëparshme"
                disabled={current === 1}
                onClick={() => setPage(current - 1)}
              >
                <Icon name="prev" />
              </button>
              <button
                className={styles.iconButton}
                aria-label="Faqja tjetër"
                disabled={current === pageCount}
                onClick={() => setPage(current + 1)}
              >
                <Icon name="next" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.empty}>
          <Icon name="box" />
          <h2>
            {query || category
              ? "Asnjë produkt i gjetur"
              : "Produkti i parë fillon këtu"}
          </h2>
          <p>
            {query || category
              ? "Provo një emër ose kategori tjetër."
              : "Shto fotot dhe detajet për ta sjellë në katalog."}
          </p>
          <button
            className={styles.secondary}
            onClick={
              query || category
                ? () => {
                    setQuery("");
                    setCategory("");
                  }
                : onCreate
            }
          >
            {query || category ? "Pastro filtrat" : "Shto produktin e parë"}
          </button>
        </div>
      )}
    </section>
  );
}
