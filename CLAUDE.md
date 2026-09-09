# RePaw プロジェクト仕様書

最終更新: 2026-09-09

## 概要
犬服・犬用アクセサリーのリユースECサイト。売上の一部を動物保護団体へ寄付する仕組みを持つ。

- **本番URL**: https://repaw-pi.vercel.app
- **リポジトリ**: https://github.com/CreavePlusShogatsudani/repaw
- **デプロイ**: GitHub main ブランチへ push → Vercel が自動デプロイ
- **Supabase プロジェクト**: `mrmixfzxreigbfbnires`（CreavePlus 組織）

---

## 技術スタック

| 項目 | 内容 |
|------|------|
| フロントエンド | React + Vite + TypeScript |
| スタイリング | Tailwind CSS v3.4 + `src/index.css` の `shop-*` カスタムクラス（トップ・一覧・詳細） |
| ルーティング | react-router-dom |
| バックエンド / DB | Supabase (PostgreSQL + Storage + Auth + Edge Functions) |
| 決済 | Stripe（Edge Function 経由。現在は `CHECKOUT_ENABLED = false` で停止中） |
| AI | Claude API `claude-sonnet-4-6`（問い合わせの一次対応） |
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
│   ├── PageMeta.tsx        # SEO メタタグ共通コンポーネント
│   ├── ProductCard.tsx     # 商品カード（一覧・トップ新着・関連商品で共用）
│   ├── CountUp.tsx / RevealObserver.tsx / InstallPrompt.tsx
├── contexts/
│   ├── AuthContext.tsx     # user / profile / signOut / refreshProfile
│   └── CartContext.tsx     # localStorage 永続化。一点物のため同一商品は1点のみ
├── layouts/
│   └── AdminLayout.tsx     # 管理画面レイアウト・サイドバー・is_admin ガード
├── lib/
│   ├── supabase.ts
│   ├── stripe.ts
│   ├── conditions.ts       # 状態ランク A/B/C の唯一の定義
│   ├── productOptions.ts   # カテゴリ・サイズ選択肢の唯一の定義（管理画面と公開側で共有）
│   ├── donation.ts         # 寄付率 5% の唯一の定義（商品詳細の寄付額・トップの案内）
│   ├── products.ts         # 公開側の商品 select（previous_owners を join）と Instagram URL
│   └── buyback.ts          # 買取のステータス・表示名・服1点の型
├── pages/
│   ├── home/               # トップページ（Hero / NewArrivals / Owners / Explore / Donation / Featured / News / Contact）
│   ├── items/              # 商品一覧（?size= でフィルタ）
│   ├── item-detail/        # 商品詳細（お気に入り・カート・売主Instagram）
│   ├── features/ feature-detail/   # 特集
│   ├── news/ news-detail/          # ニュース
│   ├── cart/ checkout/ order-complete/
│   ├── mypage/             # プロフィール / 購入履歴 / お気に入り / 買取申込履歴 / 問い合わせ履歴
│   ├── buyback/            # 買取申込（page.tsx）と査定回答（response.tsx）
│   ├── contact/            # 問い合わせフォーム（ログイン必須）
│   ├── impact/ system/ about/ faq/
│   ├── login/ signup/ forgot-password/ reset-password/
│   ├── NotFound.tsx
│   └── admin/
│       ├── dashboard/
│       ├── products/       # 商品管理 (page.tsx / form.tsx)
│       ├── orders/         # 注文管理
│       ├── buyback/        # 買取申込管理（page: 一覧 / detail: 1点ごとの査定）
│       ├── photo-queue/    # 撮影待ち（買取確定した服 → 一眼レフ撮影 → 公開）
│       ├── inquiries/      # 問い合わせ管理（AI下書きの承認送信）
│       ├── members/        # ユーザー一覧
│       ├── users/          # 管理者アカウント
│       ├── banners/        # メインビジュアル管理
│       ├── collections/    # 特集記事管理 (page / form / products)
│       ├── owners/         # おさがりオーナー（前に着ていた犬）管理
│       ├── recommended/    # おすすめ商品管理（特集ごと）
│       └── news/           # ニュース管理 (page / form)
├── router/
│   ├── index.tsx           # ErrorBoundary + AppRoutes
│   └── config.tsx          # ルート定義 (lazyWithRetry 使用)
└── types/
    └── index.ts

supabase/
├── migrations/             # 000_baseline → 004 → 005 → 006 → 007 → 008 → 009 → 010 → 011（本番適用済み）
├── functions/
│   ├── create-payment-intent/   # 決済開始（金額はDBが決める）
│   ├── stripe-webhook/          # 決済確定 → finalize_order
│   ├── handle-inquiry/          # 問い合わせ受付 + Claude API
│   └── appraise-item/           # 買取の服1点の写真を Claude に渡して読み取り（管理者のみ）
└── config.toml             # 各 Function の verify_jwt 設定
```

---

## Supabase テーブル一覧

### products
| カラム | 型 | 備考 |
|--------|-----|------|
| id | uuid PK | |
| name / description | text | |
| price / original_price | integer | original_price > price のとき割引表示 |
| category | text | `productOptions.ts` の PRODUCT_CATEGORIES（アウター/トップス/ボトムス/アクセサリー/その他） |
| size | text | PRODUCT_SIZES（XS〜XXL, フリーサイズ） |
| color | text | |
| condition | text | A/B/C（`conditions.ts`） |
| brand | text | |
| images | text[] | Storage URL 配列 |
| stock | integer | |
| status | text | `published` / `draft` / `reserved`（購入手続き中・15分予約） / `sold_out` |
| reserved_by / reserved_until | uuid / timestamptz | 005 で追加。pg_cron が毎分期限切れを解放 |
| seller_id | uuid | 現状どこからも設定されない |
| seller_instagram | text | 管理画面で手入力。前のオーナー未設定時のフォールバック表示 |
| previous_owner_id | uuid FK | previous_owners。設定するとカードに「○○ちゃんのおさがり」、詳細に「この服を着ていた子」 |
| back_length_cm / chest_cm / neck_cm | numeric | 実寸。管理画面フォームで入力、カード・詳細に表示 |
| size_chart | jsonb | 型定義のみ。UI 未使用 |

公開側（一覧・詳細）は `status in (published, reserved, sold_out)` のみ表示。draft は URL 直打ちでも非表示。

### profiles
| カラム | 型 | 備考 |
|--------|-----|------|
| id | uuid PK | auth.users と同じ。トリガー handle_new_user が作成 |
| email / full_name / phone | text | |
| postal_code / prefecture / city / address / building | text | 住所 |
| pet_name / pet_breed | text | サインアップ時の metadata から反映（008） |
| instagram_account / show_instagram | text / boolean | ※現状は公開サイトに表示されない（下記「既知の未実装」） |
| is_admin | boolean | 管理者フラグ。トリガー protect_is_admin で自己昇格を防止 |

### orders / order_items / checkout_sessions
- 注文は Stripe Webhook → `finalize_order()` が作成。ブラウザからは作らない
- `checkout_sessions` は PaymentIntent ごとの購入内容。service_role のみ書き込み
- 送料ルールは `calc_shipping_fee()`（5,000円未満は500円）が唯一の定義。カート・FAQ・商品詳細の表示も同じ値

### favorites
user_id + product_id（unique）。商品詳細のハートボタンで追加・解除。マイページで一覧・解除。

### previous_owners（あの子のおさがり）
| カラム | 型 | 備考 |
|--------|-----|------|
| dog_name | text | 犬の名前 |
| dog_photo_url | text | Storage URL（product-images/owners/） |
| instagram | text | 飼い主の Instagram（@なし） |
| story | text | 一言（120字） |
| is_featured / sort_order | boolean / int | トップの「あの子のおさがり」に出す・順番 |

### hero_banners
title / subtitle / image_url / link_url / link_text / sort_order / is_active。
トップの HeroSection が有効バナーを sort_order 順に表示（複数なら5秒で切替）。未登録時は静的な既定コピーと `/images/repaw-dog.jpg`。

### collections / collection_products / recommended_products
特集記事と紐づけ商品。`content` は `# 見出し` / `## 見出し` / `![](url)` 記法。

### news_articles
category: お知らせ / 寄付報告 / 新商品 / イベント。`is_published` で公開制御（RLS でも二重に保護）。

### buyback_requests（買取申込）
| カラム | 型 | 備考 |
|--------|-----|------|
| user_id | uuid | 申込はログイン必須 |
| name / email / phone / address / instagram | text | プロフィールからプリフィル |
| item_type / item_description / condition / purchase_date / message | text | |
| status | text | pending → kit_sent → received → quoted → accepted → completed。途中で returned / rejected |
| estimated_price / admin_note | integer / text | 管理者が入力 |
| return_preference | text | 買取不可・不同意時の扱い: `donate` / `return_cod` |
| kit_sent_at / received_at / paid_at | timestamptz | 送付型の日時 |
| payout_method | text | `donate`（全額寄付） / `transfer`（振込。販売時5%を自動寄付） |
| bank_* / user_responded_at | | ユーザーの査定回答。**RPC `respond_buyback()` 経由でのみ書ける**（010） |

### buyback_items（服1点）/ buyback_item_internal（社内）
- items: request_id、intake_photos、has_tag、brand、item_type、color、size_label、material、実寸3項目、rank、appraisal_comment（本人に見せる）、decision（buyable / not_buyable）、reject_reason、buyback_price、product_id、status（pending → appraised → awaiting_photo → photographed → listed → sold、rejected / returned）
- internal: condition_notes、ai_reading、sale_price。管理者だけが読める（RLS）

### inquiries（問い合わせ）
| カラム | 型 | 備考 |
|--------|-----|------|
| user_id / order_id | uuid | order_id は任意（自分の注文のみ） |
| subject / body | text | 件名100字・本文500字まで |
| category | text | AIが分類: question / complaint / refund / buyback / other |
| ai_draft | text | AI生成回答（下書きまたは送信済み本文） |
| admin_edited_reply | text | 管理者が編集した最終回答（編集した場合のみ） |
| status | text | `received` → `auto_sent` または `pending_approval` → `approved_sent` |
| replied_at | timestamptz | |

---

## デザイン方針（トップ・商品カード・詳細・ナビ・フッター）
- 3つの軸: 服がかわいい / 前のオーナーが見える / 買うことで寄付になる
- 2026-09-09 のベンチマーク（maxbone / Kanine / monchéri / Depop / Vestiaire Collective）を踏まえ、**写真が主役、UI は白地で引く**。調査レポートは `.lazyweb/design-research/`（git 管理外）
- 色: 白と生成り（`--rp-paper` / `--rp-sand`）に墨色の文字。**原色のブロックやパステルのタイルは使わない**。ボタンは黒。トークンは `src/index.css` の `--rp-*`
- 書体: 本文・見出しとも Noto Sans JP（見出しは 500、字間 .06〜.08em）。Playfair Display はロゴと英字の小見出しだけ
- 角丸は 2px。区切りは余白と 1px の罫線。影は使わない
- トップの順番: 全面写真のヒーロー（1〜2行のコピー + 黒/白ボタン1つ）→ 約束の行（5%寄付・一点物・前のオーナー）→ 新着8点 → あの子のおさがり → サイズ（テキスト）と種類（商品写真タイル）の入口 + 4点 → 寄付の仕組みと買取の流れ（生成り地）→ 特集 → ニュース → 問い合わせ
- 商品カード: 写真（`--rp-photo-bg` 地に multiply）、ブランド小文字、品名、サイズ・ランク、価格、最終行に「○○ちゃんのおさがり」
- 商品詳細は価格の下に「このお買い物から ¥○ を寄付」。寄付率は `src/lib/donation.ts`
- 商品写真が最大のボトルネック。一眼レフでの統一撮影（背景・照明・構図を固定）が前提
- 下層ページも同じ文法。共通部品 `src/components/PageHeader.tsx`（英字の小見出し + h1 + 一文）と `src/index.css` の「下層ページ共通」クラス（page / page-section / rp-prose / rp-rows / rp-steps / rp-tabs / rp-faq / rp-band / rp-input / rp-article）を使う
- 記事本文（特集・ニュース）の `#` `##` は半角スペース無しでも見出しとして描画する
- ログインの「ログイン状態を保持」と Google / Apple ログインは未実装のため UI から削除済み

## 主要フロー

### 購入（現在停止中）
1. カート（localStorage）→ `/checkout`。`CHECKOUT_ENABLED = false` の間は「準備中」画面
2. 有効化時: Edge Function `create-payment-intent` が `begin_checkout()` で金額計算＋商品を15分予約 → Stripe PaymentIntent 作成
3. `stripe-webhook` が `finalize_order()` で注文・明細・sold_out を1トランザクションで確定（冪等）
- 再開手順: `src/pages/checkout/page.tsx` の `CHECKOUT_ENABLED` を true にする。**カート側の「購入手続きへ進む」は別途 disabled ハードコードのため要修正**

### 買取（送付型・服1点ごとの査定）
1. `/buyback`（ログイン必須、写真添付なし）。「買取できない服の扱い」（寄付 / 着払い返送）を申込時に選ぶ → `buyback_requests`（status: pending）
2. 管理画面 `/admin/buyback/:id`: 「配送キットを送った」→ kit_sent、「商品が届いた」→ received
3. 到着した服を「服を追加」で1点ずつ登録（`buyback_items`）。スマホで撮影（タグ・全体・気になる箇所）→「AIで読み取る」（Edge Function `appraise-item`）でブランド・種類・色・サイズ表記・素材・状態の所見が空欄に入る → スタッフが確認し、実寸、可否、ランク、本人に見せる一言、買取額を入力。社内メモと販売予定価格は `buyback_item_internal`（管理者のみ）。AI の生出力は `ai_reading` に保存
4. 「査定額を提示する」→ 服は appraised / rejected、申込は quoted（全点不可なら rejected）
5. ユーザーは `/buyback/response/:id` で内訳を見て、寄付 / 振込 / 全点着払い返送 を申込全体で1回回答 → RPC `respond_buyback`
   - 寄付・振込のとき、買取可の服は awaiting_photo になり、下書き商品（status: draft、写真なし）が自動作成されて `product_id` に紐づく
6. 管理者が「振込済み / 寄付処理済み」→ completed
7. 管理画面「撮影待ち」（/admin/photo-queue）から下書き商品を開き、一眼レフの写真を入れて公開。写真が入ると photographed、公開で listed、売り切れで sold に服の status が自動で進む（011 のトリガー）。写真が無い商品は公開できない
- 買取価格の率・目安は公開しない。査定額に不同意なら全点返送（着払い）か全点寄付
- ステータスと表示名の定義は `src/lib/buyback.ts`

### 問い合わせ（AI 一次対応・段階制）
1. `/contact`（ログイン必須。件名・本文・任意で自分の注文を選択）→ Edge Function `handle-inquiry`
2. `inquiries` に `received` で保存 → Claude API が FAQ 全文（`handle-inquiry/index.ts` にハードコピー）と注文情報を参照して `{category, confidence, reply}` を JSON で返す
3. **`category = question` かつ `confidence = high` のときだけ** `auto_sent`。それ以外（クレーム・返金・買取・分類不明・低確信度）は `pending_approval` で下書き保存、自動送信しない
4. 管理画面「問い合わせ管理」で下書きを編集し「承認して送信」→ `approved_sent`
5. ユーザーはマイページ「問い合わせ履歴」で閲覧。回答は `admin_edited_reply ?? ai_draft`。未回答は「確認中です」
- 回答ポリシー（システムプロンプト）: 返品・返金の確約をしない／取り置き・値引きを約束しない／買取価格に言及しない／不明点は「担当者が確認します」
- Claude API が失敗しても問い合わせは `received` のまま残り、ユーザーには受付成功を返す
- 必要な Secrets: `ANTHROPIC_API_KEY`（未設定なら AI ステップのみスキップ）

### 認証
- サインアップ → トリガー `handle_new_user` が profiles を作成（pet_name / pet_breed 反映）。メール確認不要設定ならそのままマイページへ
- ログインは `location.state.from` に戻る
- パスワード再設定: `/forgot-password` → メール → `/reset-password`（Supabase の Redirect URLs に登録が必要）
- ログアウトはモバイルメニューとマイページ見出し横

---

## 管理画面メニュー構成

| メニュー | パス | 機能 |
|----------|------|------|
| ダッシュボード | /admin | 商品数・注文数・売上・撮影待ち・対応が必要な買取 |
| 商品管理 | /admin/products | CRUD・画像アップロード・実寸・ステータス（公開/下書き/売り切れ） |
| ニュース管理 | /admin/news | 記事 CRUD・公開管理 |
| 注文管理 | /admin/orders | 注文一覧・ステータス更新 |
| 買取申込管理 | /admin/buyback | キット送付・到着・1点ごとの査定（AI読み取り）・査定額提示・完了 |
| 撮影待ち | /admin/photo-queue | 買取確定した服の撮影・公開状況 |
| 問い合わせ管理 | /admin/inquiries | ステータスフィルタ（既定: 承認待ち）・AI下書き編集・承認送信 |
| ユーザー一覧 | /admin/members | |
| 管理者アカウント | /admin/users | is_admin の付与・剥奪 |
| メインビジュアル | /admin/banners | ヒーローバナー管理 |
| 特集記事 | /admin/collections | 特集 CRUD・商品紐づけ・おすすめ商品・並び替え |

---

## 公開ページ一覧

| パス | ページ | noindex |
|------|--------|---------|
| / | トップ | |
| /products | 商品一覧（?size= でサイズ絞り込み） | |
| /product/:id | 商品詳細 | |
| /features, /features/:id | 特集 | |
| /news, /news/:id | ニュース | |
| /impact / /system / /about / /faq | 静的ページ | |
| /buyback | 買取申込（ログイン必須） | |
| /buyback/response/:id | 査定回答 | |
| /contact | お問い合わせ（ログイン必須） | |
| /cart, /checkout, /order-complete | 購入導線 | ✓ |
| /mypage | マイページ | ✓ |
| /login, /signup, /forgot-password, /reset-password | 認証 | ✓ |

---

## RLS 方針（要点）
- 管理者判定は `public.is_admin_user()`（security definer）。新しい判定関数は作らない
- 一般ユーザーの書き込みは「自分の行」に限定し、`with check` を必ず明示する
- ステータス遷移や金額に関わる更新は RPC / Edge Function（service_role）経由。クライアントに UPDATE を開放しない
  - 例: `begin_checkout` / `finalize_order` / `respond_buyback` / `handle-inquiry`
- ダッシュボードで直接変更した場合は必ず同じ内容のマイグレーションを追加する

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

### 選択肢の定義場所
- 状態ランク: `src/lib/conditions.ts`
- カテゴリ・サイズ: `src/lib/productOptions.ts`
- 送料: DB の `calc_shipping_fee()`（表示側もこの値に合わせる）
- 買取価格: 率や目安額を公開しない（トラブル防止。2026-09-10 決定）。FAQ・System ページ・問い合わせ AI の FAQ 文に「定価の○%」を書かない

### 画像アップロード
- Canvas API で圧縮（最大5MB・最大1920px）
- HEIC/HEIF は拒否（エラーメッセージあり）
- Supabase Storage バケット: `product-images`
- 外部の画像生成サービス（readdy.ai 等）は使わない。静的画像は `public/images/`

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

### Edge Function を追加するとき
- `supabase/config.toml` に `verify_jwt` を明記する
- 認証・CORS・エラーハンドリングは `create-payment-intent` の形に揃える

---

## 既知の未実装・残タスク
- 通知メール（問い合わせ回答時・買取査定時）: 基盤未選定。`// TODO(#21)` が handle-inquiry と admin/inquiries にある
- 利用規約 `/terms`・プライバシーポリシー `/privacy`: リンクはあるがページが無い（文面待ち）
- プロフィールの Instagram（instagram_account / show_instagram）は公開サイトに反映されない。products.seller_id も未設定
- カートの「購入手続きへ進む」が `CHECKOUT_ENABLED` と連動していない。クーポン入力欄は飾り
- pending_approval の ai_draft は RLS が行単位のため本人が API から読める（UI では非表示）
- トップのヒーロー画像 `repaw-dog.jpg` が 2.7MB
- sitemap.xml に /contact 未記載

## 今後の検討事項
- ハーネス・首輪・リードなどのアクセサリー販売（安全基準の整備）
- Stripe 決済の本番設定と購入導線の再開
