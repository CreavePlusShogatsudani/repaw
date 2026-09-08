-- =============================================================
-- 007: 買取の査定回答を保存できるようにする（2026-09-08）
--
--   buyback_requests の UPDATE ポリシーは管理者のみのため、
--   ユーザーが /buyback/response/:id で「寄付 / 振込」を選んでも
--   RLS により 0 行更新となり保存されていなかった。
--   一般ユーザーに UPDATE 権限を開放すると estimated_price 等も
--   書き換え可能になるため、回答専用の RPC（security definer）で受ける。
-- =============================================================

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
begin
  if auth.uid() is null then
    raise exception 'UNAUTHORIZED';
  end if;
  if p_payout_method not in ('donate', 'transfer') then
    raise exception 'INVALID_PAYOUT_METHOD';
  end if;
  if v_transfer and (
    coalesce(p_bank_name, '') = '' or coalesce(p_bank_branch, '') = '' or
    coalesce(p_bank_account_number, '') = '' or coalesce(p_bank_account_holder, '') = ''
  ) then
    raise exception 'BANK_INFO_REQUIRED';
  end if;

  -- 本人の申込で、査定額提示済み（quoted）のものだけ回答できる
  update public.buyback_requests
  set payout_method       = p_payout_method,
      status              = 'accepted',
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
end;
$$;

revoke execute on function public.respond_buyback(uuid, text, text, text, text, text, text) from public, anon;
grant  execute on function public.respond_buyback(uuid, text, text, text, text, text, text) to authenticated;
