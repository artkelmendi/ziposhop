import {writeFileSync} from 'node:fs';
import {categories, products} from '../src/data/catalog.js';
const escape = value => "'" + JSON.stringify(value).replaceAll("'", "''") + "'::jsonb";
const cat=categories.map((category,index)=>({...category,sort_order:index}));
const prod=products.map((product,index)=>({...product,published:true,is_demo:true,sort_order:index}));
const sql=`begin;\ninsert into public.categories (id,name,description,image,artwork,sort_order) select id,name,description,image,artwork,sort_order from jsonb_to_recordset(${escape(cat)}) as x(id text,name text,description text,image text,artwork jsonb,sort_order integer) on conflict (id) do nothing;\ninsert into public.products (id,category,name,description,image,specs,views,finishes,published,is_demo,sort_order) select id,category,name,description,image,specs,views,finishes,published,is_demo,sort_order from jsonb_to_recordset(${escape(prod)}) as x(id text,category text,name text,description text,image text,specs jsonb,views jsonb,finishes jsonb,published boolean,is_demo boolean,sort_order integer) on conflict (id) do nothing;\nupdate public.homepage_settings set featured_product_id='kukirin-g2', collection_product_ids=array['kukirin-g2','iphone-17-pro','ipad-air','airpods-pro-3','niu-nqi-sport','iphone-15-pro','watch-se-3'] where id=1;\ncommit;\n`;
writeFileSync('supabase/seed.sql',sql);
console.log(sql);
