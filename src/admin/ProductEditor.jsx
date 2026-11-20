import { useEffect, useRef, useState } from "react";
import { friendlyError, saveRecord, slugify } from "./client";
import { productImages, removeUploads, uploadImages } from "./images";
import ImagePicker from "./ImagePicker";
import { Notice, Photo } from "./ui";
import Icon from "../components/Icon";
import styles from "./Admin.module.css";
import { useDirtyForm } from "./useUnsavedChanges";

export default function ProductEditor({
  product,
  categories,
  onSaved,
  onCancel,
  onDelete,
}) {
  const [form, setForm] = useState({
    name: product?.name || "",
    category:
      product?.category ||
      categories.find((category) => category.active)?.id ||
      "",
    description: product?.description || "",
    price: product?.price ?? "",
    available: product?.available ?? true,
    published: product?.published ?? false,
    is_demo: product?.is_demo ?? false,
  });
  const [images, setImages] = useState(() => productImages(product));
  const [specs, setSpecs] = useState(
    product?.specs?.length ? product.specs : [["", ""]],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { markSaved, confirmLeave } = useDirtyForm({
    form,
    specs,
    images: images.map((image) => image.url),
  });
  const nameField = useRef(null);
  function update(key, value) {
    setForm((old) => ({ ...old, [key]: value }));
  }
  useEffect(() => {
    nameField.current.focus();
  }, []);
  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || !form.category) {
      setError("Shkruaj emrin dhe zgjidh kategorinë.");
      return;
    }
    if (form.published && !images.length) {
      setError("Shto të paktën një foto përpara publikimit.");
      return;
    }
    if (
      specs.some(
        ([key, value]) => Boolean(key.trim()) !== Boolean(value.trim()),
      )
    ) {
      setError(
        "Plotëso emrin dhe vlerën për çdo specifikim, ose hiqe rreshtin bosh.",
      );
      return;
    }
    setBusy(true);
    let uploaded = [];
    try {
      const result = await uploadImages(images);
      uploaded = result.uploaded;
      const galleryChanged =
        JSON.stringify(result.images.map((image) => image.url)) !==
        JSON.stringify(productImages(product).map((image) => image.url));
      const record = {
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        id:
          product?.id ||
          `${slugify(form.name) || "produkt"}-${crypto.randomUUID().slice(0, 6)}`,
        price: form.price === "" ? null : Number(form.price),
        image: result.images[0]?.url || "",
        thumbnail: result.images[0]?.thumbnail || "",
        images: result.images,
        specs: specs
          .filter(([key, value]) => key.trim() && value.trim())
          .map((pair) => pair.map((value) => value.trim())),
        views: galleryChanged ? null : product?.views || null,
        finishes: galleryChanged ? null : product?.finishes || null,
      };
      await saveRecord("products", record, product);
      markSaved();
      onSaved();
    } catch (error) {
      await removeUploads(uploaded);
      setError(friendlyError(error));
    } finally {
      setBusy(false);
    }
  }
  function cancel() {
    if (confirmLeave()) onCancel();
  }
  return (
    <section className={styles.view}>
      <button className={styles.back} onClick={cancel} disabled={busy}>
        <Icon name="prev" /> Produktet
      </button>
      <div className={styles.pageHeading}>
        <div>
          <h1>{product ? "Ndrysho produktin" : "Produkt i ri"}</h1>
          <p>
            {product
              ? product.name
              : "Shto detajet dhe fotot. Publikoje kur të jetë gati."}
          </p>
        </div>
      </div>
      <form onSubmit={submit}>
        <fieldset className={styles.fieldset} disabled={busy}>
          <div className={styles.editorGrid}>
            <div className={styles.editorFields}>
              <section className={styles.formSection}>
                <h2>Detajet e produktit</h2>
                <label className={styles.field}>
                  Emri i produktit
                  <input
                    ref={nameField}
                    required
                    maxLength={180}
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    placeholder="p.sh. iPhone 17 Pro 256 GB"
                  />
                </label>
                <div className={styles.twoFields}>
                  <label className={styles.field}>
                    Kategoria
                    <select
                      required
                      value={form.category}
                      onChange={(event) =>
                        update("category", event.target.value)
                      }
                    >
                      <option value="" disabled>
                        Zgjidh kategorinë
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                          {category.active ? "" : " (e fshehur)"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span>
                      Çmimi (€){" "}
                      <span className={styles.optional}>Opsional</span>
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="99999999"
                      step="0.01"
                      inputMode="decimal"
                      value={form.price}
                      onChange={(event) => update("price", event.target.value)}
                      placeholder="Pyet për çmimin"
                    />
                  </label>
                </div>
                <label className={styles.field}>
                  Përshkrimi
                  <textarea
                    rows={5}
                    maxLength={6000}
                    value={form.description}
                    onChange={(event) =>
                      update("description", event.target.value)
                    }
                    placeholder="Çfarë duhet të dijë klienti për këtë produkt?"
                  />
                </label>
                {product?.is_demo && (
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={form.is_demo}
                      onChange={(event) =>
                        update("is_demo", event.target.checked)
                      }
                    />
                    <span>
                      Model ilustrues
                      <small>
                        Hiqe shënimin kur zëvendëson shembullin me një produkt
                        real.
                      </small>
                    </span>
                  </label>
                )}
              </section>
              <section className={styles.formSection}>
                <h2>Fotot</h2>
                <ImagePicker
                  images={images}
                  disabled={busy}
                  onChange={(next) => {
                    setImages(next);
                  }}
                />
              </section>
              <section className={styles.formSection}>
                <h2>
                  Specifikimet{" "}
                  <span className={styles.optional}>Opsionale</span>
                </h2>
                {specs.map(([key, value], index) => (
                  <div className={styles.specRow} key={index}>
                    <input
                      aria-label={`Specifikimi ${index + 1}`}
                      maxLength={100}
                      value={key}
                      placeholder="p.sh. Memoria"
                      onChange={(event) => {
                        setSpecs(
                          specs.map((row, i) =>
                            i === index ? [event.target.value, row[1]] : row,
                          ),
                        );
                      }}
                    />
                    <input
                      aria-label={`Vlera ${index + 1}`}
                      maxLength={300}
                      value={value}
                      placeholder="256 GB"
                      onChange={(event) => {
                        setSpecs(
                          specs.map((row, i) =>
                            i === index ? [row[0], event.target.value] : row,
                          ),
                        );
                      }}
                    />
                    <button
                      type="button"
                      className={styles.iconButton}
                      aria-label={`Hiqe specifikimin ${index + 1}`}
                      onClick={() => {
                        setSpecs(specs.filter((_, i) => i !== index));
                      }}
                    >
                      <Icon name="close" />
                    </button>
                  </div>
                ))}
                {specs.length < 20 && (
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => setSpecs([...specs, ["", ""]])}
                  >
                    <Icon name="plus" /> Shto specifikim
                  </button>
                )}
              </section>
            </div>
            <aside className={styles.editorAside}>
              <div className={styles.previewCard}>
                <div className={styles.previewImage}>
                  <Photo src={images[0]?.url} />
                </div>
                <span>
                  {categories.find((category) => category.id === form.category)
                    ?.name || "Kategoria"}
                </span>
                <h3>{form.name || "Emri i produktit"}</h3>
                <p>
                  {form.price !== ""
                    ? new Intl.NumberFormat("sq-XK", {
                        style: "currency",
                        currency: "EUR",
                      }).format(Number(form.price))
                    : "Pyet për çmimin"}
                </p>
              </div>
              <section className={styles.formSection}>
                <h2>Publikimi</h2>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(event) =>
                      update("published", event.target.checked)
                    }
                  />
                  <span>
                    Shfaq në dyqan
                    <small>Kur është joaktive, ruhet si draft.</small>
                  </span>
                </label>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(event) =>
                      update("available", event.target.checked)
                    }
                  />
                  <span>
                    Në dispozicion
                    <small>Klientët mund të pyesin përmes WhatsApp.</small>
                  </span>
                </label>
              </section>
            </aside>
          </div>
          <Notice error>{error}</Notice>
          <div className={styles.saveBar}>
            <div>
              {product && (
                <button
                  type="button"
                  className={styles.deleteLink}
                  onClick={() => onDelete(product)}
                >
                  <Icon name="trash" /> Fshije produktin
                </button>
              )}
            </div>
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.secondary}
                onClick={cancel}
              >
                Anulo
              </button>
              <button type="submit" className={styles.primary}>
                {busy ? "Duke ruajtur…" : "Ruaj produktin"}
                <Icon name="check" />
              </button>
            </div>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
