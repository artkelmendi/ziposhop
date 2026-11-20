begin;
alter table public.products add constraint published_product_has_image
  check (not published or length(trim(image)) > 0);

create function private.remove_deleted_product() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.homepage_settings
  set collection_product_ids = array_remove(collection_product_ids, old.id)
  where id = 1 and old.id = any(collection_product_ids);
  return old;
end;
$$;
create trigger remove_deleted_product_from_homepage after delete on public.products
for each row execute function private.remove_deleted_product();
commit;
