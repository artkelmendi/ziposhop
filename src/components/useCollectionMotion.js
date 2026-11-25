import { useCallback, useEffect, useRef } from "react";

const DEFAULT_SPEED = 34; // pixels/second, leftward.
const MAX_RELEASE_SPEED = 2400;
const DECAY = 0.36; // seconds; applies equally at 60 Hz and 120 Hz.

// One position drives autoplay, dragging and momentum. No animation seeks or snaps.
export default function useCollectionMotion({ viewport, track, group, reducedMotion, ready }) {
  const position = useRef(0);
  const focus = useRef(null);
  useEffect(() => {
    const rail = viewport.current;
    const strip = track.current;
    const firstGroup = group.current;
    if (!ready || !rail || !strip || !firstGroup) return;

    let distance = rail.scrollLeft || position.current;
    let width = 0;
    let stride = 0;
    let scrollLimit = 0;
    let velocity = DEFAULT_SPEED;
    let gesture = null;
    let frame = 0;
    let previousTime = 0;
    let visible = false;
    let suppressUntil = 0;
    if (!reducedMotion) rail.scrollLeft = 0;

    function state(value) {
      if (rail.dataset.motion !== value) rail.dataset.motion = value;
    }
    function paint() {
      if (!width) return;
      if (reducedMotion) {
        distance = Math.max(0, Math.min(scrollLimit, distance));
        rail.scrollLeft = distance;
        position.current = distance;
        return;
      }
      const phase = ((distance % width) + width) % width;
      strip.style.transform = `translate3d(${-phase}px, 0, 0)`;
      position.current = distance;
    }
    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    function tick(now) {
      frame = 0;
      if (!visible || document.hidden || gesture) return;
      const dt = Math.min(64, Math.max(0, now - previousTime)) / 1000;
      previousTime = now;
      const decay = Math.exp(-dt / DECAY);
      distance += DEFAULT_SPEED * dt + (velocity - DEFAULT_SPEED) * DECAY * (1 - decay);
      velocity = DEFAULT_SPEED + (velocity - DEFAULT_SPEED) * decay;
      if (Math.abs(velocity - DEFAULT_SPEED) < 0.5) {
        velocity = DEFAULT_SPEED;
        state("auto");
      }
      paint();
      frame = requestAnimationFrame(tick);
    }
    function play() {
      if (reducedMotion) {
        state("manual");
        return;
      }
      if (!visible || document.hidden) {
        state("inactive");
        strip.style.willChange = "auto";
        return;
      }
      strip.style.willChange = "transform";
      if (gesture) return;
      state(velocity === DEFAULT_SPEED ? "auto" : "settling");
      if (!frame) {
        previousTime = performance.now();
        frame = requestAnimationFrame(tick);
      }
    }
    function releaseCapture(current) {
      if (current && rail.hasPointerCapture(current.id)) rail.releasePointerCapture(current.id);
    }
    function interrupt() {
      const current = gesture;
      gesture = null;
      if (current?.dragging) suppressUntil = performance.now() + 350;
      releaseCapture(current);
      stop();
      velocity = DEFAULT_SPEED;
      play();
    }
    function measure() {
      const nextWidth = firstGroup.getBoundingClientRect().width;
      const card = firstGroup.firstElementChild;
      if (!nextWidth || !card) return;
      const nextStride = card.getBoundingClientRect().width + parseFloat(getComputedStyle(firstGroup).columnGap);
      if (stride && Math.abs(nextStride - stride) > 0.1) {
        distance *= nextStride / stride;
        interrupt();
      }
      width = nextWidth;
      stride = nextStride;
      scrollLimit = Math.max(0, rail.scrollWidth - rail.clientWidth);
      paint();
    }
    focus.current = element => {
      interrupt();
      distance = Math.max(0, element.getBoundingClientRect().left - firstGroup.getBoundingClientRect().left - 12);
      rail.scrollLeft = 0;
      paint();
    };

    function down(event) {
      if (event.isPrimary === false) { if (gesture) interrupt(); return; }
      if (event.button !== 0 || gesture) return;
      stop();
      velocity = DEFAULT_SPEED;
      suppressUntil = 0;
      if (reducedMotion) distance = rail.scrollLeft;
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, origin: distance, dragging: false, samples: [{ x: event.clientX, time: event.timeStamp }] };
      state("held");
    }
    function move(event) {
      if (!gesture || event.pointerId !== gesture.id) return;
      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;
      if (!gesture.dragging) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 4) return;
        gesture.dragging = true;
        state("dragging");
        rail.setPointerCapture(event.pointerId);
      }
      event.preventDefault();
      distance = gesture.origin - dx;
      paint();
      gesture.samples.push({ x: event.clientX, time: event.timeStamp });
      gesture.samples = gesture.samples.filter(sample => event.timeStamp - sample.time <= 120).slice(-16);
    }
    function finish(event, cancelled = false) {
      if (!gesture || event.pointerId !== gesture.id) return;
      const current = gesture;
      gesture = null;
      releaseCapture(current);
      velocity = DEFAULT_SPEED;
      if (current.dragging) {
        suppressUntil = performance.now() + 350;
        const last = current.samples.at(-1);
        const first = current.samples.find(sample => event.timeStamp - sample.time <= 100) || last;
        const elapsed = event.timeStamp - first.time;
        if (!cancelled && event.timeStamp - last.time < 100 && elapsed > 0)
          velocity = Math.max(-MAX_RELEASE_SPEED, Math.min(MAX_RELEASE_SPEED, -(event.clientX - first.x) / elapsed * 1000));
        else if (!cancelled) velocity = 0;
      }
      play();
    }
    const up = event => finish(event);
    const cancel = event => finish(event, true);
    const lost = event => { if (event.target === rail) finish(event, true); };
    function click(event) {
      if (event.detail !== 0 && (gesture?.dragging || performance.now() < suppressUntil)) {
        event.preventDefault();
        event.stopPropagation();
        suppressUntil = 0;
      }
    }
    const noDrag = event => event.preventDefault();
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) interrupt();
      else play();
    });
    const sizes = new ResizeObserver(measure);
    measure();
    sizes.observe(firstGroup);
    observer.observe(rail);
    document.addEventListener("visibilitychange", interrupt);
    window.addEventListener("blur", interrupt);
    rail.addEventListener("pointerdown", down, { capture: true, passive: true });
    rail.addEventListener("lostpointercapture", lost);
    rail.addEventListener("click", click, true);
    rail.addEventListener("dragstart", noDrag);
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    play();
    return () => {
      observer.disconnect();
      sizes.disconnect();
      document.removeEventListener("visibilitychange", interrupt);
      window.removeEventListener("blur", interrupt);
      rail.removeEventListener("pointerdown", down, true);
      rail.removeEventListener("lostpointercapture", lost);
      rail.removeEventListener("click", click, true);
      rail.removeEventListener("dragstart", noDrag);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      const current = gesture;
      gesture = null;
      releaseCapture(current);
      stop();
      if (reducedMotion) position.current = rail.scrollLeft;
      strip.style.removeProperty("transform");
      strip.style.removeProperty("will-change");
      focus.current = null;
      delete rail.dataset.motion;
    };
  }, [ready, reducedMotion, viewport, track, group]);
  return useCallback(element => focus.current?.(element), []);
}
