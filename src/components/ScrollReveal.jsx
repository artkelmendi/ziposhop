import { useEffect, useRef } from "react";

// Reveal below the viewport, never fade out content the visitor can already see.
export default function ScrollReveal({
  children,
  className = "",
  variant = "lift",
  delay = 0,
  ready = true,
}) {
  const element = useRef(null);
  const shown = useRef(false);
  useEffect(() => {
    if (!ready || shown.current) return;
    const node = element.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (!node || reduced.matches || !window.IntersectionObserver || !node.animate) return;

    const mobile = matchMedia("(max-width: 750px)").matches;
    let animation;
    let resize;
    let firstFrame;
    let settledFrame;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      const box = node.getBoundingClientRect();
      if (!box.height) return;
      observer.disconnect();
      shown.current = true;
      // A fast swipe or anchor jump can pass the pre-entry boundary in one frame.
      // Leave that content fully visible rather than restarting it mid-scroll.
      if (box.top < innerHeight) return;
      const frames = mobile
        ? [
            { opacity: 0.72, transform: `translateY(${variant === "image" ? 8 : 12}px)` },
            { opacity: 1, transform: "none" },
          ]
        : variant === "image"
          ? [
              { opacity: 0.2, transform: "scale(.96)", clipPath: "inset(5% 0 0 0)" },
              { opacity: 1, transform: "scale(1)", clipPath: "inset(0)" },
            ]
          : [
              { opacity: 0.15, transform: "translateY(28px)" },
              { opacity: 1, transform: "translateY(0)" },
            ];
      animation = node.animate(frames, {
        duration: mobile ? 420 : 800,
        delay: mobile ? 0 : delay,
        easing: "cubic-bezier(.16,1,.3,1)",
        fill: "backwards",
      });
    }, { threshold: 0, rootMargin: "0px 0px 96px 0px" });

    function arm() {
      const box = node.getBoundingClientRect();
      if (!box.height) {
        if (window.ResizeObserver && !resize) {
          resize = new ResizeObserver(() => {
            if (node.getBoundingClientRect().height > 0) {
              resize.disconnect();
              settledFrame = requestAnimationFrame(arm);
            }
          });
          resize.observe(node);
        }
        return;
      }
      if (box.top < innerHeight) {
        shown.current = true;
        return;
      }
      observer.observe(node);
    }
    // Let route scroll restoration and asynchronous section layout settle first.
    firstFrame = requestAnimationFrame(() => {
      settledFrame = requestAnimationFrame(arm);
    });
    const stop = () => {
      if (!reduced.matches) return;
      shown.current = true;
      observer.disconnect();
      resize?.disconnect();
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(settledFrame);
      animation?.cancel();
    };
    reduced.addEventListener("change", stop);
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(settledFrame);
      observer.disconnect();
      resize?.disconnect();
      animation?.cancel();
      reduced.removeEventListener("change", stop);
    };
  }, [variant, delay, ready]);
  return (
    <div ref={element} className={className} data-scroll-reveal={variant}>
      {children}
    </div>
  );
}
