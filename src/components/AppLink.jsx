import { createContext, useContext } from "react";
import { Link } from "react-router-dom";
export const NavigationContext = createContext(null);
export default function AppLink({ to, onClick, ...props }) {
  const transition = useContext(NavigationContext);
  return (
    <Link
      to={to}
      {...props}
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
