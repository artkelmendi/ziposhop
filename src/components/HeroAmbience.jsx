import { useEffect, useRef } from "react";
import { createHeroTexture } from "./heroTexture";
import styles from "./HeroAmbience.module.css";

export default function HeroAmbience() {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    const canvas = element.querySelector("canvas");
    const renderer = createHeroTexture(canvas);
    if (!renderer) return;

    element.dataset.renderer = "webgl";
    const hero = element.closest("section");
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    let active = false;
    let frame = 0;
    let lastFrame = 0;
    let elapsed = 0;
    let rippleTime = -100;
    let contextLost = false;
    const pointer = [0.5, 0.5, 0];
    const target = [0.5, 0.5, 0];
    const ripple = [0.5, 0.5, 100];

    function draw(now = performance.now()) {
      frame = 0;
      if (active) frame = requestAnimationFrame(draw);
      const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.1) : 0;
      lastFrame = now;
      if (active) elapsed += delta;
      pointer.forEach((value, i) => {
        pointer[i] = preference.matches ? (i === 2 ? 0 : 0.5) : value + (target[i] - value) * 0.12;
      });
      ripple[2] = preference.matches ? 100 : elapsed - rippleTime;
      renderer.render({ time: elapsed, pointer, ripple });
    }

    function update() {
      const next = inView && !document.hidden && !preference.matches && !contextLost;
      if (next === active) return;
      active = next;
      cancelAnimationFrame(frame);
      lastFrame = 0;
      if (active) frame = requestAnimationFrame(draw);
      else if (preference.matches && inView) draw();
    }

    function resize() {
      renderer.resize();
      if (!active) draw();
    }

    function move(event) {
      if (!active) return;
      const bounds = hero.getBoundingClientRect();
      target[0] = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      target[1] = 1 - Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
      target[2] = 1;
    }

    function press(event) {
      if (!active) return;
      move(event);
      ripple[0] = target[0];
      ripple[1] = target[1];
      rippleTime = elapsed;
    }

    function leave() {
      target[2] = 0;
    }

    function loseContext(event) {
      event.preventDefault();
      contextLost = true;
      active = false;
      cancelAnimationFrame(frame);
      element.dataset.renderer = "fallback";
    }

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    const sizes = new ResizeObserver(resize);
    observer.observe(element);
    sizes.observe(element);
    document.addEventListener("visibilitychange", update);
    preference.addEventListener("change", update);
    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerdown", press, { passive: true });
    hero.addEventListener("pointerleave", leave);
    canvas.addEventListener("webglcontextlost", loseContext);
    resize();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      sizes.disconnect();
      document.removeEventListener("visibilitychange", update);
      preference.removeEventListener("change", update);
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerdown", press);
      hero.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("webglcontextlost", loseContext);
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={ref} className={styles.ambience} aria-hidden="true">
      <canvas className={styles.texture} />
    </div>
  );
}
