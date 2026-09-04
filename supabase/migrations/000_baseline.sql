-- =============================================================
-- 000: ベースライン（本番スナップショット 2026-09-04）
--
--   本番 Supabase (mrmixfzxreigbfbnires) の pg_catalog から生成。
--   004_security_hotfix 適用後の状態を「正」として起こしたもの。
--
--   新環境の再現手順:  000 → 004（004 は冪等なので二重適用しても安全）
--   以後の変更は 005 から積む。ダッシュボードで直接変更した場合は
--   必ず同じ内容のマイグレーションをここに追加すること。
--
--   旧ファイル（schema.sql / admin_schema.sql / 001〜003）は
--   supabase/_legacy/ に退避。歴史的参考のみで、実行しないこと。
-- =============================================================

-- ---------- 拡張 ----------
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ---------- テーブル ----------

create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text,
  full_name         text,
  avatar_url        text,
  address           text,               -- 番地（001 で流用）
  phone             text,
  created_at        timestamptz not null default timezone('utc'::text, now()),
  updated_at        timestamptz not null default timezone('utc'::text, now()),
  is_admin          boolean default false,
  pet_name          text,
  pet_breed         text,
  instagram_account text,
  show_instagram    boolean default true,
  postal_code       text,
  prefecture        text,
  city              text,
  building          text
);

create table if not exists public.products (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  description      text,
  price            integer not null,
  original_price   integer,
  category         text,                -- アウター/トップス/ボトムス/アクセサリー/その他
  size             text,
  color            text,
  condition        text,                -- S/A/B/C
  images           text[],
  stock            integer default 1,
  status           text default 'published',  -- published / hidden / sold_out / draft
  seller_id        uuid references auth.users(id),
  created_at       timestamptz not null default timezone('utc'::text, now()),
  updated_at       timestamptz not null default timezone('utc'::text, now()),
  seller_instagram text,
  size_chart       jsonb,
  back_length_cm   numeric,
  chest_cm         numeric,
  neck_cm          numeric,
  brand            text
);

create table if not exists public.orders (
  id                       uuid primary key default uuid_generate_v4(),
  user_id                  uuid references auth.users(id),
  status                   text default 'pending',   -- pending, paid, shipped, completed, cancelled
  total_amount             integer not null,
  shipping_address         jsonb,
  stripe_payment_intent_id text,
  created_at               timestamptz not null default timezone('utc'::text, now()),
  updated_at               timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.order_items (
  id                uuid primary key default uuid_generate_v4(),
  order_id          uuid not null references public.orders(id) on delete cascade,
  product_id        uuid references public.products(id),
  quantity          integer not null default 1,
  price_at_purchase integer not null,
  created_at        timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.favorites (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, product_id)
);

create table if not exists public.collections (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  subtitle        text,
  description     text,
  content         text,
  cover_image_url text,
  tag             text,
  sort_order      integer default 0,
  is_active       boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table if not exists public.collection_products (
  id            uuid primary key default gen_random_uuid(),
  collection_id uuid references public.collections(id) on delete cascade,
  product_id    uuid references public.products(id) on delete cascade,
  sort_order    integer default 0,
  created_at    timestamptz default now(),
  unique (collection_id, product_id)
);

create table if not exists public.recommended_products (
  id            uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  product_id    uuid not null references public.products(id) on delete cascade,
  sort_order    integer not null default 0,
  created_at    timestamptz default now(),
  unique (collection_id, product_id)
);

create table if not exists public.hero_banners (
  id         uuid primary key default gen_random_uuid(),
  title      text,
  subtitle   text,
  image_url  text not null,
  link_url   text,
  link_text  text,
  sort_order integer default 0,
  is_active  boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.news_articles (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  excerpt       text,
  content       text,
  thumbnail_url text,
  category      text default 'お知らせ',  -- お知らせ/寄付報告/新商品/イベント
  is_published  boolean default false,
  published_at  timestamptz default now(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists public.buyback_requests (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid references auth.users(id),
  name                text not null,
  email               text not null,
  phone               text,
  address             text,
  item_type           text,
  item_description    text,
  condition           text,
  purchase_date       text,
  message             text,
  status              text default 'pending',  -- pending, reviewing, accepted, rejected, completed
  estimated_price     integer,
  admin_note          text,
  created_at          timestamptz not null default timezone('utc'::text, now()),
  instagram           text,
  payout_method       text,                    -- 入金 / 寄付
  bank_name           text,
  bank_branch         text,
  bank_account_type   text,
  bank_account_number text,
  bank_account_holder text,
  user_responded_at   timestamptz
);

-- ---------- 関数 ----------

-- 会員登録時に profiles 行を自動作成（auth.users のトリガーから呼ばれる）
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, created_at, updated_at)
  values (new.id, new.email, now(), now())
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 呼び出し元が管理者かを返す。RLS ポリシーから参照される
create or replace function public.is_admin_user()
returns boolean
language sql
security definer
set search_path = 'public'
as $$
  select coalesce(is_admin, false) from profiles where id = auth.uid()
$$;

-- is_admin の自己昇格を防ぐ
create or replace function public.protect_is_admin_column()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_admin is distinct from old.is_admin then
    if auth.uid() is not null and not public.is_admin_user() then
      raise exception 'permission denied: is_admin cannot be changed by non-admin users';
    end if;
  end if;
  return new;
end;
$$;
revoke execute on function public.protect_is_admin_column() from public, anon, authenticated;

-- ---------- トリガー ----------

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists protect_is_admin on public.profiles;
create trigger protect_is_admin
  before update on public.profiles
  for each row execute function public.protect_is_admin_column();

-- ---------- RLS 有効化 ----------

alter table public.profiles             enable row level security;
alter table public.products             enable row level security;
alter table public.orders               enable row level security;
alter table public.order_items          enable row level security;
alter table public.favorites            enable row level security;
alter table public.collections          enable row level security;
alter table public.collection_products  enable row level security;
alter table public.recommended_products enable row level security;
alter table public.hero_banners         enable row level security;
alter table public.news_articles        enable row level security;
alter table public.buyback_requests     enable row level security;

-- ---------- RLS ポリシー ----------

-- profiles
drop policy if exists "Users can view own profile"     on public.profiles;
drop policy if exists "Admins can read all profiles"   on public.profiles;
drop policy if exists "Users can update own profile"   on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Users can view own profile"     on public.profiles for select using (auth.uid() = id);
create policy "Admins can read all profiles"   on public.profiles for select using (public.is_admin_user());
create policy "Users can update own profile"   on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "Admins can update all profiles" on public.profiles for update to authenticated
  using (public.is_admin_user()) with check (public.is_admin_user());

-- products
drop policy if exists "Public can view products"   on public.products;
drop policy if exists "Admins can insert products"  on public.products;
drop policy if exists "Admins can update products"  on public.products;
drop policy if exists "Admins can delete products"  on public.products;
create policy "Public can view products"  on public.products for select using (true);
create policy "Admins can insert products" on public.products for insert
  with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true));
create policy "Admins can update products" on public.products for update to authenticated
  using (public.is_admin_user()) with check (public.is_admin_user());
create policy "Admins can delete products" on public.products for delete to authenticated
  using (public.is_admin_user());

-- orders
drop policy if exists "Users can view own orders"    on public.orders;
drop policy if exists "Users can insert own orders"  on public.orders;
drop policy if exists "Admins can view all orders"   on public.orders;
drop policy if exists "Admins can update all orders" on public.orders;
create policy "Users can view own orders"    on public.orders for select using (auth.uid() = user_id);
create policy "Users can insert own orders"  on public.orders for insert with check (auth.uid() = user_id);
create policy "Admins can view all orders"   on public.orders for select
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true));
create policy "Admins can update all orders" on public.orders for update
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true));

-- order_items
drop policy if exists "Users can view own order items"   on public.order_items;
drop policy if exists "Users can insert own order items" on public.order_items;
drop policy if exists "Admins can view all order items"  on public.order_items;
create policy "Users can view own order items" on public.order_items for select
  using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
create policy "Users can insert own order items" on public.order_items for insert to authenticated
  with check (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
create policy "Admins can view all order items" on public.order_items for select
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true));

-- favorites
drop policy if exists "Users can view own favorites"   on public.favorites;
drop policy if exists "Users can insert own favorites" on public.favorites;
drop policy if exists "Users can delete own favorites" on public.favorites;
create policy "Users can view own favorites"   on public.favorites for select using (auth.uid() = user_id);
create policy "Users can insert own favorites" on public.favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete own favorites" on public.favorites for delete using (auth.uid() = user_id);

-- collections / collection_products / recommended_products
drop policy if exists "Public can read collections"   on public.collections;
drop policy if exists "Admins can manage collections" on public.collections;
create policy "Public can read collections"   on public.collections for select to anon, authenticated using (true);
create policy "Admins can manage collections" on public.collections for all to authenticated
  using (public.is_admin_user()) with check (public.is_admin_user());

drop policy if exists "Public can read collection_products"   on public.collection_products;
drop policy if exists "Admins can manage collection_products" on public.collection_products;
create policy "Public can read collection_products"   on public.collection_products for select to anon, authenticated using (true);
create policy "Admins can manage collection_products" on public.collection_products for all to authenticated
  using (public.is_admin_user()) with check (public.is_admin_user());

drop policy if exists "Public can read recommended_products"   on public.recommended_products;
drop policy if exists "Admins can manage recommended_products" on public.recommended_products;
create policy "Public can read recommended_products"   on public.recommended_products for select using (true);
create policy "Admins can manage recommended_products" on public.recommended_products for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true));

-- hero_banners / news_articles
drop policy if exists "Public can read hero_banners"   on public.hero_banners;
drop policy if exists "Admins can manage hero_banners" on public.hero_banners;
create policy "Public can read hero_banners"   on public.hero_banners for select to anon, authenticated using (true);
create policy "Admins can manage hero_banners" on public.hero_banners for all to authenticated
  using (public.is_admin_user()) with check (public.is_admin_user());

drop policy if exists "Public can read published news" on public.news_articles;
drop policy if exists "Admins can manage news"         on public.news_articles;
create policy "Public can read published news" on public.news_articles for select to anon, authenticated using (is_published = true);
create policy "Admins can manage news"         on public.news_articles for all to authenticated
  using (public.is_admin_user()) with check (public.is_admin_user());

-- buyback_requests
drop policy if exists "Anyone can insert buyback requests"     on public.buyback_requests;
drop policy if exists "Users can view own buyback requests"    on public.buyback_requests;
drop policy if exists "Admins can view all buyback requests"   on public.buyback_requests;
drop policy if exists "Admins can update buyback requests"     on public.buyback_requests;
create policy "Anyone can insert buyback requests"   on public.buyback_requests for insert with check (true);
create policy "Users can view own buyback requests"  on public.buyback_requests for select to authenticated using (auth.uid() = user_id);
create policy "Admins can view all buyback requests" on public.buyback_requests for select
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true));
create policy "Admins can update buyback requests"   on public.buyback_requests for update
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true));

-- ---------- ストレージ ----------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can view product images"   on storage.objects;
drop policy if exists "Admins can upload product images" on storage.objects;
drop policy if exists "Admins can update product images" on storage.objects;
drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Anyone can view product images" on storage.objects for select
  using (bucket_id = 'product-images');
create policy "Admins can upload product images" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin_user());
create policy "Admins can update product images" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin_user())
  with check (bucket_id = 'product-images' and public.is_admin_user());
create policy "Admins can delete product images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin_user());
