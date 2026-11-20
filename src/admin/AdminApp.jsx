import { useEffect, useState } from "react";
import {
  supabase,
  loadAdminCatalog,
  deleteRecord,
  friendlyError,
} from "./client";
import useAdminSession from "./useAdminSession";
import LoginPage from "./LoginPage";
import ProductList from "./ProductList";
import ProductEditor from "./ProductEditor";
import CategoryManager from "./CategoryManager";
import HomeSettings from "./HomeSettings";
import { AdminBrand, AdminSkeleton, DeleteDialog, Notice } from "./ui";
import Icon from "../components/Icon";
import { UnsavedChangesProvider, useUnsavedChanges } from "./useUnsavedChanges";
import styles from "./Admin.module.css";

export default function AdminApp() {
  const auth = useAdminSession();
  if (auth.checking)
    return (
      <div className={styles.authLoading}>
        <AdminBrand />
        <AdminSkeleton />
      </div>
    );
  if (!auth.session) return <LoginPage />;
  if (!auth.authorized)
    return (
      <div className={styles.authLoading}>
        <AdminBrand />
        <h1>Qasja nuk u konfirmua</h1>
        <Notice error>{auth.error}</Notice>
        <div className={styles.formActions}>
          <button className={styles.secondary} onClick={auth.retry}>
            Provo përsëri
          </button>
          <button
            className={styles.primary}
            onClick={() => supabase.auth.signOut()}
          >
            Dil nga llogaria
          </button>
        </div>
      </div>
    );
  if (auth.needsPassword)
    return (
      <LoginPage
        passwordSetup
        onPasswordSet={() => auth.setNeedsPassword(false)}
      />
    );
  return (
    <UnsavedChangesProvider>
      <Dashboard key={auth.session.user.id} email={auth.session.user.email} />
    </UnsavedChangesProvider>
  );
}

function Dashboard({ email }) {
  const { confirmLeave } = useUnsavedChanges();
  const [view, setView] = useState("products");
  const [editing, setEditing] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [revision, setRevision] = useState(0);
  const [removing, setRemoving] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  useEffect(() => {
    let active = true;
    setError("");
    loadAdminCatalog()
      .then((value) => {
        if (active) setCatalog(value);
      })
      .catch((error) => {
        if (active) setError(friendlyError(error));
      });
    return () => {
      active = false;
    };
  }, [revision]);
  function refresh(text = "Ndryshimet u ruajtën.") {
    setMessage(text);
    setEditing(null);
    setRevision((value) => value + 1);
  }
  function navigate(next) {
    if (!confirmLeave()) return;
    setView(next);
    setEditing(null);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  async function remove() {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteRecord(
        view === "categories" ? "categories" : "products",
        removing.id,
      );
      setRemoving(null);
      refresh("U fshi nga katalogu.");
    } catch (error) {
      setDeleteError(friendlyError(error));
    } finally {
      setDeleting(false);
    }
  }
  async function signOut() {
    if (!confirmLeave()) return;
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError("Dalja nuk u krye. Provo përsëri.");
      setSigningOut(false);
    }
  }
  const navigation = [
    ["products", "box", "Produktet"],
    ["categories", "grid", "Kategoritë"],
    ["home", "home", "Ballina"],
  ];
  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <AdminBrand />
        </div>
        <nav className={styles.navigation} aria-label="Administrimi">
          {navigation.map(([id, icon, label]) => (
            <button
              key={id}
              className={view === id ? styles.navActive : styles.navButton}
              aria-current={view === id ? "page" : undefined}
              onClick={() => navigate(id)}
            >
              <Icon name={icon} />
              {label}
            </button>
          ))}
        </nav>
        <a
          className={styles.sidebarStore}
          href={import.meta.env.BASE_URL + "index.html"}
          target="_blank"
          rel="noopener"
        >
          Shiko dyqanin <Icon name="arrow" />
        </a>
      </aside>
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <span>Administrimi i dyqanit</span>
          <div>
            <span className={styles.email}>{email}</span>
            <button
              className={styles.signOut}
              onClick={signOut}
              disabled={signingOut}
            >
              <Icon name="logout" />
              {signingOut ? "Duke dalë…" : "Dil"}
            </button>
          </div>
        </header>
        <main className={styles.content} id="admin-content">
          <Notice>{message}</Notice>
          {error && (
            <div className={styles.errorBox}>
              <Notice error>{error}</Notice>
              <button
                className={styles.secondary}
                onClick={() => setRevision((value) => value + 1)}
              >
                Provo përsëri
              </button>
            </div>
          )}
          {!catalog ? (
            !error && <AdminSkeleton />
          ) : view === "products" ? (
            editing ? (
              <ProductEditor
                key={editing.id || "new"}
                product={editing.id ? editing : null}
                categories={catalog.categories}
                onSaved={() => refresh()}
                onCancel={() => setEditing(null)}
                onDelete={(product) => {
                  setDeleteError("");
                  setRemoving(product);
                }}
              />
            ) : (
              <ProductList
                products={catalog.products}
                categories={catalog.categories}
                onEdit={setEditing}
                onCreate={() => {
                  setMessage("");
                  setEditing({});
                }}
              />
            )
          ) : view === "categories" ? (
            <CategoryManager
              key={revision}
              {...catalog}
              onSaved={() => refresh()}
              onDelete={(category) => {
                setDeleteError("");
                setRemoving(category);
              }}
            />
          ) : (
            <HomeSettings
              key={JSON.stringify(catalog.settings)}
              {...catalog}
              onSaved={() => refresh()}
            />
          )}
        </main>
      </div>
      {removing && (
        <DeleteDialog
          name={removing.name}
          busy={deleting}
          error={deleteError}
          onCancel={() => setRemoving(null)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}
