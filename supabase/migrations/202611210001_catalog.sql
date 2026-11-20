begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table private.admin_allowlist (
  email text primary key check (email = lower(email))
);
insert into private.admin_allowlist values ('ziposhop@gmail.com');

create function public.is_shop_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from auth.users u
    join private.admin_allowlist a on lower(u.email) = a.email
    where u.id = (select auth.uid()) and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.is_shop_admin() from public;
grant execute on function public.is_shop_admin() to authenticated;

create table public.categories (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) between 1 and 120),
  description text not null default '' check (length(description) <= 1000),
  image text not null default '',
  artwork jsonb not null default '[]' check (jsonb_typeof(artwork) = 'array' and jsonb_array_length(artwork) <= 4),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table public.products (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category text not null references public.categories(id) on delete restrict,
  name text not null check (length(trim(name)) between 1 and 180),
  description text not null default '' check (length(description) <= 6000),
  image text not null default '',
  thumbnail text not null default '',
  images jsonb not null default '[]' check (jsonb_typeof(images) = 'array' and jsonb_array_length(images) <= 6),
  specs jsonb not null default '[]' check (jsonb_typeof(specs) = 'array' and jsonb_array_length(specs) <= 20),
  views jsonb,
  finishes jsonb,
  price numeric(10,2) check (price >= 0),
  available boolean not null default true,
  published boolean not null default false,
  is_demo boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_published on public.products(category, published, sort_order);
create table public.homepage_settings (
  id integer primary key default 1 check (id = 1),
  featured_product_id text references public.products(id) on delete set null,
  collection_product_ids text[] not null default '{}' check (cardinality(collection_product_ids) <= 12)
);
insert into public.homepage_settings (id) values (1);

create function private.touch_product() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger products_updated before update on public.products
for each row execute function private.touch_product();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.homepage_settings enable row level security;
grant select on public.categories, public.products, public.homepage_settings to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.homepage_settings to authenticated;
create policy "Published categories" on public.categories for select to anon, authenticated using (active);
create policy "Published products" on public.products for select to anon, authenticated
using (published and exists (select 1 from public.categories c where c.id = category and c.active));
create policy "Homepage selection" on public.homepage_settings for select to anon, authenticated using (true);
create policy "Admins manage categories" on public.categories for all to authenticated
using ((select public.is_shop_admin())) with check ((select public.is_shop_admin()));
create policy "Admins manage products" on public.products for all to authenticated
using ((select public.is_shop_admin())) with check ((select public.is_shop_admin()));
create policy "Admins manage homepage" on public.homepage_settings for all to authenticated
using ((select public.is_shop_admin())) with check ((select public.is_shop_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-media', 'product-media', true, 3145728, array['image/jpeg','image/png','image/webp']);
create policy "Admins upload product media" on storage.objects for insert to authenticated
with check (bucket_id = 'product-media' and (select public.is_shop_admin()));
create policy "Admins read product media metadata" on storage.objects for select to authenticated
using (bucket_id = 'product-media' and (select public.is_shop_admin()));
create policy "Admins update product media" on storage.objects for update to authenticated
using (bucket_id = 'product-media' and (select public.is_shop_admin()))
with check (bucket_id = 'product-media' and (select public.is_shop_admin()));
create policy "Admins delete product media" on storage.objects for delete to authenticated
using (bucket_id = 'product-media' and (select public.is_shop_admin()));

commit;
