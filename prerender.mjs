import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

// Bake the shared navigation and initial catalog into HTML for the first paint.
const dist = new URL("./dist/", import.meta.url);
const context = vm.createContext({});
for (const file of ["catalog.js", "shared.js"]) {
  vm.runInContext(await readFile(new URL(file, dist), "utf8"), context);
}
for (const [file, page] of [
  ["index.html", "home"],
  ["produktet.html", "catalog"],
  ["kontakti.html", "contact"],
]) {
  const url = new URL(file, dist);
  const html = await readFile(url, "utf8");
  const content = vm.runInContext(
    `({
    header: headerMarkup("${page}"),
    footer: footerMarkup(),
    categories: categoryTiles(),
    count: products.length + " produkte",
    filters: filterMarkup(),
    products: products.map(productCard).join(""),
    collection: '<div class="collection-placeholder">' + '<zipo-skeleton variant="card" aria-hidden="true"></zipo-skeleton>'.repeat(5) + '</div>'
  })`,
    context,
  );
  await writeFile(
    url,
    html.replace(
      /<!--static:(\w+)-->[\s\S]*?<!--end:\1-->/g,
      (_, name) => `<!--static:${name}-->${content[name]}<!--end:${name}-->`,
    ),
  );
}
