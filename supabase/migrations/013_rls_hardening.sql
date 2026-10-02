-- =============================================================
-- 013: 開きすぎていた権限を閉じる（2026-10-02 の整合性監査）
--
--   ・注文 / 注文明細: 本人 INSERT を削除（注文は finalize_order だけが作る）
--   ・買取申込: ログイン中の本人が、申込の状態で、金額・回答・口座が空のときだけ作れる
--   ・商品: 誰でも読めるのは公開中・購入手続き中・売り切れだけ。下書きは管理者のみ
--   ・問い合わせ: 本人 INSERT を削除（受付は handle-inquiry が service_role で行う）
--   ・プロフィールのメール: 本人は書き換えられない（管理画面がこの値で管理者を探すため）
-- =============================================================

-- ---------- 注文 / 注文明細 ----------
drop policy if exists "Users can insert own orders"      on public.orders;
drop policy if exists "Users can insert own order items" on public.order_items;

-- ---------- 買取申込 ----------
drop policy if exists "Anyone can insert buyback requests"    on public.buyback_requests;
drop policy if exists "Users can insert own buyback requests" on public.buyback_requests;
create policy "Users can insert own buyback requests" on public.buyback_requests for insert to authenticated
  with check (
    auth.uid() = user_id
    and status = 'pending'
    and return_preference in ('donate', 'return_cod')
    and estimated_price is null and admin_note is null
    and payout_method is null and user_responded_at is null
    and bank_name is null and bank_branch is null and bank_account_type is null
    and bank_account_number is null and bank_account_holder is null
  );

-- ---------- 商品 ----------
--   管理者の判定は authenticated 側にだけ置く（未ログインの閲覧で is_admin_user() を呼ばない）
drop policy if exists "Public can view products"     on public.products;
drop policy if exists "Admins can view all products" on public.products;
create policy "Public can view products" on public.products for select to anon, authenticated
  using (status in ('published', 'reserved', 'sold_out'));
create policy "Admins can view all products" on public.products for select to authenticated
  using (public.is_admin_user());

-- ---------- 問い合わせ ----------
drop policy if exists "Users can insert own inquiries" on public.inquiries;

-- ---------- プロフィールのメール ----------
create or replace function public.protect_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email then
    if auth.uid() is not null and not public.is_admin_user() then
      raise exception 'permission denied: email cannot be changed by non-admin users';
    end if;
  end if;
  return new;
end;
$$;
revoke execute on function public.protect_profile_email() from public, anon, authenticated;

drop trigger if exists protect_profile_email on public.profiles;
create trigger protect_profile_email before update on public.profiles
  for each row execute function public.protect_profile_email();
