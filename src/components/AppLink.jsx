import { createContext, useContext } from "react";
import { Link } from "react-router-dom";
import { preloadCategoryImage } from "../lib/categoryImages";
export const NavigationContext = createContext(null);
export default function AppLink({ to, onClick, onPointerEnter, onPointerDown, onFocus, ...props }) {
  const transition = useContext(NavigationContext);
  return (
    <Link
      to={to}
      {...props}
      onPointerEnter={event => { onPointerEnter?.(event); if (!event.defaultPrevented) preloadCategoryImage(to); }}
      onPointerDown={event => { onPointerDown?.(event); if (!event.defaultPrevented) preloadCategoryImage(to); }}
      onFocus={event => { onFocus?.(event); if (!event.defaultPrevented) preloadCategoryImage(to); }}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          (props.target && props.target !== "_self") ||
          props.download != null
        )
          return;
        event.preventDefault();
        transition(to);
      }}
    />
  );
}
