import { createContext, useContext, useEffect, useRef, useState } from "react";
import AppLink from "./AppLink";
import { consentKey, readPrivacyChoice, savePrivacyChoice, syncDisplayPreference } from "../lib/privacy";
import styles from "./PrivacyConsent.module.css";

const PrivacyContext = createContext(null);
export const usePrivacy = () => useContext(PrivacyContext);

export function PrivacyProvider({ children }) {
  const [choice, setChoice] = useState(readPrivacyChoice);
  const [open, setOpen] = useState(() => !readPrivacyChoice());
  const [closing, setClosing] = useState(false);
  const dismiss = useRef(null);
  const returnFocus = useRef(null);
  useEffect(() => {
    function changed(event) {
      if (event.key !== consentKey && event.key !== null) return;
      const next = readPrivacyChoice();
      syncDisplayPreference(next?.preferences === true);
      setChoice(next);
      setClosing(false);
      setOpen(!next);
    }
    window.addEventListener("storage", changed);
    return () => { window.removeEventListener("storage", changed); clearTimeout(dismiss.current); };
  }, []);
  function choose(preferences) {
    setChoice(savePrivacyChoice(preferences));
    setClosing(true);
    returnFocus.current?.focus({ preventScroll: true });
    dismiss.current = setTimeout(() => { setOpen(false); setClosing(false); }, 220);
  }
  function showSettings(event) {
    clearTimeout(dismiss.current);
    returnFocus.current = event?.currentTarget || null;
    setClosing(false);
    setOpen(true);
    requestAnimationFrame(() => document.getElementById("privacy-notice-title")?.focus({ preventScroll: true }));
  }
  return (
    <PrivacyContext.Provider value={{ choice, open, closing, choose, showSettings }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export default function PrivacyConsent() {
  const { open, closing, choose } = usePrivacy();
  if (!open) return null;
  return (
    <section className={styles.notice} aria-labelledby="privacy-notice-title" data-closing={closing} inert={closing}>
      <h2 id="privacy-notice-title" tabIndex={-1}>Cookies dhe privatësia</h2>
      <p>Me lejen tuaj, mbajmë mend shfaqjen e hyrjes ZIPO gjatë kësaj vizite. Nuk përdorim cookies reklamash apo analitike.</p>
      <AppLink className={styles.details} to="/privatesia/">Si përdoren të dhënat</AppLink>
      <div className={styles.actions}>
        <button type="button" onClick={() => choose(false)}>Vetëm të nevojshmet</button>
        <button type="button" onClick={() => choose(true)}>Prano preferencat</button>
      </div>
    </section>
  );
}
