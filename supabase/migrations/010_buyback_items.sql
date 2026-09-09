-- =============================================================
-- 010: 買取フローの作り直し（送付型・服1点ごとの査定）2026-09-10
--
--   1申込に複数の服が入る前提で、服1点ごとのテーブル buyback_items を追加。
--   申込（buyback_requests）はキット送付・到着・入金の日時と、
--   買取不可や不同意のときの扱い（return_preference）を持つ。
--   ユーザーに見せない情報（状態の所見・AI の生出力・販売価格）は
--   buyback_item_internal に分け、管理者だけが読める。
--
--   申込 status: pending → kit_sent → received → quoted → accepted → completed
--                途中で returned（返送）/ rejected（全点買取不可）
--   服 status:   pending → appraised → accepted → awaiting_photo → photographed → listed → sold
--                買取不可は rejected
-- =============================================================

-- ---------- 申込: 送付型の日時と扱い ----------
alter table public.buyback_requests
  add column if not exists kit_sent_at       timestamptz,
  add column if not exists received_at       timestamptz,
  add column if not exists paid_at           timestamptz,
  add column if not exists return_preference text not null default 'donate';  -- donate / return_cod

-- ---------- 服1点（ユーザーに見せる列） ----------
create table if not exists public.buyback_items (
  id                 uuid primary key default gen_random_uuid(),
  request_id         uuid not null references public.buyback_requests(id) on delete cascade,
  sort_order         integer not null default 0,
  intake_photos      text[] not null default '{}',   -- 到着時にスタッフが撮影（本人には見せる）
  has_tag            boolean,
  brand              text,
  item_type          text,                           -- 種類（パーカー / ワンピース など）
  color              text,
  size_label         text,                           -- タグのサイズ表記
  material           text,
  back_length_cm     numeric,
  chest_cm           numeric,
  neck_cm            numeric,
  rank               text,                           -- A / B / C
  appraisal_comment  text,                           -- ユーザーに見せる一言
  decision           text,                           -- buyable / not_buyable
  reject_reason      text,
  buyback_price      integer,
  product_id         uuid references public.products(id) on delete set null,
  status             text not null default 'pending',
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
create index if not exists buyback_items_request_id_idx on public.buyback_items (request_id);
create index if not exists buyback_items_status_idx     on public.buyback_items (status);

-- ---------- 服1点（社内だけの列） ----------
create table if not exists public.buyback_item_internal (
  item_id         uuid primary key references public.buyback_items(id) on delete cascade,
  condition_notes text,       -- 状態の所見（社内メモ）
  ai_reading      jsonb,      -- AI 読み取りの生出力
  sale_price      integer,    -- 販売予定価格
  updated_at      timestamptz default now()
);

-- ---------- RLS ----------
alter table public.buyback_items         enable row level security;
alter table public.buyback_item_internal enable row level security;

drop policy if exists "Users can view own buyback items"  on public.buyback_items;
drop policy if exists "Admins can manage buyback items"   on public.buyback_items;
create policy "Users can view own buyback items" on public.buyback_items for select to authenticated
  using (exists (select 1 from public.buyback_requests r where r.id = buyback_items.request_id and r.user_id = auth.uid()));
create policy "Admins can manage buyback items"  on public.buyback_items for all to authenticated
  using (public.is_admin_user()) with check (public.is_admin_user());

drop policy if exists "Admins can manage buyback item internal" on public.buyback_item_internal;
create policy "Admins can manage buyback item internal" on public.buyback_item_internal for all to authenticated
  using (public.is_admin_user()) with check (public.is_admin_user());

-- ---------- 既存の申込を 1申込 = 1点 として移行 ----------
insert into public.buyback_items (request_id, item_type, rank, buyback_price, decision, status, created_at)
select r.id,
       r.item_type,
       case when r.condition in ('A', 'B', 'C') then r.condition else null end,
       r.estimated_price,
       case when r.status = 'rejected' then 'not_buyable'
            when r.estimated_price is not null then 'buyable'
            else null end,
       case r.status
         when 'rejected'  then 'rejected'
         when 'quoted'    then 'appraised'
         when 'accepted'  then 'accepted'
         when 'completed' then 'accepted'
         else 'pending' end,
       r.created_at
from public.buyback_requests r
where not exists (select 1 from public.buyback_items i where i.request_id = r.id);

-- ---------- 査定回答 RPC を作り直す ----------
--   payout_method: donate（寄付）/ transfer（振込）/ return（納得できないので全点を着払いで返送）
--   accepted のとき、買取可の服を awaiting_photo にし、下書き商品を自動作成して紐づける
drop function if exists public.respond_buyback(uuid, text, text, text, text, text, text);
create or replace function public.respond_buyback(
  p_id                  uuid,
  p_payout_method       text,
  p_bank_name           text default null,
  p_bank_branch         text default null,
  p_bank_account_type   text default null,
  p_bank_account_number text default null,
  p_bank_account_holder text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_transfer boolean := p_payout_method = 'transfer';
  v_item     record;
  v_product  uuid;
begin
  if auth.uid() is null then
    raise exception 'UNAUTHORIZED';
  end if;
  if p_payout_method not in ('donate', 'transfer', 'return') then
    raise exception 'INVALID_PAYOUT_METHOD';
  end if;
  if v_transfer and (
    coalesce(p_bank_name, '') = '' or coalesce(p_bank_branch, '') = '' or
    coalesce(p_bank_account_number, '') = '' or coalesce(p_bank_account_holder, '') = ''
  ) then
    raise exception 'BANK_INFO_REQUIRED';
  end if;

  update public.buyback_requests
  set payout_method       = case when p_payout_method = 'return' then null else p_payout_method end,
      status              = case when p_payout_method = 'return' then 'returned' else 'accepted' end,
      user_responded_at   = now(),
      bank_name           = case when v_transfer then p_bank_name           else null end,
      bank_branch         = case when v_transfer then p_bank_branch         else null end,
      bank_account_type   = case when v_transfer then p_bank_account_type   else null end,
      bank_account_number = case when v_transfer then p_bank_account_number else null end,
      bank_account_holder = case when v_transfer then p_bank_account_holder else null end
  where id = p_id
    and user_id = auth.uid()
    and status = 'quoted';

  if not found then
    raise exception 'NOT_RESPONDABLE';
  end if;

  if p_payout_method = 'return' then
    update public.buyback_items set status = 'returned', updated_at = now()
    where request_id = p_id and status = 'appraised';
    return;
  end if;

  -- 買取可の服: 撮影待ちにし、下書き商品を作って紐づける
  for v_item in
    select i.*, n.sale_price
    from public.buyback_items i
    left join public.buyback_item_internal n on n.item_id = i.id
    where i.request_id = p_id and i.status = 'appraised' and i.decision = 'buyable'
  loop
    insert into public.products (name, description, price, category, size, color, condition, brand,
                                 back_length_cm, chest_cm, neck_cm, images, stock, status)
    values (
      trim(coalesce(v_item.color, '') || ' ' || coalesce(v_item.item_type, '犬服')),
      v_item.appraisal_comment,
      coalesce(v_item.sale_price, 0),
      null,
      v_item.size_label,
      v_item.color,
      v_item.rank,
      v_item.brand,
      v_item.back_length_cm, v_item.chest_cm, v_item.neck_cm,
      '{}', 1, 'draft'
    )
    returning id into v_product;

    update public.buyback_items
    set status = 'awaiting_photo', product_id = v_product, updated_at = now()
    where id = v_item.id;
  end loop;
end;
$$;

revoke execute on function public.respond_buyback(uuid, text, text, text, text, text, text) from public, anon;
grant  execute on function public.respond_buyback(uuid, text, text, text, text, text, text) to authenticated;
