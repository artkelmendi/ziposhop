import { useEffect, useRef } from "react";
import Skeleton from "../components/Skeleton";
import Icon from "../components/Icon";
import Media from "../components/Media";
import { useUnsavedChanges } from "./useUnsavedChanges";
import styles from "./Admin.module.css";

export function AdminBrand() {
  const { confirmLeave } = useUnsavedChanges();
  return (
    <a
      className="brand"
      href={import.meta.env.BASE_URL}
      aria-label="ZIPO Mobil Shop — Ballina"
      onClick={(event) => {
        if (!confirmLeave()) event.preventDefault();
      }}
    >
      <span className="wordmark">ZIPO</span>
      <span className="brand-sub">
        MOBIL
        <br />
        SHOP
      </span>
    </a>
  );
}
export function Notice({ children, error = false }) {
  if (!children) return null;
  return (
    <p
      className={error ? styles.error : styles.notice}
      role={error ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
export function AdminSkeleton({ editor = false }) {
  return (
    <div
      className={styles.loading}
      aria-busy="true"
      aria-label="Duke ngarkuar administrimin"
    >
      {Array.from({ length: editor ? 4 : 6 }, (_, i) => (
        <div className={styles.skeletonRow} key={i}>
          <Skeleton className={styles.skeletonImage} />
          <Skeleton className={styles.skeletonText} />
        </div>
      ))}
    </div>
  );
}
export function Photo({ src, alt = "", className = "" }) {
  return src ? (
    <Media
      className={styles.photoFrame + " " + className}
      src={src}
      alt={alt}
    />
  ) : (
    <span className={styles.noPhoto}>
      <Icon name="image" />
    </span>
  );
}
export function DeleteDialog({ name, busy, error, onCancel, onConfirm }) {
  const dialog = useRef(null);
  useEffect(() => {
    const node = dialog.current;
    const previous = document.activeElement;
    node.showModal();
    return () => {
      node.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="delete-title"
      onCancel={(event) => {
        if (busy) event.preventDefault();
        else onCancel();
      }}
    >
      <h2 id="delete-title">Fshije “{name}”?</h2>
      <p>Ky veprim e heq nga katalogu dhe nuk mund të zhbëhet.</p>
      <Notice error>{error}</Notice>
      <div className={styles.formActions}>
        <button
          className={styles.secondary}
          onClick={onCancel}
          disabled={busy}
          autoFocus
        >
          Anulo
        </button>
        <button className={styles.danger} onClick={onConfirm} disabled={busy}>
          {busy ? "Duke fshirë…" : "Fshije"}
        </button>
      </div>
    </dialog>
  );
}
