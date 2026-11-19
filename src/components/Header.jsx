import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import AppLink from "./AppLink";
import Brand from "./Brand";
import Icon from "./Icon";
import styles from "./Header.module.css";
const links = [
  { to: "/index.html", label: "Ballina", page: "home" },
  { to: "/produktet.html", label: "Produktet", page: "catalog" },
  { to: "/kontakti.html", label: "Kontakti", page: "contact" },
];
export default function Header({ loading }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const header = useRef(null);
  const toggle = useRef(null);
  const current =
    location.pathname === "/kontakti.html"
      ? "contact"
      : location.pathname === "/produktet.html"
        ? "catalog"
        : "home";
  useEffect(() => {
    setOpen(false);
  }, [location]);
  useEffect(() => {
    function closeOutside(event) {
      if (!header.current?.contains(event.target)) setOpen(false);
    }
    function escape(event) {
      if (event.key === "Escape") {
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
  function renderLink(link, mobile) {
    return (
      <AppLink
        key={link.page}
        to={link.to}
        className={mobile ? styles.mobileLink : styles.desktopLink}
        aria-current={current === link.page ? "page" : undefined}
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
            to="/produktet.html#kerko"
            className={styles.iconButton}
            aria-label="Kërko në katalog"
          >
            <Icon name="search" />
          </AppLink>
          <span className={styles.divider} />
          <AppLink to="/kontakti.html" className={styles.location}>
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
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
      <nav
        id="mobile-nav"
        className={styles.mobileNav}
        aria-label="Navigimi në telefon"
        hidden={!open}
      >
        {links.map((link) => renderLink(link, true))}
      </nav>
    </header>
  );
}
