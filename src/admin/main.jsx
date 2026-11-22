import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AdminApp from "./AdminApp";
import RouteError from "../components/RouteError";
import { normalizeAddress } from "../lib/routes";
import "../styles/storefront.css";
import "../styles/loading.css";

normalizeAddress();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouteError>
      <AdminApp />
    </RouteError>
  </StrictMode>,
);
