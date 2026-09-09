-- =============================================================
-- 009: 「あの子のおさがり」前のオーナー（2026-09-09）
--
--   商品に「前に着ていた犬」を紐づけ、トップの特集・商品カード・商品詳細で
--   犬の写真・名前・Instagram・一言を見せる。
--   products.seller_instagram（手入力の Instagram 名）はそのまま残し、
--   オーナー未設定の商品の表示に使う。
-- =============================================================

create table if not exists public.previous_owners (
  id            uuid primary key default gen_random_uuid(),
  dog_name      text not null,           -- 例: モカ
  dog_photo_url text,                    -- Storage URL
  instagram     text,                    -- 飼い主の Instagram（@なし）
  story         text,                    -- 一言（例: 小さい頃によく着ていたパーカーです）
  is_featured   boolean not null default false,  -- トップの特集に出す
  sort_order    integer not null default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.products
  add column if not exists previous_owner_id uuid references public.previous_owners(id) on delete set null;

create index if not exists products_previous_owner_id_idx on public.products (previous_owner_id);

alter table public.previous_owners enable row level security;

drop policy if exists "Public can read previous_owners"   on public.previous_owners;
drop policy if exists "Admins can manage previous_owners" on public.previous_owners;
create policy "Public can read previous_owners"   on public.previous_owners for select to anon, authenticated using (true);
create policy "Admins can manage previous_owners" on public.previous_owners for all to authenticated
  using (public.is_admin_user()) with check (public.is_admin_user());
