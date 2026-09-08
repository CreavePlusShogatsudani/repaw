-- =============================================================
-- 008: 会員登録時のペット情報を profiles に反映（2026-09-08）
--
--   signup 画面は pet_name / pet_breed を auth.signUp の metadata で送るが、
--   handle_new_user は id / email しか入れておらず、クライアントからの
--   profiles INSERT も RLS で失敗するため、登録時の入力が消えていた。
-- =============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, pet_name, pet_breed, created_at, updated_at)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data->>'pet_name', ''),
    nullif(new.raw_user_meta_data->>'pet_breed', ''),
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
