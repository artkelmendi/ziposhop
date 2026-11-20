import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import BrandIntro from "./components/BrandIntro";
import CatalogProvider from "./data/CatalogContext";
import "./styles/storefront.css";
import "./styles/loading.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <BrandIntro>
        <CatalogProvider>
          <App />
        </CatalogProvider>
      </BrandIntro>
    </BrowserRouter>
  </StrictMode>,
);
