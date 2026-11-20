import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AdminApp from "./AdminApp";
import RouteError from "../components/RouteError";
import "../styles/storefront.css";
import "../styles/loading.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouteError>
      <AdminApp />
    </RouteError>
  </StrictMode>,
);
