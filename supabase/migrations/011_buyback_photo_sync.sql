-- =============================================================
-- 011: 買取の服と商品の状態を自動で同期（2026-09-10）
--
--   下書き商品（buyback_items.product_id）に写真が入ったら photographed、
--   公開されたら listed、売れたら sold に服の status を進める。
--   管理画面の「撮影待ち」リストと、マイページの「販売中 / 売れました」表示の土台。
-- =============================================================

create or replace function public.sync_buyback_item_from_product()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- 写真が入った: 撮影待ち → 撮影済み
  if coalesce(array_length(new.images, 1), 0) > 0 and coalesce(array_length(old.images, 1), 0) = 0 then
    update public.buyback_items set status = 'photographed', updated_at = now()
    where product_id = new.id and status = 'awaiting_photo';
  end if;

  -- 公開された: → 販売中
  if new.status in ('published', 'reserved') and old.status is distinct from new.status then
    update public.buyback_items set status = 'listed', updated_at = now()
    where product_id = new.id and status in ('awaiting_photo', 'photographed');
  end if;

  -- 売れた: → 売れました
  if new.status = 'sold_out' and old.status is distinct from 'sold_out' then
    update public.buyback_items set status = 'sold', updated_at = now()
    where product_id = new.id and status in ('awaiting_photo', 'photographed', 'listed');
  end if;

  return new;
end;
$$;
revoke execute on function public.sync_buyback_item_from_product() from public, anon, authenticated;

drop trigger if exists sync_buyback_item on public.products;
create trigger sync_buyback_item
  after update on public.products
  for each row execute function public.sync_buyback_item_from_product();
