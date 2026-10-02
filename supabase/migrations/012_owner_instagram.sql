-- =============================================================
-- 012: 買取に出した人の Instagram を商品ページに出す（2026-10-02）
--
--   本人がマイページで「商品ページでの表示」を ON にしたときだけ、
--   その人が買取に出した商品の詳細に Instagram を出す。
--   出すのはプロフィールの今のアカウント（変更・OFF はすぐ反映される）。
--   これまでスイッチはどこにもつながっていなかったので、全員 OFF から始める。
-- =============================================================

alter table public.profiles alter column show_instagram set default false;
update public.profiles set show_instagram = false where show_instagram is distinct from false;

-- 商品詳細が select('..., owner_instagram') で読む（PostgREST の計算カラム）。
-- profiles は本人と管理者しか読めないので、security definer で Instagram 名だけを返す。
create or replace function public.owner_instagram(p public.products)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select nullif(trim(pr.instagram_account), '')
  from public.products pd
  join public.buyback_items i on i.product_id = pd.id
  join public.buyback_requests r on r.id = i.request_id
  join public.profiles pr on pr.id = r.user_id
  where pd.id = p.id
    and pd.status in ('published', 'reserved', 'sold_out')  -- 下書きの売主は出さない
    and pr.show_instagram
  limit 1;
$$;
