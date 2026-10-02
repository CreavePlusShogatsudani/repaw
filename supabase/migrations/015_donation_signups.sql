-- =============================================================
-- 015: 寄付サイト（donate.repaw.jp）の申込（2026-10-02）
--
--   古物商の許可が下りるまで、犬服は無償の寄付だけ受け付ける。
--   寄付サイトのフォームから誰でも申し込める（ログイン不要）が、読めるのは管理者だけ。
--   受け取った申込は当面 Supabase の Table Editor で見る。
--   thanks_consent = true の人だけ、オープン時のスペシャルサンクスページに Instagram を載せる。
-- =============================================================

create table if not exists public.donation_signups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 100),
  email      text not null check (char_length(email) between 3 and 254),
  item_count text not null check (char_length(item_count) between 1 and 100),  -- 点数の目安（自由記述）
  address    text not null check (char_length(address) between 1 and 500),
  instagram  text check (char_length(instagram) <= 100),
  thanks_consent boolean not null default false,  -- オープン時のスペシャルサンクスページに Instagram を載せてよいか（本人が選んだときだけ）
  locale     text check (locale in ('ja', 'en', 'ko')),
  created_at timestamptz not null default now(),
  check (not thanks_consent or instagram is not null)  -- 掲載に同意するなら Instagram が必要
);

alter table public.donation_signups enable row level security;

-- 申込は誰でも（返り値は読まない。中身の上限は上の check で縛る）
drop policy if exists "Anyone can submit donation signups" on public.donation_signups;
create policy "Anyone can submit donation signups" on public.donation_signups for insert to anon, authenticated
  with check (true);

drop policy if exists "Admins can manage donation signups" on public.donation_signups;
create policy "Admins can manage donation signups" on public.donation_signups for all to authenticated
  using (public.is_admin_user()) with check (public.is_admin_user());
