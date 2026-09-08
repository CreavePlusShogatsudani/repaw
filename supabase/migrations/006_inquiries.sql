-- =============================================================
-- 006: 問い合わせ（inquiries）＋ AI 一次対応（2026-09-08）
--
--   Readdy.ai への外部 POST を廃止し、問い合わせを自前で保持する。
--   Edge Function handle-inquiry が受け付け → Claude API が分類・回答生成。
--     question かつ confidence=high  → auto_sent（自動送信）
--     それ以外                        → pending_approval（管理者が承認して送信）
--
--   status: 'received' | 'auto_sent' | 'pending_approval' | 'approved_sent'
--   category: 'question' | 'complaint' | 'refund' | 'buyback' | 'other'
-- =============================================================

create table if not exists public.inquiries (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id),
  order_id           uuid references public.orders(id),
  subject            text not null,
  body               text not null,
  category           text,            -- AIが分類: question / complaint / refund / buyback / other
  ai_draft           text,            -- AI生成回答（下書きまたは送信済み本文）
  admin_edited_reply text,            -- 管理者が編集した最終回答（編集した場合のみ）
  status             text not null default 'received',
  created_at         timestamptz default now(),
  replied_at         timestamptz
);

create index if not exists inquiries_user_id_idx on public.inquiries (user_id);
create index if not exists inquiries_status_idx  on public.inquiries (status);

alter table public.inquiries enable row level security;

-- SELECT: 本人 or 管理者
drop policy if exists "Users can view own inquiries"   on public.inquiries;
drop policy if exists "Admins can view all inquiries"  on public.inquiries;
create policy "Users can view own inquiries"  on public.inquiries for select to authenticated
  using (auth.uid() = user_id);
create policy "Admins can view all inquiries" on public.inquiries for select to authenticated
  using (public.is_admin_user());

-- INSERT: 本人のみ（with_check を明示）
drop policy if exists "Users can insert own inquiries" on public.inquiries;
create policy "Users can insert own inquiries" on public.inquiries for insert to authenticated
  with check (auth.uid() = user_id);

-- UPDATE / DELETE: 管理者のみ。一般ユーザーには与えない。
-- ステータス遷移・返信本文の書き込みは Edge Function（service_role）か管理者のみ。
drop policy if exists "Admins can update inquiries" on public.inquiries;
drop policy if exists "Admins can delete inquiries" on public.inquiries;
create policy "Admins can update inquiries" on public.inquiries for update to authenticated
  using (public.is_admin_user()) with check (public.is_admin_user());
create policy "Admins can delete inquiries" on public.inquiries for delete to authenticated
  using (public.is_admin_user());
