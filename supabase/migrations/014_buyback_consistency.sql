-- =============================================================
-- 014: 買取と商品の状態の整合（2026-10-02 の整合性監査）
--
--   ・返送した日時 returned_at を記録する（全点返送・買取不可の返送の漏れを防ぐ）
--   ・全点返送を選んだら、買取不可の服も returned にする
--   ・下書き商品の説明に「本人に見せる一言」をコピーしない
--   ・服の status を商品の状態から決める（下書きに戻す・売り切れを戻すにも追従）
--   ・買取の服や注文に紐づく商品は削除できない（下書きに戻して使う）
--   ・廃止した申込 status（kit_sent / reviewing）を今の流れに寄せる
-- =============================================================

alter table public.buyback_requests add column if not exists returned_at timestamptz;

-- ---------- 査定回答 RPC（010 から: 返送時に買取不可の服も returned、説明は空で作る） ----------
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

  -- 全点返送: 買取不可の服も一緒に返す
  if p_payout_method = 'return' then
    update public.buyback_items set status = 'returned', updated_at = now()
    where request_id = p_id and status in ('appraised', 'rejected');
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
      null,  -- 商品説明は撮影時に書く（appraisal_comment は売主向けの文なので使わない）
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

-- 既に全点返送になっている申込の買取不可の服
update public.buyback_items i set status = 'returned', updated_at = now()
from public.buyback_requests r
where r.id = i.request_id and r.status = 'returned' and i.status = 'rejected';

-- ---------- 商品 → 服の status（011 を置き換え） ----------
--   写真なし → awaiting_photo / 写真あり・下書き → photographed / 公開・手続き中 → listed / 売り切れ → sold
create or replace function public.sync_buyback_item_from_product()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text := case
    when new.status = 'sold_out' then 'sold'
    when new.status in ('published', 'reserved') then 'listed'
    when coalesce(array_length(new.images, 1), 0) > 0 then 'photographed'
    else 'awaiting_photo'
  end;
begin
  update public.buyback_items set status = v_status, updated_at = now()
  where product_id = new.id
    and status in ('awaiting_photo', 'photographed', 'listed', 'sold')
    and status <> v_status;
  return new;
end;
$$;
revoke execute on function public.sync_buyback_item_from_product() from public, anon, authenticated;

-- ---------- 買取の服に紐づく商品は削除させない ----------
alter table public.buyback_items drop constraint if exists buyback_items_product_id_fkey;
alter table public.buyback_items add constraint buyback_items_product_id_fkey
  foreign key (product_id) references public.products(id) on delete restrict;

-- ---------- 廃止した申込 status ----------
update public.buyback_requests set status = 'pending'  where status = 'kit_sent';   -- 発送待ち = 今の申込
update public.buyback_requests set status = 'received' where status = 'reviewing';  -- 査定中 = 到着・査定中
