import { useState } from "react";
import { supabase, friendlyError } from "./client";
import { Notice, Photo } from "./ui";
import Icon from "../components/Icon";
import styles from "./Admin.module.css";
import { useDirtyForm } from "./useUnsavedChanges";

export default function HomeSettings({
  products,
  categories,
  settings,
  onSaved,
}) {
  const published = products.filter(
    (product) =>
      product.published &&
      categories.some(
        (category) => category.id === product.category && category.active,
      ),
  );
  const [featured, setFeatured] = useState(settings.featured_product_id || "");
  const [selection, setSelection] = useState(() =>
    (settings.collection_product_ids || []).filter((id) =>
      published.some((product) => product.id === id),
    ),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { markSaved } = useDirtyForm({ featured, selection });
  const product = published.find((product) => product.id === featured);
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase
      .from("homepage_settings")
      .update({
        featured_product_id: published.some(
          (product) => product.id === featured,
        )
          ? featured
          : null,
        collection_product_ids: selection
          .filter((id) => published.some((product) => product.id === id))
          .slice(0, 12),
      })
      .eq("id", 1)
      .select()
      .single();
    if (error) {
      setError(friendlyError(error));
      setBusy(false);
    } else {
      markSaved();
      await onSaved();
      setBusy(false);
    }
  }
  return (
    <section className={styles.view}>
      <div className={styles.pageHeading}>
        <div>
          <h1>Ballina</h1>
          <p>Zgjidh produktet që shfaqen në faqen kryesore.</p>
        </div>
      </div>
      <form onSubmit={save}>
        <fieldset disabled={busy} className={styles.fieldset}>
          <section className={styles.formSection}>
            <h2>Produkti më i kërkuar</h2>
            <p className={styles.sectionCopy}>
              Fotoja, detajet dhe butoni lidhen automatikisht me produktin e
              zgjedhur.
            </p>
            <label className={styles.field}>
              Produkti
              <select
                value={featured}
                onChange={(event) => setFeatured(event.target.value)}
              >
                <option value="">Mos e shfaq këtë seksion</option>
                {published.map((product) => (
                  <option value={product.id} key={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            {product && (
              <div className={styles.featurePreview}>
                <div className={styles.tablePhoto}>
                  <Photo src={product.thumbnail || product.image} />
                </div>
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                </div>
              </div>
            )}
          </section>
          <section className={styles.formSection}>
            <h2>
              Nga koleksioni{" "}
              <span className={styles.count}>
                {
                  selection.filter((id) =>
                    published.some((product) => product.id === id),
                  ).length
                }
                /12
              </span>
            </h2>
            <p className={styles.sectionCopy}>
              Zgjidh deri në 12 produkte për rreshtin që lëviz. Pa përzgjedhje,
              seksioni fshihet.
            </p>
            <div className={styles.selectionList}>
              {published.map((product) => (
                <label className={styles.selectionRow} key={product.id}>
                  <input
                    type="checkbox"
                    checked={selection.includes(product.id)}
                    disabled={
                      !selection.includes(product.id) && selection.length >= 12
                    }
                    onChange={(event) =>
                      setSelection(
                        event.target.checked
                          ? [...selection, product.id]
                          : selection.filter((id) => id !== product.id),
                      )
                    }
                  />
                  <div className={styles.tablePhoto}>
                    <Photo src={product.thumbnail || product.image} />
                  </div>
                  <span>{product.name}</span>
                </label>
              ))}
              {!published.length && (
                <p>Publiko një produkt për ta zgjedhur këtu.</p>
              )}
            </div>
          </section>
          <Notice error>{error}</Notice>
          <div className={styles.formActions}>
            <button type="submit" className={styles.primary}>
              {busy ? "Duke ruajtur…" : "Ruaj ballinën"}
              <Icon name="check" />
            </button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
