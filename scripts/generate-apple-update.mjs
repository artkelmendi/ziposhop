import { writeFileSync } from "node:fs";
import { appleProducts } from "../src/data/apple2026.js";

const rows = appleProducts.map((product, i) => ({
  ...product,
  sort_order: 10 + i,
}));
const json = JSON.stringify(rows).replaceAll("'", "''");
const sql = `-- Add the current Apple lineup without changing existing products or homepage selections.
-- Names are checked too, so products already added through the admin are preserved.
begin;
insert into public.products
  (id, category, name, description, image, specs, views, finishes, price, published, is_demo, sort_order)
select x.id, x.category, x.name, x.description, x.image, x.specs, x.views, x.finishes, x.price, true, false, x.sort_order
from jsonb_to_recordset('${json}'::jsonb)
as x(id text, category text, name text, description text, image text, specs jsonb, views jsonb, finishes jsonb, price numeric, sort_order integer)
where not exists (select 1 from public.products p where lower(trim(p.name)) = lower(trim(x.name)))
on conflict (id) do nothing;
commit;
`;
writeFileSync("supabase/migrations/202611220001_apple_lineup.sql", sql);
console.log(`Prepared ${rows.length} products; existing records and homepage settings are preserved.`);
