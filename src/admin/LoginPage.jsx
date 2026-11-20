import { useState } from "react";
import { supabase } from "./client";
import { AdminBrand, Notice } from "./ui";
import Icon from "../components/Icon";
import { imageUrl } from "../lib/backend";
import styles from "./Admin.module.css";

export default function LoginPage({ passwordSetup = false, onPasswordSet }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!supabase) return;
    if (passwordSetup && password !== confirm) {
      setError("Fjalëkalimet nuk përputhen.");
      return;
    }
    setBusy(true);
    try {
      const result = passwordSetup
        ? await supabase.auth.updateUser({ password })
        : await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
      if (result.error) {
        setError(
          passwordSetup
            ? "Fjalëkalimi nuk u ruajt. Përdor të paktën 10 karaktere dhe provo përsëri."
            : result.error.status === 429
              ? "Shumë përpjekje. Prit pak dhe provo përsëri."
              : "Emaili ose fjalëkalimi nuk është i saktë.",
        );
      } else if (passwordSetup) {
        setPassword("");
        setConfirm("");
        onPasswordSet();
      }
    } catch {
      setError("Lidhja u ndërpre. Provo përsëri.");
    } finally {
      setBusy(false);
    }
  }
  async function reset() {
    if (!supabase || !email.trim()) {
      setError("Shkruaj emailin më sipër për të rivendosur fjalëkalimin.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: new URL(
            import.meta.env.BASE_URL + "admin.html",
            window.location.origin,
          ).href,
        },
      );
      if (error) setError("Kërkesa nuk u dërgua. Provo përsëri më vonë.");
      else
        setMessage(
          "Nëse emaili ka një llogari, do të marrë udhëzimet për rivendosjen.",
        );
    } catch {
      setError("Lidhja u ndërpre. Provo përsëri.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={styles.loginPage}>
      <header className={styles.loginHeader}>
        <AdminBrand />
        <a
          className={styles.storeLink}
          href={import.meta.env.BASE_URL + "index.html"}
        >
          Shiko dyqanin <Icon name="arrow" />
        </a>
      </header>
      <main className={styles.loginMain}>
        <div className={styles.loginStory}>
          <h1>
            Dyqani yt,
            <br />
            nën kontroll.
          </h1>
          <p>
            Produktet, kategoritë dhe përzgjedhjet e ZIPO.
            <br />
            Të gjitha në një vend.
          </p>
          <div className={styles.loginProducts} aria-hidden="true">
            <img src={imageUrl("phone-17-pro-orange.webp")} alt="" />
            <img src={imageUrl("audio-airpods-pro-3.webp")} alt="" />
            <img src={imageUrl("watch-se-3.webp")} alt="" />
          </div>
        </div>
        <section className={styles.loginForm} aria-labelledby="login-title">
          <h2 id="login-title">
            {passwordSetup ? "Vendos fjalëkalimin" : "Hyr në administrim"}
          </h2>
          <p>
            {passwordSetup
              ? "Zgjidh një fjalëkalim për llogarinë tënde ZIPO."
              : "Mirë se erdhe. Vazhdo me llogarinë tënde."}
          </p>
          {!supabase && (
            <Notice error>
              Administrimi nuk është lidhur ende me databazën. Konfigurimi duhet
              përfunduar përpara hyrjes.
            </Notice>
          )}
          <form onSubmit={submit}>
            <fieldset disabled={busy || !supabase} className={styles.fieldset}>
              {!passwordSetup && (
                <label className={styles.field}>
                  Emaili
                  <input
                    required
                    type="email"
                    autoComplete="username"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="emri@dyqani.com"
                  />
                </label>
              )}
              <label className={styles.field}>
                {passwordSetup ? "Fjalëkalimi i ri" : "Fjalëkalimi"}
                <span className={styles.passwordField}>
                  <input
                    required
                    minLength={passwordSetup ? 10 : undefined}
                    type={visible ? "text" : "password"}
                    autoComplete={
                      passwordSetup ? "new-password" : "current-password"
                    }
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={
                      visible ? "Fshih fjalëkalimin" : "Shfaq fjalëkalimin"
                    }
                    aria-pressed={visible}
                    onClick={() => setVisible((value) => !value)}
                  >
                    <Icon name={visible ? "eyeOff" : "eye"} />
                  </button>
                </span>
              </label>
              {passwordSetup && (
                <>
                  <small className={styles.hint}>
                    Përdor të paktën 10 karaktere.
                  </small>
                  <label className={styles.field}>
                    Përsërite fjalëkalimin
                    <input
                      required
                      minLength={10}
                      type="password"
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                    />
                  </label>
                </>
              )}
              <Notice error>{error}</Notice>
              <Notice>{message}</Notice>
              <button className={styles.primary} type="submit">
                {busy
                  ? "Duke vazhduar…"
                  : passwordSetup
                    ? "Ruaj fjalëkalimin"
                    : "Hyr"}
                <Icon name="arrow" />
              </button>
              {!passwordSetup &&
                import.meta.env.VITE_PASSWORD_RECOVERY_ENABLED === "true" && (
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={reset}
                  >
                    Ke harruar fjalëkalimin?
                  </button>
                )}
            </fieldset>
          </form>
          <p className={styles.loginFootnote}>
            Qasje vetëm për administratorët e ZIPO.
          </p>
        </section>
      </main>
      <footer className={styles.loginFooter}>
        <span>ZIPO Mobil Shop</span>
        <span>Pejë, Kosovë</span>
      </footer>
    </div>
  );
}
