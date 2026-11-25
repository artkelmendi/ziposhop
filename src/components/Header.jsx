import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import AppLink from "./AppLink";
import Brand from "./Brand";
import CategoryNav from "./CategoryNav";
import Icon from "./Icon";
import styles from "./Header.module.css";
import { pageForPath } from "../lib/routes";
const links = [
  { to: "/", label: "Ballina", page: "home" },
  { to: "/produktet/", label: "Produktet", page: "catalog" },
  { to: "/pyetje/", label: "Pyetje të shpeshta", page: "faq" },
  { to: "/kontakti/", label: "Kontakti", page: "contact" },
];
export default function Header({ loading }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const header = useRef(null);
  const toggle = useRef(null);
  const current = pageForPath(location.pathname);
  const searchTarget = current === "catalog" &&
    new URLSearchParams(location.search).has("q")
    ? `/produktet/${location.search}#kerko`
    : "/produktet/#kerko";
  useEffect(() => {
    setOpen(false);
  }, [location]);
  useEffect(() => {
    function closeOutside(event) {
      if (!header.current?.contains(event.target)) setOpen(false);
    }
    function escape(event) {
      if (event.key === "Escape" && toggle.current?.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    const desktop = matchMedia("(min-width:751px)");
    const resize = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", escape);
    desktop.addEventListener("change", resize);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", escape);
      desktop.removeEventListener("change", resize);
    };
  }, []);
  function renderLink(link, mobile, order = 0) {
    return (
      <AppLink
        key={link.page}
        to={link.to}
        className={mobile ? styles.mobileLink : styles.desktopLink}
        aria-current={current === link.page ? "page" : undefined}
        style={mobile ? { "--nav-order": order } : undefined}
        onClick={() => setOpen(false)}
      >
        {link.label}
      </AppLink>
    );
  }
  return (
    <header
      className={styles.header}
      ref={header}
      data-loading={loading || undefined}
    >
      <div className={styles.inner}>
        <Brand />
        <nav className={styles.desktopNav} aria-label="Navigimi kryesor">
          {links.slice(1).map((link) => renderLink(link, false))}
        </nav>
        <div className={styles.tools}>
          <AppLink
            to={searchTarget}
            className={styles.iconButton}
            aria-label="Kërko në katalog"
          >
            <Icon name="search" />
          </AppLink>
          <span className={styles.divider} />
          <AppLink to="/kontakti/" className={styles.location}>
            <Icon name="pin" /> Pejë, Kosovë
          </AppLink>
          <button
            ref={toggle}
            type="button"
            className={[styles.iconButton, styles.toggle].join(" ")}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Mbyll menunë" : "Hap menunë"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className={styles.toggleGlyph} aria-hidden="true"><span /><span /></span>
          </button>
        </div>
      </div>
      <CategoryNav onNavigate={() => setOpen(false)} />
      <nav
        id="mobile-nav"
        className={styles.mobileNav}
        aria-label="Navigimi në telefon"
        data-open={open}
        aria-hidden={!open}
        inert={!open}
      >
        {links.map((link, index) => renderLink(link, true, index))}
      </nav>
    </header>
  );
}
