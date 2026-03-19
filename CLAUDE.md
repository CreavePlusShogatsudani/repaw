# RePaw プロジェクト仕様書

## 概要
犬服・犬用アクセサリーのリユースECサイト。売上の一部を動物保護団体へ寄付する仕組みを持つ。

- **本番URL**: https://repaw-pi.vercel.app
- **リポジトリ**: https://github.com/CreavePlusShogatsudani/repaw
- **デプロイ**: GitHub main ブランチへ push → Vercel が自動デプロイ

---

## 技術スタック

| 項目 | 内容 |
|------|------|
| フロントエンド | React + Vite + TypeScript |
| スタイリング | Tailwind CSS v3.4 |
| ルーティング | react-router-dom |
| バックエンド / DB | Supabase (PostgreSQL + Storage + Auth) |
| 決済 | Stripe |
| SEO | react-helmet-async (PageMeta コンポーネント) |
| PWA | vite-plugin-pwa (Workbox) |
| アイコン | Remixicon |
| フォント | Noto Sans JP / Playfair Display (Google Fonts) |
| ビルド出力 | `out/` ディレクトリ |

---

## ディレクトリ構成

```
src/
├── components/
│   └── PageMeta.tsx        # SEO メタタグ共通コンポーネント
├── contexts/
│   ├── AuthContext.tsx
│   └── CartContext.tsx
├── layouts/
│   └── AdminLayout.tsx     # 管理画面レイアウト・サイドバー
├── lib/
│   ├── supabase.ts
│   ├── stripe.ts
│   └── orders.ts
├── pages/
│   ├── home/               # トップページ + セクションコンポーネント
│   ├── items/              # 商品一覧
│   ├── item-detail/        # 商品詳細
│   ├── features/           # 特集一覧
│   ├── feature-detail/     # 特集詳細
│   ├── news/               # ニュース一覧
│   ├── news-detail/        # ニュース詳細
│   ├── cart/               # カート
│   ├── checkout/           # チェックアウト
│   ├── order-complete/     # 注文完了
│   ├── mypage/             # マイページ
│   ├── buyback/            # 買取申込
│   ├── impact/             # 社会への取り組み
│   ├── system/             # 買取の仕組み
│   ├── about/              # About
│   ├── faq/                # よくある質問
│   ├── login/
│   ├── signup/
│   ├── forgot-password/
│   └── admin/
│       ├── dashboard/
│       ├── products/       # 商品管理 (page.tsx / form.tsx)
│       ├── orders/         # 注文管理
│       ├── buyback/        # 買取申込管理
│       ├── users/          # 管理者アカウント
│       ├── banners/        # メインビジュアル管理
│       ├── collections/    # 特集記事管理 (page / form / products)
│       ├── recommended/    # おすすめ商品管理（特集ごと）
│       └── news/           # ニュース管理 (page / form)
├── router/
│   ├── index.tsx           # ErrorBoundary + AppRoutes
│   └── config.tsx          # ルート定義 (lazyWithRetry 使用)
└── types/
    └── index.ts
```

---

## Supabase テーブル一覧

### products
| カラム | 型 | 備考 |
|--------|-----|------|
| id | uuid PK | |
| name | text | |
| description | text | |
| price | integer | |
| original_price | integer | |
| category | text | アウター/トップス/ボトムス/アクセサリー/その他 |
| size | text | S/M/L など |
| color | text | |
| condition | text | S/A/B/C ランク |
| images | text[] | Supabase Storage URL配列 |
| stock | integer | |
| status | text | published / draft / sold_out |
| seller_id | uuid | |
| seller_instagram | text | |
| size_chart | jsonb | SizeChartRow[] (任意) |
| back_length_cm | numeric | 背丈（cm）|
| chest_cm | numeric | 胴回り（cm）|
| neck_cm | numeric | 首回り（cm）|
| created_at | timestamptz | |
| updated_at | timestamptz | |

### profiles
| カラム | 型 | 備考 |
|--------|-----|------|
| id | uuid PK | auth.users と同じ |
| email | text | |
| full_name | text | |
| avatar_url | text | |
| is_admin | boolean | 管理者フラグ |
| pet_name / pet_breed | text | |
| instagram_account | text | |
| postal_code / prefecture / city / building | text | 住所 |

### orders / order_items
注文情報。Stripe payment_intent_id を保持。

### favorites
user_id + product_id のお気に入り管理。

### hero_banners
| カラム | 型 | 備考 |
|--------|-----|------|
| id | uuid PK | |
| title / subtitle | text | |
| image_url | text | Storage URL |
| link_url / link_text | text | CTAボタン |
| sort_order | integer | |
| is_active | boolean | |

### collections（特集記事）
| カラム | 型 | 備考 |
|--------|-----|------|
| id | uuid PK | |
| title / subtitle / description | text | |
| content | text | `## 見出し` / `![](url)` 記法対応 |
| cover_image_url | text | |
| tag | text | バッジ表示 |
| sort_order | integer | |
| is_active | boolean | |

### collection_products
collection_id + product_id の中間テーブル。sort_order あり。

### recommended_products
| カラム | 型 | 備考 |
|--------|-----|------|
| id | uuid PK | |
| collection_id | uuid FK | 特集ごとに管理 |
| product_id | uuid FK | |
| sort_order | integer | |
| UNIQUE | (collection_id, product_id) | |

### news_articles
| カラム | 型 | 備考 |
|--------|-----|------|
| id | uuid PK | |
| title | text | |
| excerpt | text | 一覧表示用要約 |
| content | text | `## 見出し` 記法対応 |
| thumbnail_url | text | |
| category | text | お知らせ/寄付報告/新商品/イベント |
| published_at | timestamptz | |
| is_published | boolean | |

### buyback_requests（買取申込）
| カラム | 型 | 備考 |
|--------|-----|------|
| id | uuid PK | |
| user_id | uuid | |
| seller_instagram | text | |
| item_description | text | |
| images | text[] | |
| status | text | pending/reviewing/accepted/rejected |
| estimated_price | integer | 査定金額 |
| admin_memo | text | 管理者メモ |

---

## 管理画面メニュー構成

| メニュー | パス | 機能 |
|----------|------|------|
| ダッシュボード | /admin | 概要 |
| 商品管理 | /admin/products | CRUD・画像アップロード |
| ニュース管理 | /admin/news | 記事作成・編集・公開管理 |
| 注文管理 | /admin/orders | 注文一覧 |
| 買取申込管理 | /admin/buyback | 査定・ステータス管理 |
| 管理者アカウント | /admin/users | |
| メインビジュアル | /admin/banners | ヒーロー画像スライドショー管理 |
| 特集記事 | /admin/collections | 特集記事CRUD・商品紐づけ・おすすめ商品 |
| ニュース管理 | /admin/news | ニュース記事CRUD |

### 特集記事の編集画面 (/admin/collections/:id/edit) でできること
- カバー画像アップロード
- タイトル・サブタイトル・概要・本文・タグ・表示順・公開設定
- 本文内画像挿入（「画像を挿入」ボタン → Storage にアップ → `![](url)` 挿入）
- おすすめ商品管理（商品URLを貼り付けて登録・並び替え・削除）

---

## 公開ページ一覧

| パス | ページ | noindex |
|------|--------|---------|
| / | トップ | |
| /products | 商品一覧 | |
| /product/:id | 商品詳細 | |
| /features | 特集一覧 | |
| /features/:id | 特集詳細 | |
| /news | ニュース一覧 | |
| /news/:id | ニュース詳細 | |
| /impact | 社会への取り組み | |
| /system | 買取の仕組み | |
| /about | About | |
| /faq | よくある質問 | |
| /buyback | 買取申込 | |
| /cart | カート | ✓ |
| /checkout | チェックアウト | ✓ |
| /order-complete | 注文完了 | ✓ |
| /mypage | マイページ | ✓ |
| /login | ログイン | ✓ |
| /signup | 新規登録 | ✓ |

---

## SEO / LLMO 対応

- `PageMeta` コンポーネント（react-helmet-async）を全ページに設置
- 動的ページ（商品・記事・特集）は title / description / OGP を動的生成
- JSON-LD スキーマ: Organization（サイト全体）/ Product / Article / FAQPage
- `public/robots.txt`: 管理画面・プライベートページをクロール除外
- `public/sitemap.xml`: 全公開ページを記載

---

## コーディング規約・注意点

### フォント
- 見出し（h1 ページタイトル）: `text-5xl md:text-6xl font-bold` + Playfair Display
  ```tsx
  style={{ fontFamily: "'Playfair Display', serif" }}
  ```
- セクション見出し（h2）: `text-4xl md:text-5xl font-bold`
- コンテンツ見出し: `text-2xl md:text-3xl font-bold`
- カード見出し: `text-xl font-bold`

### 画像アップロード
- Canvas API で圧縮（最大5MB・最大1920px）
- HEIC/HEIF は拒否（エラーメッセージあり）
- Supabase Storage バケット: `product-images`

### 記事本文の記法（content フィールド）
```
# 大見出し
## 見出し
通常テキスト
![alt](https://...画像URL)   ← 「画像を挿入」ボタンで自動挿入
```

### PWA / ChunkLoadError 対策
- `vite.config.ts`: `skipWaiting: true / clientsClaim: true / cleanupOutdatedCaches: true`
- `router/config.tsx`: `lazyWithRetry()` で全 lazy import をラップ
- `router/index.tsx`: ErrorBoundary で ChunkLoadError を検知して自動リロード

### カテゴリ（商品）
アウター / トップス / ボトムス / アクセサリー / その他
※ハーネス・首輪等のアクセサリー販売も今後追加予定

### ニュースカテゴリ
お知らせ / 寄付報告 / 新商品 / イベント

---

## 今後の検討事項
- ハーネス・首輪・リードなどのアクセサリー販売（カテゴリ追加・安全基準の整備）
- Stripe 決済の本番設定
