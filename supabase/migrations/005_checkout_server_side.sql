-- =============================================================
-- 005: 決済のサーバー化（2026-09-04）
--
--   ブラウザが金額・注文・在庫を決めていた構造を、以下に置き換える。
--     1. begin_checkout()  … Edge Function から。価格/送料をDBで計算し、
--                            商品を15分間「予約」して二重販売を防ぐ
--     2. checkout_sessions … PaymentIntent ごとの購入内容（商品・住所・金額）
--     3. finalize_order()  … Stripe Webhook から。注文＋明細＋sold_out を
--                            1トランザクションで確定。冪等
--     4. release_checkout() … 決済失敗/キャンセル時に予約を解放
--     5. release_expired_reservations() … 期限切れ予約を毎分解放（pg_cron）
--
--   これらの関数は service_role（Edge Function）専用。anon/authenticated からは呼べない。
-- =============================================================

-- ---------- products: 予約用カラム ----------
alter table public.products
  add column if not exists reserved_until timestamptz,
  add column if not exists reserved_by    uuid references auth.users(id);

create index if not exists products_reserved_until_idx
  on public.products (reserved_until) where status = 'reserved';

-- ---------- orders: PaymentIntent ID の一意性（冪等性の土台） ----------
create unique index if not exists orders_stripe_payment_intent_id_key
  on public.orders (stripe_payment_intent_id) where stripe_payment_intent_id is not null;

-- ---------- checkout_sessions ----------
create table if not exists public.checkout_sessions (
  id                uuid primary key default gen_random_uuid(),
  payment_intent_id text not null unique,
  user_id           uuid not null references auth.users(id),
  product_ids       uuid[] not null,
  subtotal          integer not null,
  shipping_fee      integer not null,
  total_amount      integer not null,
  shipping_address  jsonb not null,
  status            text not null default 'pending',   -- pending / completed / failed
  order_id          uuid references public.orders(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
alter table public.checkout_sessions enable row level security;

drop policy if exists "Users can view own checkout sessions" on public.checkout_sessions;
create policy "Users can view own checkout sessions" on public.checkout_sessions
  for select to authenticated using (auth.uid() = user_id);
-- 書き込みポリシーは置かない = クライアントからは insert/update/delete 不可。service_role のみ。

-- ---------- 送料ルール（唯一の定義） ----------
create or replace function public.calc_shipping_fee(p_subtotal integer)
returns integer
language sql
immutable
as $$
  select case when p_subtotal >= 5000 then 0 else 500 end
$$;

-- ---------- begin_checkout ----------
create or replace function public.begin_checkout(
  p_user_id         uuid,
  p_product_ids     uuid[],
  p_reserve_minutes integer default 15
)
returns table (subtotal integer, shipping_fee integer, total_amount integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ids      uuid[];
  v_count    integer;
  v_subtotal integer;
begin
  select array_agg(distinct x) into v_ids from unnest(p_product_ids) as x;
  if v_ids is null or array_length(v_ids, 1) = 0 then
    raise exception 'EMPTY_CART';
  end if;
  if array_length(v_ids, 1) > 20 then
    raise exception 'TOO_MANY_ITEMS';
  end if;

  -- 行ロックして確保。published か、期限切れ or 自分自身の予約だけを対象にする。
  -- 他トランザクションがロック中の行は skip locked で対象外 → 件数不足 → SOLD_OUT。
  with target as (
    select id from public.products
    where id = any(v_ids)
      and (
        status = 'published'
        or (status = 'reserved' and (reserved_until < now() or reserved_by = p_user_id))
      )
    for update skip locked
  ),
  upd as (
    update public.products p
    set status         = 'reserved',
        reserved_by    = p_user_id,
        reserved_until = now() + make_interval(mins => p_reserve_minutes),
        updated_at     = now()
    from target
    where p.id = target.id
    returning p.price
  )
  select count(*), coalesce(sum(price), 0)::integer into v_count, v_subtotal from upd;

  if v_count <> array_length(v_ids, 1) then
    raise exception 'SOLD_OUT';   -- 例外でロールバックされ、上の UPDATE も取り消される
  end if;

  return query
    select v_subtotal,
           public.calc_shipping_fee(v_subtotal),
           v_subtotal + public.calc_shipping_fee(v_subtotal);
end;
$$;

-- ---------- finalize_order（Webhook: payment_intent.succeeded） ----------
create or replace function public.finalize_order(p_payment_intent_id text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  s          public.checkout_sessions%rowtype;
  v_order_id uuid;
begin
  select * into s from public.checkout_sessions
  where payment_intent_id = p_payment_intent_id
  for update;

  if not found then
    raise exception 'SESSION_NOT_FOUND';
  end if;
  if s.status = 'completed' then
    return s.order_id;           -- 同じ Webhook が2回来ても二重注文しない
  end if;

  insert into public.orders (user_id, status, total_amount, shipping_address, stripe_payment_intent_id)
  values (s.user_id, 'paid', s.total_amount, s.shipping_address, p_payment_intent_id)
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, quantity, price_at_purchase)
  select v_order_id, p.id, 1, p.price
  from public.products p
  where p.id = any(s.product_ids);

  update public.products
  set status = 'sold_out', stock = 0, reserved_by = null, reserved_until = null, updated_at = now()
  where id = any(s.product_ids);

  update public.checkout_sessions
  set status = 'completed', order_id = v_order_id, updated_at = now()
  where id = s.id;

  return v_order_id;
end;
$$;

-- ---------- release_checkout（Webhook: payment_failed / canceled） ----------
create or replace function public.release_checkout(p_payment_intent_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  s public.checkout_sessions%rowtype;
begin
  select * into s from public.checkout_sessions
  where payment_intent_id = p_payment_intent_id
  for update;

  if not found or s.status <> 'pending' then
    return;
  end if;

  update public.products
  set status = 'published', reserved_by = null, reserved_until = null, updated_at = now()
  where id = any(s.product_ids)
    and status = 'reserved'
    and reserved_by = s.user_id;

  update public.checkout_sessions
  set status = 'failed', updated_at = now()
  where id = s.id;
end;
$$;

-- ---------- release_expired_reservations（pg_cron 毎分） ----------
create or replace function public.release_expired_reservations()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  with upd as (
    update public.products
    set status = 'published', reserved_by = null, reserved_until = null, updated_at = now()
    where status = 'reserved' and reserved_until < now()
    returning 1
  )
  select count(*) into v_count from upd;
  return v_count;
end;
$$;

-- ---------- 実行権限: service_role のみ ----------
revoke execute on function public.begin_checkout(uuid, uuid[], integer)   from public, anon, authenticated;
revoke execute on function public.finalize_order(text)                    from public, anon, authenticated;
revoke execute on function public.release_checkout(text)                  from public, anon, authenticated;
revoke execute on function public.release_expired_reservations()          from public, anon, authenticated;

-- ---------- pg_cron: 期限切れ予約を毎分解放 ----------
create extension if not exists pg_cron;
select cron.schedule(
  'release-expired-reservations',
  '* * * * *',
  $$ select public.release_expired_reservations(); $$
);
