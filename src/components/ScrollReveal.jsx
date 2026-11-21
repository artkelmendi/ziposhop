import { useEffect, useRef } from "react";

// Content is visible by default. The observer adds one entrance per mount.
export default function ScrollReveal({
  children,
  className = "",
  variant = "lift",
  delay = 0,
  ready = true,
}) {
  const element = useRef(null);
  useEffect(() => {
    if (!ready) return;
    const node = element.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || !window.IntersectionObserver || !node.animate)
      return;
    if (node.getBoundingClientRect().top < innerHeight) return;
    let animation;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const frames =
          variant === "image"
            ? [
                {
                  opacity: 0.2,
                  transform: "scale(.96)",
                  clipPath: "inset(5% 0 0 0)",
                },
                { opacity: 1, transform: "scale(1)", clipPath: "inset(0)" },
              ]
            : [
                { opacity: 0.15, transform: "translateY(28px)" },
                { opacity: 1, transform: "translateY(0)" },
              ];
        animation = node.animate(frames, {
          duration: 800,
          delay,
          easing: "cubic-bezier(.16,1,.3,1)",
          fill: "backwards",
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
    );
    observer.observe(node);
    const stop = () => {
      if (reduced.matches) {
        observer.disconnect();
        animation?.cancel();
      }
    };
    reduced.addEventListener("change", stop);
    return () => {
      observer.disconnect();
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
