import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { loadingShell } from "./build/loading-shell.js";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "initial-loading-shell",
      transformIndexHtml(html, context) {
        const page = context.filename.endsWith("admin.html")
          ? "admin"
          : context.filename.endsWith("produktet.html")
            ? "catalog"
            : context.filename.endsWith("kontakti.html")
              ? "contact"
              : "home";
        return html.replace("<!--initial-loading-->", loadingShell(page));
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, "index.html"),
        catalog: resolve(import.meta.dirname, "produktet.html"),
        contact: resolve(import.meta.dirname, "kontakti.html"),
        admin: resolve(import.meta.dirname, "admin.html"),
      },
    },
  },
});
