-- 買取申込テーブル
CREATE TABLE IF NOT EXISTS buyback_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  name text not null,
  email text not null,
  phone text,
  address text,
  item_type text,
  item_description text,
  condition text,
  purchase_date text,
  message text,
  status text default 'pending', -- pending, reviewing, completed, rejected
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE buyback_requests ENABLE ROW LEVEL SECURITY;

-- 誰でも申込可能（未ログインも含む）
CREATE POLICY "Anyone can insert buyback requests" ON buyback_requests
  FOR INSERT WITH CHECK (true);

-- ログインユーザーは自分の申込を閲覧可能
CREATE POLICY "Users can view own buyback requests" ON buyback_requests
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- 管理者は全件閲覧・更新可能
CREATE POLICY "Admins can view all buyback requests" ON buyback_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY "Admins can update buyback requests" ON buyback_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );
