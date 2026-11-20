import { useEffect, useRef, useState } from "react";
import Skeleton from "./Skeleton";

export default function Media({
  src,
  alt = "",
  className = "",
  eager = false,
  ...props
}) {
  // Keying the frame resets loading and failure state for each product variant.
  return (
    <MediaFrame
      key={src}
      src={src}
      alt={alt}
      className={className}
      eager={eager}
      {...props}
    />
  );
}
function MediaFrame({ src, alt, className, eager, style, ...props }) {
  const image = useRef(null);
  const [state, setState] = useState("loading");
  const [showSkeleton, setShowSkeleton] = useState(false);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) setShowSkeleton(true);
    }, 200);
    const element = image.current;
    async function loaded() {
      try {
        await element.decode();
      } catch {
        /* onerror handles unavailable images. */
      }
      if (active) {
        clearTimeout(timer);
        setState(element.naturalWidth ? "ready" : "error");
      }
    }
    function failed() {
      clearTimeout(timer);
      if (active) setState("error");
    }
    element.addEventListener("load", loaded);
    element.addEventListener("error", failed);
    if (element.complete) element.naturalWidth ? loaded() : failed();
    return () => {
      active = false;
      clearTimeout(timer);
      element.removeEventListener("load", loaded);
      element.removeEventListener("error", failed);
    };
  }, []);
  return (
    <div
      className={[
        "media-frame",
        className,
        state === "ready" && showSkeleton ? "media-revealed" : "",
      ].join(" ")}
      aria-busy={state === "loading"}
      data-media-state={state}
      style={style}
    >
      <img
        ref={image}
        src={import.meta.env.BASE_URL + "assets/" + src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        {...props}
      />
      {showSkeleton && state !== "error" && (
        <Skeleton className={state === "ready" ? "skeleton-dismiss" : ""} />
      )}
      {state === "error" && (
        <span className="media-failure">Foto e padisponueshme</span>
      )}
    </div>
  );
}
