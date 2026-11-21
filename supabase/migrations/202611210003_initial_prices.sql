-- Temporary EUR prices for the initial catalog; existing owner prices are preserved.
begin;
update public.products as product
set price = coalesce(product.price, initial.price), is_demo = false
from (values
  ('iphone-17', 799::numeric),
  ('iphone-air', 899::numeric),
  ('kukirin-g2', 449::numeric),
  ('iphone-17-pro', 1099::numeric),
  ('ipad-air', 599::numeric),
  ('airpods-pro-3', 249::numeric),
  ('niu-nqi-sport', 1999::numeric),
  ('iphone-15-pro', 649::numeric),
  ('watch-se-3', 229::numeric)
) as initial(id, price)
where product.id = initial.id;
commit;
