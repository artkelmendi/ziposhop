import { useState } from "react";
import { friendlyError, saveRecord, slugify } from "./client";
import { removeUploads, uploadImages } from "./images";
import ImagePicker from "./ImagePicker";
import { Notice, Photo } from "./ui";
import Icon from "../components/Icon";
import styles from "./Admin.module.css";
import { useDirtyForm } from "./useUnsavedChanges";

export default function CategoryManager({
  categories,
  products,
  onSaved,
  onDelete,
}) {
  const [editing, setEditing] = useState(null);
  return (
    <section className={styles.view}>
      <div className={styles.pageHeading}>
        <div>
          <h1>Kategoritë</h1>
          <p>Organizo produktet dhe pamjen e katalogut.</p>
        </div>
        {!editing && (
          <button className={styles.primary} onClick={() => setEditing({})}>
            <Icon name="plus" /> Shto kategori
          </button>
        )}
      </div>
      {editing ? (
        <CategoryForm
          key={editing.id || "new"}
          category={editing}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onSaved();
          }}
          onDelete={onDelete}
        />
      ) : (
        <div className={styles.categoryList}>
          {categories.map((category) => (
            <div className={styles.categoryRow} key={category.id}>
              <div className={styles.tablePhoto}>
                <Photo src={category.image || category.artwork[0]} />
              </div>
              <div>
                <h2>{category.name}</h2>
                <p>
                  {
                    products.filter(
                      (product) => product.category === category.id,
                    ).length
                  }{" "}
                  produkte{!category.active && " · E fshehur"}
                </p>
              </div>
              <button
                className={styles.secondary}
                aria-label={`Ndrysho kategorinë ${category.name}`}
                onClick={() => setEditing(category)}
              >
                Ndrysho <Icon name="edit" />
              </button>
            </div>
          ))}
          {!categories.length && (
            <div className={styles.empty}>
              <h2>Shto kategorinë e parë</h2>
              <p>Çdo produkt do t’i përkasë një kategorie.</p>
              <button className={styles.primary} onClick={() => setEditing({})}>
                Shto kategori
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function CategoryForm({ category, onCancel, onSaved, onDelete }) {
  const [name, setName] = useState(category.name || "");
  const [description, setDescription] = useState(category.description || "");
  const [active, setActive] = useState(category.active ?? true);
  const [order, setOrder] = useState(category.sort_order || 0);
  const [images, setImages] = useState(() =>
    (category.artwork?.length
      ? category.artwork
      : category.image
        ? [category.image]
        : []
    ).map((url) => ({ url })),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { markSaved, confirmLeave } = useDirtyForm({
    name,
    description,
    active,
    order,
    images: images.map((image) => image.url),
  });
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    let uploaded = [];
    try {
      const result = await uploadImages(images);
      uploaded = result.uploaded;
      await saveRecord(
        "categories",
        {
          id:
            category.id ||
            `${slugify(name) || "kategori"}-${crypto.randomUUID().slice(0, 4)}`,
          name: name.trim(),
          description: description.trim(),
          active,
          sort_order: Number(order),
          image: result.images[0]?.url || "",
          artwork: result.images.map((image) => image.url),
        },
        category.id ? category : null,
      );
      markSaved();
      onSaved();
    } catch (error) {
      await removeUploads(uploaded);
      setError(friendlyError(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className={styles.categoryForm}>
      <fieldset className={styles.fieldset} disabled={busy}>
        <h2>{category.id ? "Ndrysho kategorinë" : "Kategori e re"}</h2>
        <label className={styles.field}>
          Emri i kategorisë
          <input
            required
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
        </label>
        <label className={styles.field}>
          Përshkrimi
          <textarea
            rows={3}
            maxLength={1000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <label className={styles.field}>
          Renditja
          <input
            type="number"
            min="0"
            max="9999"
            step="1"
            value={order}
            onChange={(event) => setOrder(event.target.value)}
          />
          <small className={styles.hint}>
            Numrat më të vegjël shfaqen të parët.
          </small>
        </label>
        <div className={styles.formSection}>
          <h3>Fotot e kategorisë</h3>
          <ImagePicker
            images={images}
            onChange={setImages}
            max={4}
            disabled={busy}
          />
        </div>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
          />
          <span>
            Shfaq në dyqan
            <small>Fshehja e kategorisë fsheh edhe produktet e saj.</small>
          </span>
        </label>
        <Notice error>{error}</Notice>
        <div className={styles.saveBar}>
          <div>
            {category.id && (
              <button
                className={styles.deleteLink}
                type="button"
                onClick={() => onDelete(category)}
              >
                <Icon name="trash" /> Fshije
              </button>
            )}
          </div>
          <div className={styles.formActions}>
            <button
              className={styles.secondary}
              type="button"
              onClick={() => {
                if (confirmLeave()) onCancel();
              }}
            >
              Anulo
            </button>
            <button className={styles.primary} type="submit">
              {busy ? "Duke ruajtur…" : "Ruaj kategorinë"}
            </button>
          </div>
        </div>
      </fieldset>
    </form>
  );
}
