import { useEffect, useState } from "react";
import { supabase } from "./client";

const initialPasswordSetup = /type=(invite|recovery)/.test(
  window.location.hash,
);

export default function useAdminSession() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(Boolean(supabase));
  const [authorized, setAuthorized] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(initialPasswordSetup);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, value) => {
      if (!active) return;
      setSession(value);
      if (event === "PASSWORD_RECOVERY") setNeedsPassword(true);
      if (!value) {
        setAuthorized(false);
        setChecking(false);
      }
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      setSession(data.session);
      if (error)
        setError("Sesioni nuk u kontrollua. Rifresko faqen dhe provo përsëri.");
      if (!data.session) setChecking(false);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!session?.user.id) return;
    let active = true;
    setChecking(true);
    setError("");
    supabase.rpc("is_shop_admin").then(({ data, error }) => {
      if (!active) return;
      setAuthorized(!error && data === true);
      setError(
        error
          ? "Lejet nuk u kontrolluan. Provo përsëri."
          : data === true
            ? ""
            : "Kjo llogari nuk ka qasje në administrimin e ZIPO.",
      );
      setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [session?.user.id, revision]);
  return {
    session,
    checking,
    authorized,
    needsPassword,
    setNeedsPassword,
    error,
    retry: () => setRevision((value) => value + 1),
  };
}
