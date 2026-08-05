-- =============================================================
-- 003: RLSセキュリティ修正（2026-08 リリース前監査対応）
--   1. 「authenticated なら誰でも書き換え可」の暫定ポリシーを削除
--   2. 管理者限定の書き込みポリシーに置き換え
--   3. anonロール限定だった公開読み取りをログインユーザーにも適用
--   4. profiles.is_admin の自己昇格を防ぐトリガー
--   5. ストレージ書き込みを管理者限定に
--   6. handle_new_user の search_path 固定・RPC実行権限剥奪
-- =============================================================

-- 1) 会員登録すれば誰でも書き換え可能だった暫定ポリシーを削除
drop policy "Authenticated users can modify products" on public.products;
drop policy "Authenticated users can manage orders" on public.orders;
drop policy "Authenticated users can manage order_items" on public.order_items;
drop policy "Authenticated users can manage collections" on public.collections;
drop policy "Authenticated users can manage collection_products" on public.collection_products;
drop policy "Authenticated users can manage hero_banners" on public.hero_banners;
drop policy "Authenticated users can manage news" on public.news_articles;

-- 2) 管理者限定の書き込みポリシーで置き換え
create policy "Admins can update products" on public.products
  for update to authenticated using (public.is_admin_user()) with check (public.is_admin_user());
create policy "Admins can delete products" on public.products
  for delete to authenticated using (public.is_admin_user());
create policy "Admins can manage collections" on public.collections
  for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());
create policy "Admins can manage collection_products" on public.collection_products
  for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());
create policy "Admins can manage hero_banners" on public.hero_banners
  for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());
create policy "Admins can manage news" on public.news_articles
  for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());

-- 3) anonロール限定だった公開読み取りポリシーを、ログインユーザーにも適用
--    （これがないと暫定ポリシー削除後、ログイン中はバナー・特集・ニュースが非表示になる）
drop policy "Public can read collections" on public.collections;
create policy "Public can read collections" on public.collections
  for select to anon, authenticated using (true);
drop policy "Public can read collection_products" on public.collection_products;
create policy "Public can read collection_products" on public.collection_products
  for select to anon, authenticated using (true);
drop policy "Public can read hero_banners" on public.hero_banners;
create policy "Public can read hero_banners" on public.hero_banners
  for select to anon, authenticated using (true);
drop policy "Public can read published news" on public.news_articles;
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

-- 5) ストレージ: アップロードを管理者限定に。管理画面用に更新・削除も管理者に付与
drop policy "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin_user());
create policy "Admins can update product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and public.is_admin_user()) with check (bucket_id = 'product-images' and public.is_admin_user());
create policy "Admins can delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin_user());

-- 6) handle_new_user: search_path固定 + RPC実行権限の剥奪
alter function public.handle_new_user() set search_path = '';
revoke execute on function public.handle_new_user() from public, anon, authenticated;
