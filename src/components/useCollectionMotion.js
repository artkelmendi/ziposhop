import { useCallback, useEffect, useRef } from "react";

const MAX_VELOCITY = 1400; // pixels/second; keeps fast flicks readable.
const MOMENTUM_DURATION = 2200;

// Keep the normal loop on the compositor. JS runs only during a drag or its decay.
export default function useCollectionMotion({ viewport, track, group, duration, reducedMotion, selection, repetitions }) {
  const reset = useRef(null);
  useEffect(() => {
    const rail = viewport.current;
    const animation = track.current?.getAnimations()[0];
    if (!selection?.length || reducedMotion || !rail || !animation) return;
    const cycle = duration * 1000;
    const pixelsPerMs = group.current.getBoundingClientRect().width / cycle;
    if (!pixelsPerMs) return;
    rail.scrollLeft = 0;
    let gesture = null;
    let frame = 0;
    let visible = false;
    let suppressUntil = 0;

    const rate = value => animation.updatePlaybackRate(value);
    // A positive spare cycle also lets a rightward flick cross the loop's origin.
    const wrap = time => ((time % cycle) + cycle) % cycle + cycle;
    function normalize() {
      const time = Number(animation.currentTime) || 0;
      if (time < cycle / 2 || time > cycle * 3) animation.currentTime = wrap(time);
    }
    function stopMomentum() {
      cancelAnimationFrame(frame);
      frame = 0;
      rate(1);
    }
    function playWhenVisible() {
      if (visible && !document.hidden) {
        rail.dataset.motion = "auto";
        animation.play();
      } else {
        rail.dataset.motion = "inactive";
        animation.pause();
      }
    }
    function releaseCapture(current) {
      if (current && rail.hasPointerCapture(current.id)) rail.releasePointerCapture(current.id);
    }
    function resetMotion() {
      const current = gesture;
      gesture = null;
      releaseCapture(current);
      stopMomentum();
      playWhenVisible();
    }
    reset.current = resetMotion;

    function momentum(velocity) {
      stopMomentum();
      normalize();
      const from = -Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocity)) / (pixelsPerMs * 1000);
      const start = performance.now();
      rate(from);
      animation.play();
      rail.dataset.motion = "settling";
      function settle(now) {
        if (!visible || document.hidden) { resetMotion(); return; }
        normalize();
        const elapsed = now - start;
        if (elapsed >= MOMENTUM_DURATION) {
          rate(1);
          frame = 0;
          rail.dataset.motion = "auto";
          return;
        }
        rate(1 + (from - 1) * Math.exp(-elapsed / 280));
        frame = requestAnimationFrame(settle);
      }
      frame = requestAnimationFrame(settle);
    }

    function down(event) {
      if (event.isPrimary === false) { if (gesture) resetMotion(); return; }
      if (event.button !== 0 || gesture) return;
      suppressUntil = 0;
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false, samples: [{ x: event.clientX, time: event.timeStamp }] };
    }
    function move(event) {
      if (!gesture || event.pointerId !== gesture.id) return;
      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;
      if (!gesture.dragging) {
        if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { gesture = null; return; }
        if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy) * 1.15) return;
        stopMomentum();
        animation.pause();
        gesture.origin = Number(animation.currentTime) || 0;
        gesture.dragging = true;
        rail.dataset.motion = "dragging";
        rail.setPointerCapture(event.pointerId);
      }
      event.preventDefault();
      animation.currentTime = wrap(gesture.origin - dx / pixelsPerMs);
      gesture.samples.push({ x: event.clientX, time: event.timeStamp });
      gesture.samples = gesture.samples.filter(sample => event.timeStamp - sample.time <= 120).slice(-12);
    }
    function finish(event, cancelled = false) {
      if (!gesture || event.pointerId !== gesture.id) return;
      const current = gesture;
      gesture = null;
      releaseCapture(current);
      if (!current.dragging) return;
      suppressUntil = performance.now() + 350;
      const last = current.samples.at(-1);
      const first = current.samples.find(sample => event.timeStamp - sample.time <= 100) || last;
      const elapsed = event.timeStamp - first.time;
      const velocity = !cancelled && event.timeStamp - last.time < 100 && elapsed > 0
        ? (event.clientX - first.x) / elapsed * 1000 : 0;
      if (cancelled || !visible || document.hidden) resetMotion();
      else momentum(velocity);
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
      if (!visible) resetMotion();
      else if (!gesture?.dragging && !frame) playWhenVisible();
    });
    observer.observe(rail);
    const visibility = () => resetMotion();
    document.addEventListener("visibilitychange", visibility);
    rail.addEventListener("pointerdown", down);
    rail.addEventListener("lostpointercapture", lost);
    rail.addEventListener("click", click, true);
    rail.addEventListener("dragstart", noDrag);
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    playWhenVisible();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      rail.removeEventListener("pointerdown", down);
      rail.removeEventListener("lostpointercapture", lost);
      rail.removeEventListener("click", click, true);
      rail.removeEventListener("dragstart", noDrag);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      const current = gesture;
      gesture = null;
      releaseCapture(current);
      stopMomentum();
      reset.current = null;
      delete rail.dataset.motion;
    };
  }, [duration, reducedMotion, selection, repetitions, viewport, track, group]);
  return useCallback(() => reset.current?.(), []);
}
