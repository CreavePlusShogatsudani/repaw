-- profiles テーブルにペット情報・Instagram・住所の詳細フィールドを追加
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pet_name text,
  ADD COLUMN IF NOT EXISTS pet_breed text,
  ADD COLUMN IF NOT EXISTS instagram_account text,
  ADD COLUMN IF NOT EXISTS show_instagram boolean default true,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS prefecture text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS building text;
-- ※ 既存の address カラムを番地として流用

-- favorites テーブル（お気に入り商品）
CREATE TABLE IF NOT EXISTS favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  UNIQUE(user_id, product_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);
