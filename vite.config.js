import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { copyFile, mkdir } from "node:fs/promises";

const directoryPages = ["produktet", "kontakti", "pyetje", "privatesia", "admin"];

function cleanPageUrls() {
  return {
    name: "clean-page-urls",
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        const url = new URL(request.url, "http://localhost");
        const page = directoryPages.find(name => url.pathname === `/${name}/` || url.pathname === `/${name}`);
        if (page) request.url = `/${page}.html${url.search}`;
        next();
      });
    },
    async writeBundle(options) {
      for (const page of directoryPages) {
        await mkdir(resolve(options.dir, page), { recursive: true });
        await copyFile(resolve(options.dir, `${page}.html`), resolve(options.dir, page, "index.html"));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), cleanPageUrls()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, "index.html"),
        catalog: resolve(import.meta.dirname, "produktet.html"),
        contact: resolve(import.meta.dirname, "kontakti.html"),
        faq: resolve(import.meta.dirname, "pyetje.html"),
        privacy: resolve(import.meta.dirname, "privatesia.html"),
        admin: resolve(import.meta.dirname, "admin.html"),
      },
    },
  },
});
