import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import BrandIntro from "./components/BrandIntro";
import CatalogProvider from "./data/CatalogContext";
import { normalizeAddress } from "./lib/routes";
import { preloadCategoryImage } from "./lib/categoryImages";
import { PrivacyProvider } from "./components/PrivacyConsent";
import "./styles/storefront.css";
import "./styles/loading.css";

normalizeAddress();
preloadCategoryImage(window.location.href);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <PrivacyProvider>
        <BrandIntro>
          <CatalogProvider>
            <App />
          </CatalogProvider>
        </BrandIntro>
      </PrivacyProvider>
    </BrowserRouter>
  </StrictMode>,
);
