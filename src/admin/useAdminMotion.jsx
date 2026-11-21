import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { flushSync } from "react-dom";

export const AdminMotionContext = createContext((update) => update());
export const useAdminMotion = () => useContext(AdminMotionContext);

// Keep the current form mounted until its short exit finishes. A newer request
// replaces the pending destination, so rapid navigation cannot replay old views.
export function usePanelMotion(ready) {
  const panel = useRef(null);
  const animation = useRef(null);
  const pending = useRef(null);
  const reduced = useRef(false);
  const initialized = useRef(false);

  const enter = useCallback(() => {
    if (!panel.current?.animate || reduced.current) return;
    animation.current = panel.current.animate(
      [
        { opacity: 0, transform: "translateY(8px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 260, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
  }, []);

  const commit = useCallback(() => {
    const next = pending.current;
    if (!next) return;
    pending.current = null;
    animation.current?.cancel();
    if (panel.current) panel.current.inert = false;
    flushSync(next.update);
    if (next.scroll) window.scrollTo({ top: 0, behavior: "instant" });
    enter();
  }, [enter]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reduced.current = preference.matches;
      if (preference.matches) {
        animation.current?.cancel();
        commit();
      }
    };
    sync();
    preference.addEventListener("change", sync);
    return () => {
      preference.removeEventListener("change", sync);
      pending.current = null;
      animation.current?.cancel();
      if (panel.current) panel.current.inert = false;
    };
  }, [commit]);

  useEffect(() => {
    if (ready && !initialized.current) {
      initialized.current = true;
      // Data can arrive during navigation. Keep that transition's destination
      // and animation intact instead of replacing it with the initial reveal.
      if (!pending.current && animation.current?.playState !== "running") enter();
    }
  }, [ready, enter]);

  const transition = useCallback(
    (update, { scroll = false } = {}) => {
      const node = panel.current;
      pending.current = { update, scroll };
      const current = node && getComputedStyle(node);
      const opacity = current?.opacity || "1";
      const transform = current?.transform || "none";
      animation.current?.cancel();
      if (!node || reduced.current || !node.animate) {
        commit();
        return;
      }
      node.inert = true;
      const exit = node.animate(
        [{ opacity, transform }, { opacity: 0, transform: "translateY(-4px)" }],
        { duration: 110, easing: "ease-in", fill: "forwards" },
      );
      animation.current = exit;
      exit.finished
        .then(() => {
          if (animation.current === exit) commit();
        })
        .catch(() => {}); // Cancellation is expected when navigation is interrupted.
    },
    [commit],
  );

  return { panel, transition };
}
