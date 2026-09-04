-- =============================================================
-- 004: 本番セキュリティ修正（2026-09-04）
--   003 が本番に未適用だったため、003 の内容を冪等な形で再適用し、
--   003 で漏れていた点を追加で修正する。
--     A. profiles の権限昇格（is_admin を自分で true にできる）
--     B. buyback_requests の個人情報露出（OR user_id IS NULL）
--     C. 重複ポリシーの整理
--     D. order_items に INSERT ポリシーがなく、暫定ポリシー削除後に
--        チェックアウトが落ちる問題（緊急3 でサーバー化するまでの橋渡し）
-- =============================================================

-- ---------- 003 の再適用（冪等） ----------

-- 1) 「authenticated なら誰でも書き換え可」の暫定ポリシーを削除
drop policy if exists "Authenticated users can modify products"           on public.products;
drop policy if exists "Authenticated users can manage orders"             on public.orders;
drop policy if exists "Authenticated users can manage order_items"        on public.order_items;
drop policy if exists "Authenticated users can manage collections"        on public.collections;
drop policy if exists "Authenticated users can manage collection_products" on public.collection_products;
drop policy if exists "Authenticated users can manage hero_banners"       on public.hero_banners;
drop policy if exists "Authenticated users can manage news"               on public.news_articles;

-- 2) 管理者限定の書き込みポリシー
drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products" on public.products
  for update to authenticated using (public.is_admin_user()) with check (public.is_admin_user());
drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products" on public.products
  for delete to authenticated using (public.is_admin_user());

drop policy if exists "Admins can manage collections" on public.collections;
create policy "Admins can manage collections" on public.collections
  for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());
drop policy if exists "Admins can manage collection_products" on public.collection_products;
create policy "Admins can manage collection_products" on public.collection_products
  for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());
drop policy if exists "Admins can manage hero_banners" on public.hero_banners;
create policy "Admins can manage hero_banners" on public.hero_banners
  for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());
drop policy if exists "Admins can manage news" on public.news_articles;
create policy "Admins can manage news" on public.news_articles
  for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());

-- 3) anon 限定だった公開読み取りをログインユーザーにも適用
drop policy if exists "Public can read collections" on public.collections;
create policy "Public can read collections" on public.collections
  for select to anon, authenticated using (true);
drop policy if exists "Public can read collection_products" on public.collection_products;
create policy "Public can read collection_products" on public.collection_products
  for select to anon, authenticated using (true);
drop policy if exists "Public can read hero_banners" on public.hero_banners;
create policy "Public can read hero_banners" on public.hero_banners
  for select to anon, authenticated using (true);
drop policy if exists "Public can read published news" on public.news_articles;
create policy "Public can read published news" on public.news_articles
  for select to anon, authenticated using (is_published = true);

-- 4) is_admin の自己昇格を防ぐトリガー（変更できるのは管理者と直接DB接続のみ）
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
drop trigger if exists protect_is_admin on public.profiles;
create trigger protect_is_admin before update on public.profiles
  for each row execute function public.protect_is_admin_column();

-- 5) ストレージ: 書き込みを管理者限定に
drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin_user());
drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin_user())
  with check (bucket_id = 'product-images' and public.is_admin_user());
drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin_user());

-- 6) handle_new_user: search_path 固定 + RPC 実行権限の剥奪（トリガー経由でのみ動く）
alter function public.handle_new_user() set search_path = '';
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------- 003 に無かった追加修正 ----------

-- A) profiles UPDATE に with_check を明示。is_admin 自体は 4) のトリガーで保護
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles" on public.profiles
  for update to authenticated using (public.is_admin_user()) with check (public.is_admin_user());

-- B) buyback_requests: 「OR user_id IS NULL」で未ログイン申込の全件が
--    ログインユーザー全員に見えていた。自分の申込のみに限定。
--    （response.tsx は元から user_id = 自分 で絞っているので挙動は変わらない）
drop policy if exists "Users can view own buyback requests" on public.buyback_requests;
create policy "Users can view own buyback requests" on public.buyback_requests
  for select to authenticated using (auth.uid() = user_id);

-- C) 重複ポリシーの整理（同内容が2本あったものを1本に）
drop policy if exists "Public can read products"   on public.products;  -- "Public can view products"(public) が残る
drop policy if exists "Users can read own profile" on public.profiles;  -- "Users can view own profile" が残る

-- D) order_items: 1) で暫定ポリシーを消すと INSERT 手段がなくなり、
--    現行のクライアント側 createOrder() が落ちる。自分の注文に属する明細のみ
--    INSERT できるポリシーを置いて橋渡しする。緊急3 のサーバー化で不要になる。
drop policy if exists "Users can insert own order items" on public.order_items;
create policy "Users can insert own order items" on public.order_items
  for insert to authenticated
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );
