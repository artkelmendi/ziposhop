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
import { AdminMotionContext, usePanelMotion } from "./useAdminMotion";
import styles from "./Admin.module.css";

export default function AdminApp() {
  const auth = useAdminSession();
  if (auth.checking)
    return (
      <div className={styles.authLoading}>
        <AdminBrand />
        <p role="status" aria-busy="true" aria-label="Duke ngarkuar administrimin">Duke kontrolluar llogarinë…</p>
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
  const { panel, transition } = usePanelMotion(Boolean(catalog));
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [revision, setRevision] = useState(0);
  const [retry, setRetry] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
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
  }, [retry]);
  async function refresh(text = "Ndryshimet u ruajtën.") {
    setRefreshing(true);
    let nextCatalog;
    let refreshError = "";
    try {
      nextCatalog = await loadAdminCatalog();
    } catch {
      refreshError = "Ndryshimi u ruajt, por lista nuk u rifreskua. Provo përsëri.";
    }
    transition(() => {
      if (nextCatalog) setCatalog(nextCatalog);
      setError(refreshError);
      setMessage(text);
      setEditing(null);
      setRevision((value) => value + 1);
      setRefreshing(false);
    }, { scroll: true });
  }
  function navigate(next) {
    if (refreshing) return;
    if (next === view && !editing && !panel.current?.inert) return;
    if (!confirmLeave()) return;
    transition(() => {
      setView(next);
      setEditing(null);
      setMessage("");
    }, { scroll: true });
  }
  function edit(product) {
    transition(() => {
      setMessage("");
      setEditing(product);
    }, { scroll: true });
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
      await refresh("U fshi nga katalogu.");
    } catch (error) {
      setDeleteError(friendlyError(error));
    } finally {
      setDeleting(false);
    }
  }
  async function signOut() {
    if (refreshing) return;
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
    <AdminMotionContext.Provider value={transition}>
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
                disabled={refreshing}
              >
                <Icon name={icon} />
                {label}
              </button>
            ))}
          </nav>
          <a
            className={styles.sidebarStore}
            href={import.meta.env.BASE_URL}
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
                disabled={signingOut || refreshing}
              >
                <Icon name="logout" />
                {signingOut ? "Duke dalë…" : "Dil"}
              </button>
            </div>
          </header>
          <main ref={panel} className={styles.content} id="admin-content">
            <Notice>{message}</Notice>
            {error && (
              <div className={styles.errorBox}>
                <Notice error>{error}</Notice>
                <button
                  className={styles.secondary}
                  onClick={() => setRetry((value) => value + 1)}
                >
                  Provo përsëri
                </button>
              </div>
            )}
            {!catalog ? (
              !error && <>
                <div className={styles.pageHeading}><h1>{navigation.find(item => item[0] === view)?.[2]}</h1></div>
                {view === "products" ? <AdminSkeleton /> : <p role="status" aria-busy="true">Duke ngarkuar…</p>}
              </>
            ) : view === "products" ? (
              editing ? (
                <ProductEditor
                  key={editing.id || "new"}
                  product={editing.id ? editing : null}
                  categories={catalog.categories}
                  onSaved={() => refresh()}
                  onCancel={() => transition(() => setEditing(null), { scroll: true })}
                  onDelete={(product) => {
                    setDeleteError("");
                    setRemoving(product);
                  }}
                />
              ) : (
                <ProductList
                  products={catalog.products}
                  categories={catalog.categories}
                  onEdit={edit}
                  onCreate={() => edit({})}
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
                key={revision}
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
    </AdminMotionContext.Provider>
  );
}
