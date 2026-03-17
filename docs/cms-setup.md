# RePaw CMS・バックエンド設計書

## 1. システム構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                         フロントエンド                           │
│                    React + Vite + Tailwind                      │
│                      (現在のデザイン維持)                         │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│   microCMS    │      │   Supabase    │      │    Stripe     │
│               │      │               │      │   (決済)      │
│ コンテンツ管理  │      │ トランザクション │      │               │
│ ・商品情報     │      │ ・会員管理     │      │ ・カード決済   │
│ ・ニュース     │      │ ・注文管理     │      │ ・Webhook     │
│ ・特集記事     │      │ ・買取管理     │      │               │
│ ・FAQ         │      │ ・カート       │      │               │
│ ・マスタデータ  │      │ ・お気に入り   │      │               │
└───────────────┘      └───────────────┘      └───────────────┘
```

---

## 2. microCMS セットアップ手順

### 2.1 アカウント作成

1. https://microcms.io/ にアクセス
2. 「無料ではじめる」をクリック
3. メールアドレスで登録（GitHub連携も可）
4. サービス名: `repaw` で作成

### 2.2 API作成手順

#### API 1: breeds（犬種マスタ）- 最初に作成

1. 「APIを作成」→「リスト形式」を選択
2. API名: `犬種` / エンドポイント: `breeds`
3. スキーマ設定:

| フィールド名 | フィールドID | 種類 | 必須 |
|------------|------------|------|-----|
| 犬種名 | name | テキストフィールド | ○ |
| アイコン | icon | 画像 | - |

4. 初期データ投入:
   - 柴犬
   - トイプードル
   - ゴールデンレトリバー
   - コーギー
   - ラブラドール
   - フレンチブルドッグ
   - ボーダーコリー
   - ミニチュアピンシャー
   - ポメラニアン
   - チワワ
   - ビーグル
   - シベリアンハスキー
   - ヨークシャーテリア
   - ダックスフンド
   - パグ
   - シェットランドシープドッグ

---

#### API 2: brands（ブランドマスタ）

1. 「APIを作成」→「リスト形式」
2. API名: `ブランド` / エンドポイント: `brands`
3. スキーマ:

| フィールド名 | フィールドID | 種類 | 必須 |
|------------|------------|------|-----|
| ブランド名 | name | テキストフィールド | ○ |
| ロゴ | logo | 画像 | - |
| 説明 | description | テキストエリア | - |

---

#### API 3: sellers（出品者）

1. 「APIを作成」→「リスト形式」
2. API名: `出品者` / エンドポイント: `sellers`
3. スキーマ:

| フィールド名 | フィールドID | 種類 | 必須 |
|------------|------------|------|-----|
| 名前 | name | テキストフィールド | ○ |
| Instagram | instagram | テキストフィールド | - |
| アバター | avatar | 画像 | ○ |

---

#### API 4: products（商品）- メインAPI

1. 「APIを作成」→「リスト形式」
2. API名: `商品` / エンドポイント: `products`
3. スキーマ:

| フィールド名 | フィールドID | 種類 | 必須 | 備考 |
|------------|------------|------|-----|------|
| 商品名 | name | テキストフィールド | ○ | |
| 販売価格 | price | 数値 | ○ | |
| 定価 | originalPrice | 数値 | ○ | |
| 商品画像 | images | 画像（複数） | ○ | |
| 商品説明 | description | リッチエディタ | - | |
| カテゴリ | category | セレクトフィールド | ○ | アウター,ニット,Tシャツ,アクセサリー |
| サイズ | size | セレクトフィールド | ○ | S,M,L,XL,フリー |
| 状態ランク | condition | セレクトフィールド | ○ | A,B,C |
| 色 | color | セレクトフィールド | ○ | ブラウン,クリーム,ブルー,ネイビー,イエロー,グレー,レッド,ホワイト,ブラック,ピンク |
| 対応犬種 | breed | コンテンツ参照(breeds) | - | |
| ブランド | brand | コンテンツ参照(brands) | - | |
| 販売状態 | status | セレクトフィールド | ○ | 販売中,売切,非公開 |
| 出品者 | seller | コンテンツ参照(sellers) | - | |
| 買取ID | buybackId | テキストフィールド | - | Supabaseの買取IDと紐付け |

---

#### API 5: news（ニュース）

1. 「APIを作成」→「リスト形式」
2. API名: `ニュース` / エンドポイント: `news`
3. スキーマ:

| フィールド名 | フィールドID | 種類 | 必須 | 備考 |
|------------|------------|------|-----|------|
| タイトル | title | テキストフィールド | ○ | |
| カテゴリ | category | セレクトフィールド | ○ | お知らせ,寄付報告,新商品,イベント |
| サムネイル | thumbnail | 画像 | ○ | |
| 概要 | excerpt | テキストエリア | ○ | |
| 本文 | content | リッチエディタ | ○ | |
| 公開日 | publishedAt | 日時 | ○ | |

---

#### API 6: features（特集記事）

1. 「APIを作成」→「リスト形式」
2. API名: `特集` / エンドポイント: `features`
3. スキーマ:

| フィールド名 | フィールドID | 種類 | 必須 |
|------------|------------|------|-----|
| タイトル | title | テキストフィールド | ○ |
| サムネイル | thumbnail | 画像 | ○ |
| 概要 | excerpt | テキストエリア | ○ |
| 本文 | content | リッチエディタ | ○ |
| 関連商品 | relatedProducts | コンテンツ参照(products・複数) | - |
| 公開日 | publishedAt | 日時 | ○ |

---

#### API 7: faq（よくある質問）

1. 「APIを作成」→「リスト形式」
2. API名: `FAQ` / エンドポイント: `faq`
3. スキーマ:

| フィールド名 | フィールドID | 種類 | 必須 | 備考 |
|------------|------------|------|-----|------|
| 質問 | question | テキストフィールド | ○ | |
| 回答 | answer | リッチエディタ | ○ | |
| カテゴリ | category | セレクトフィールド | ○ | 購入について,買取について,配送について,その他 |
| 表示順 | order | 数値 | ○ | |

---

#### API 8: donations（寄付実績）

1. 「APIを作成」→「リスト形式」
2. API名: `寄付実績` / エンドポイント: `donations`
3. スキーマ:

| フィールド名 | フィールドID | 種類 | 必須 |
|------------|------------|------|-----|
| 団体名 | organizationName | テキストフィールド | ○ |
| ロゴ | logo | 画像 | - |
| 寄付額 | amount | 数値 | ○ |
| 寄付日 | donatedAt | 日付 | ○ |
| 説明 | description | テキストエリア | - |

---

#### API 9: siteSettings（サイト設定）

1. 「APIを作成」→「オブジェクト形式」（リストではない！）
2. API名: `サイト設定` / エンドポイント: `site-settings`
3. スキーマ:

| フィールド名 | フィールドID | 種類 | 備考 |
|------------|------------|------|------|
| リユース商品数 | totalProducts | 数値 | インパクト表示用 |
| 累計寄付金額 | totalDonation | 数値 | インパクト表示用 |
| CO2削減量(kg) | co2Reduction | 数値 | インパクト表示用 |
| 支援した保護犬数 | rescuedDogs | 数値 | インパクト表示用 |
| お知らせバナー | announcementBanner | テキストフィールド | トップページ用 |
| バナー表示 | showBanner | 真偽値 | |

---

### 2.3 APIキー取得

1. サービス設定 → API-KEY
2. 以下のキーをメモ:
   - `X-MICROCMS-API-KEY`: 取得したAPIキー
   - サービスドメイン: `repaw.microcms.io`

### 2.4 環境変数設定

プロジェクトルートに `.env` ファイルを作成:

```env
# microCMS
VITE_MICROCMS_SERVICE_DOMAIN=repaw
VITE_MICROCMS_API_KEY=your-api-key-here
```

---

## 3. Supabase テーブル設計

### 3.1 アカウント作成

1. https://supabase.com/ にアクセス
2. GitHubアカウントでサインイン
3. 新規プロジェクト作成:
   - Organization: 新規作成 or 既存選択
   - Project name: `repaw`
   - Database Password: 安全なパスワードを設定
   - Region: `Northeast Asia (Tokyo)`

### 3.2 テーブル作成SQL

SQL Editorで以下を実行:

```sql
-- ========================================
-- 1. ユーザープロフィール
-- ========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  phone TEXT,
  postal_code TEXT,
  prefecture TEXT,
  city TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ポリシー: 自分のプロフィールのみ参照・更新可能
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ========================================
-- 2. カート
-- ========================================
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL, -- microCMSの商品ID
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart" ON cart_items
  FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- 3. お気に入り
-- ========================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL, -- microCMSの商品ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- 4. 注文
-- ========================================
CREATE TYPE order_status AS ENUM (
  'pending',      -- 支払い待ち
  'paid',         -- 支払い完了
  'processing',   -- 発送準備中
  'shipped',      -- 発送済み
  'delivered',    -- 配達完了
  'cancelled'     -- キャンセル
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status order_status DEFAULT 'pending',

  -- 配送先情報（注文時点でスナップショット）
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_prefecture TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_address_line1 TEXT NOT NULL,
  shipping_address_line2 TEXT,

  -- 金額
  subtotal INTEGER NOT NULL,
  shipping_fee INTEGER DEFAULT 0,
  total INTEGER NOT NULL,

  -- 決済情報
  payment_method TEXT, -- 'card', 'convenience', 'bank'
  stripe_payment_intent_id TEXT,

  -- 配送情報
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 5. 注文明細
-- ========================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL, -- microCMSの商品ID

  -- 注文時点の商品情報スナップショット
  product_name TEXT NOT NULL,
  product_price INTEGER NOT NULL,
  product_image_url TEXT,
  quantity INTEGER DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- ========================================
-- 6. 買取申込
-- ========================================
CREATE TYPE buyback_status AS ENUM (
  'submitted',      -- 申込済み
  'kit_sent',       -- キット発送済み
  'received',       -- 商品受領
  'assessing',      -- 査定中
  'assessed',       -- 査定完了（承認待ち）
  'approved',       -- ユーザー承認
  'rejected',       -- ユーザー拒否（返送）
  'paid',           -- 入金完了
  'listed',         -- 商品化完了
  'cancelled'       -- キャンセル
);

CREATE TABLE buyback_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request_number TEXT UNIQUE NOT NULL,
  status buyback_status DEFAULT 'submitted',

  -- 申込者情報
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  prefecture TEXT NOT NULL,
  city TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,

  -- 商品情報（申込時）
  item_description TEXT,
  item_category TEXT,
  item_condition TEXT,
  item_images TEXT[], -- 画像URLの配列

  -- 査定情報
  assessed_price INTEGER,
  assessed_at TIMESTAMPTZ,
  assessor_note TEXT,

  -- 入金情報
  bank_name TEXT,
  bank_branch TEXT,
  account_type TEXT,
  account_number TEXT,
  account_holder TEXT,
  paid_at TIMESTAMPTZ,

  -- microCMS商品ID（商品化後）
  product_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE buyback_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own buyback requests" ON buyback_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert buyback requests" ON buyback_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own buyback requests" ON buyback_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- 7. 商品在庫状態（microCMSと同期）
-- ========================================
CREATE TABLE product_inventory (
  product_id TEXT PRIMARY KEY, -- microCMSの商品ID
  is_sold BOOLEAN DEFAULT FALSE,
  sold_at TIMESTAMPTZ,
  order_id UUID REFERENCES orders(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 誰でも読み取り可能（公開情報）
ALTER TABLE product_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read inventory" ON product_inventory
  FOR SELECT USING (true);

-- ========================================
-- 8. 更新日時自動更新トリガー
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_buyback_requests_updated_at
  BEFORE UPDATE ON buyback_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_product_inventory_updated_at
  BEFORE UPDATE ON product_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========================================
-- 9. 注文番号生成関数
-- ========================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
BEGIN
  new_number := 'RP' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 10. 買取番号生成関数
-- ========================================
CREATE OR REPLACE FUNCTION generate_buyback_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
BEGIN
  new_number := 'BB' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;
```

### 3.3 環境変数設定

`.env` ファイルに追加:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 4. Stripe設定

### 4.1 アカウント作成

1. https://stripe.com/jp にアクセス
2. アカウント作成
3. ダッシュボード → 開発者 → APIキー

### 4.2 環境変数

```env
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx  # サーバーサイドのみ
```

### 4.3 Webhook設定（後で）

Supabase Edge Functionsと連携予定

---

## 5. 環境変数まとめ

`.env` ファイル完成版:

```env
# microCMS
VITE_MICROCMS_SERVICE_DOMAIN=repaw
VITE_MICROCMS_API_KEY=your-microcms-api-key

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

---

## 6. 次のステップ

1. [ ] microCMSでAPI作成
2. [ ] Supabaseでテーブル作成
3. [ ] Stripeアカウント設定
4. [ ] React側のAPI連携コード実装
5. [ ] 認証フロー実装
6. [ ] カート機能実装
7. [ ] 決済フロー実装
8. [ ] 買取フロー実装
