import { useState } from "react";
import { supabase } from "./client";
import { AdminBrand, Notice } from "./ui";
import Icon from "../components/Icon";
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
      setError("Passwords do not match.");
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
            ? "Password could not be saved. Use at least 10 characters and try again."
            : result.error.status === 429
              ? "Too many attempts. Please wait a moment and try again."
              : "Incorrect email or password. Please try again.",
        );
      } else if (passwordSetup) {
        setPassword("");
        setConfirm("");
        onPasswordSet();
      }
    } catch {
      setError("Connection lost. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function reset() {
    if (!supabase || !email.trim()) {
      setError("Enter your email above to reset your password.");
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
      if (error) setError("Request could not be sent. Please try again later.");
      else
        setMessage(
          "If an account exists for this email, you will receive reset instructions.",
        );
    } catch {
      setError("Connection lost. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={styles.loginPage} lang="en">
      <header className={styles.loginHeader}>
        <AdminBrand />
        <a
          className={styles.storeLink}
          href={import.meta.env.BASE_URL}
        >
          Back to shop <Icon name="arrow" />
        </a>
      </header>
      <main className={styles.loginMain}>
        <section className={styles.loginForm} aria-labelledby="login-title">
          <h1 id="login-title">{passwordSetup ? "Set password" : "Login"}</h1>
          {!supabase && (
            <Notice error>
              Login is unavailable. Please finish the database setup.
            </Notice>
          )}
          <form onSubmit={submit}>
            <fieldset disabled={busy || !supabase} className={styles.fieldset}>
              {!passwordSetup && (
                <label className={styles.field}>
                  Email
                  <input
                    required
                    type="email"
                    autoComplete="username"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </label>
              )}
              <label className={styles.field}>
                {passwordSetup ? "New password" : "Password"}
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
                      visible ? "Hide password" : "Show password"
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
                    Use at least 10 characters.
                  </small>
                  <label className={styles.field}>
                    Confirm password
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
                  ? "Please wait…"
                  : passwordSetup
                    ? "Save password"
                    : "Login"}
                <Icon name="arrow" />
              </button>
              {!passwordSetup &&
                import.meta.env.VITE_PASSWORD_RECOVERY_ENABLED === "true" && (
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={reset}
                  >
                    Forgot password?
                  </button>
                )}
            </fieldset>
          </form>
        </section>
      </main>
    </div>
  );
}
