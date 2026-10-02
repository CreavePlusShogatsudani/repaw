-- =============================================================
-- 016: 寄付の申込を管理画面（/admin/donations）で扱う（2026-10-02）
--
--   status: new（新規・要対応）→ contacted（送り先を案内済み）→ received（到着済み）/ cancelled
--   admin_note: 社内メモ。読み書きは管理者だけ（015 の "Admins can manage" ポリシー）
--   寄付サイトのフォームからは「新規」としてしか作れない（状態・メモは書けない）
-- =============================================================

alter table public.donation_signups
  add column if not exists status     text not null default 'new',
  add column if not exists admin_note text,
  add column if not exists updated_at timestamptz;

alter table public.donation_signups drop constraint if exists donation_signups_status_check;
alter table public.donation_signups add constraint donation_signups_status_check
  check (status in ('new', 'contacted', 'received', 'cancelled'));

drop policy if exists "Anyone can submit donation signups" on public.donation_signups;
create policy "Anyone can submit donation signups" on public.donation_signups for insert to anon, authenticated
  with check (status = 'new' and admin_note is null and updated_at is null);
