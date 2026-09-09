// handle-inquiry
//   ログイン済みユーザーの問い合わせを inquiries に保存し、Claude API で
//   分類・回答生成する。
//     category=question かつ confidence=high → auto_sent（自動送信）
//     それ以外                                → pending_approval（管理者が承認して送信）
//   Claude API が失敗しても問い合わせは received のまま残し、受付成功を返す。
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SUBJECT_MAX = 100;
const BODY_MAX = 500;

// src/pages/faq/page.tsx の FAQ_CATEGORIES を手動コピーしたもの（動的読み込みはしない）
const FAQ_TEXT = `
【購入について】
Q: 商品の状態はどのように確認できますか？
A: 各商品ページに詳細な状態説明と写真を掲載しています。A〜Cランクで状態を分類しており、Aランクは新品同様、Bランクは使用感が少ない美品、Cランクは使用感がありますが良品です。気になる点があれば、お問い合わせフォームからご質問ください。
Q: 支払い方法は何がありますか？
A: クレジットカード（VISA、MasterCard、JCB、AMEX）、銀行振込、コンビニ決済、代金引換に対応しています。クレジットカード決済が最も迅速に発送できます。
Q: 送料はいくらですか？
A: 全国一律500円です。5,000円以上のご購入で送料無料となります。離島・一部地域は追加料金が発生する場合があります。
Q: 配送にはどのくらいかかりますか？
A: ご注文確定後、通常2〜3営業日以内に発送いたします。お届けまでは発送から1〜2日程度です。繁忙期や天候により遅れる場合がございます。
Q: 返品・交換はできますか？
A: 当サイトの商品はすべて中古品のため、原則として返品・交換はお受けしておりません。商品に重大な欠陥（破損・汚損など）がある場合のみ、到着後7日以内にご連絡いただければ対応いたします。状態ランクや写真をよくご確認の上、ご購入をお願いいたします。

【買取について】
Q: どんな商品を買取できますか？
A: 犬用の服であれば、ブランド・ノーブランド問わず買取可能です。ただし、著しい汚れ、破損、臭いが強い商品は買取できない場合があります。洗濯済みの状態でお送りください。
Q: 買取の流れを教えてください
A: Webフォームから申し込み → 無料配送キット到着（3営業日以内）→ 商品を梱包・発送 → 査定（2〜3営業日）→ 査定結果のご連絡 → 入金または寄付の選択、という流れです。
Q: 査定にはどのくらい時間がかかりますか？
A: 商品到着後、通常2〜3営業日以内に査定結果をメールでお知らせします。繁忙期は少しお時間をいただく場合があります。
Q: 査定額に納得できない場合は？
A: 査定額にご納得いただけない場合、無料で返送いたします。返送料も当社が負担しますので、ご安心ください。
Q: 買取金額はどのように決まりますか？
A: ブランド、状態、需要、季節などをもとに、届いた商品を1点ずつ査定します。査定結果はメールでお知らせし、ご納得いただけない場合は無料で返送いたします。
Q: 複数点まとめて買取できますか？
A: はい、可能です。まとめて買取いただくことで、査定もスムーズに進みます。配送キットに入る範囲であれば、何点でもお送りいただけます。

【寄付について】
Q: 寄付先の団体はどこですか？
A: 複数の動物保護NPO団体と提携しており、保護犬・保護猫の医療費、食費、シェルター運営費として活用されています。寄付実績は定期的に「社会貢献」ページで公開しています。
Q: 買取金額の一部だけ寄付することはできますか？
A: 現在は「全額入金」または「全額寄付」の2択となっております。一部寄付の機能は今後検討してまいります。
Q: 寄付した場合、領収書は発行されますか？
A: 寄付金の領収書は、提携NPO団体から発行されます。ご希望の方は、買取申し込み時にその旨をお知らせください。
Q: 販売収益からの寄付とは何ですか？
A: 買取時に「入金」を選択された場合でも、その商品が販売された際に販売価格の5%を自動的にNPOへ寄付する仕組みです。どちらを選んでも、動物保護活動に貢献できます。

【アカウント・その他】
Q: 会員登録は必要ですか？
A: 商品の購入や買取申し込みには会員登録が必要です。登録は無料で、メールアドレスとパスワードのみで簡単に登録できます。
Q: パスワードを忘れてしまいました
A: ログインページの「パスワードを忘れた方」からパスワード再設定のメールをお送りします。メールが届かない場合は、迷惑メールフォルダもご確認ください。
Q: 個人情報の取り扱いについて教えてください
A: お客様の個人情報は、商品の発送や買取手続きにのみ使用し、第三者に提供することはありません。詳しくは「プライバシーポリシー」をご覧ください。
Q: メールマガジンの配信停止方法は？
A: マイページの「設定」から、いつでもメールマガジンの配信停止が可能です。または、メール本文の配信停止リンクからも手続きできます。
Q: サイトの使い方がわかりません
A: お問い合わせフォームからご連絡ください。サポートチームが丁寧にご案内いたします。お電話でのサポートも準備中です。
`;

const SYSTEM_PROMPT = `あなたは犬服・犬用アクセサリーのリユースECサイト「RePaw」のカスタマーサポート担当です。
お客様からの問い合わせを分類し、日本語で丁寧な回答を作成してください。

## 分類（category）
- question: 商品・サイズ・送料・支払い・発送状況・サイトの使い方など、FAQ や注文情報から答えられる質問
- complaint: 不満・苦情・トラブルの申し立て
- refund: 返品・返金・交換の希望や相談
- buyback: 買取に関する相談（買取可否・査定額・買取の流れなど）
- other: 上記に当てはまらないもの

## 確信度（confidence）
- high: FAQ または提供された注文情報だけで、確実かつ完全に回答できる場合のみ
- low: 少しでも判断に迷う、情報が足りない、個別対応が必要な場合

## 回答ポリシー（必ず守る）
- 返品・返金・交換の可否について確約しない。「承ります」「対応いたします」と断定しない
- 在庫の取り置き・値引きを約束しない
- 買取価格に言及しない。買取率や定価に対する割合の目安も示さない（1点ずつ査定する旨だけ伝える）
- わからないことは「担当者が確認してご連絡いたします」と書く
- FAQ に書かれていない事実を作らない
- 冒頭に「お問い合わせありがとうございます。」を含め、敬体で簡潔に書く

## FAQ
${FAQ_TEXT}

## 出力形式
以下の JSON オブジェクトのみを出力する。前後に説明文やコードフェンスを付けない。
{"category":"question|complaint|refund|buyback|other","confidence":"high|low","reply":"回答本文"}`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface AiResult {
  category: "question" | "complaint" | "refund" | "buyback" | "other";
  confidence: "high" | "low";
  reply: string;
}

async function askClaude(userMessage: string): Promise<AiResult> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const text: string = data?.content?.[0]?.text ?? "";
  const parsed = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim());

  const categories = ["question", "complaint", "refund", "buyback", "other"];
  if (!categories.includes(parsed?.category) || typeof parsed?.reply !== "string" || !parsed.reply.trim()) {
    throw new Error("INVALID_AI_RESPONSE");
  }
  return {
    category: parsed.category,
    confidence: parsed.confidence === "high" ? "high" : "low",
    reply: parsed.reply.trim(),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1) 呼び出し元ユーザーを確認
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return json({ error: "UNAUTHORIZED" }, 401);
    }

    // 2) 入力検証
    const input = await req.json().catch(() => ({}));
    const subject = typeof input?.subject === "string" ? input.subject.trim() : "";
    const body = typeof input?.body === "string" ? input.body.trim() : "";
    const orderId = typeof input?.order_id === "string" && UUID_RE.test(input.order_id) ? input.order_id : null;

    if (!subject || subject.length > SUBJECT_MAX || !body || body.length > BODY_MAX) {
      return json({ error: "INVALID_INPUT" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // 3) 注文コンテキスト（本人の注文であることを必ず検証）
    let orderContext = "";
    if (orderId) {
      const { data: order } = await admin
        .from("orders")
        .select("id, user_id, status, total_amount, created_at, order_items(quantity, price_at_purchase, products(name))")
        .eq("id", orderId)
        .single();
      if (!order || order.user_id !== user.id) {
        return json({ error: "ORDER_NOT_FOUND" }, 400);
      }
      const items = (order.order_items ?? [])
        .map((i: { quantity: number; price_at_purchase: number; products: { name: string } | null }) =>
          `${i.products?.name ?? "商品"} × ${i.quantity}（¥${i.price_at_purchase}）`)
        .join("、");
      orderContext = `\n\n## 関連する注文情報
注文番号: ${order.id.split("-")[0].toUpperCase()}
注文日: ${new Date(order.created_at).toLocaleDateString("ja-JP")}
ステータス: ${order.status}（pending=支払い待ち, paid=支払い済み, shipped=発送済み, completed=配送完了, cancelled=キャンセル）
合計金額: ¥${order.total_amount}
商品: ${items || "（明細なし）"}`;
    }

    // 4) 問い合わせを保存（received）
    const { data: inquiry, error: insertError } = await admin
      .from("inquiries")
      .insert({ user_id: user.id, order_id: orderId, subject, body })
      .select("id")
      .single();
    if (insertError) throw insertError;

    // 5) Claude API で分類・回答生成。失敗しても問い合わせは残す
    try {
      const ai = await askClaude(`件名: ${subject}\n\n本文:\n${body}${orderContext}`);
      const autoSend = ai.category === "question" && ai.confidence === "high";
      const { error: updateError } = await admin
        .from("inquiries")
        .update({
          category: ai.category,
          ai_draft: ai.reply,
          status: autoSend ? "auto_sent" : "pending_approval",
          replied_at: autoSend ? new Date().toISOString() : null,
        })
        .eq("id", inquiry.id);
      if (updateError) throw updateError;
      // TODO(#21): 通知メール送信（auto_sent 時: 「お問い合わせへの回答が届きました。マイページからご確認ください」）
    } catch (aiError) {
      console.error("handle-inquiry AI step failed:", aiError);
    }

    return json({ id: inquiry.id });
  } catch (error) {
    console.error("handle-inquiry failed:", error);
    return json({ error: (error as Error).message ?? "INTERNAL_ERROR" }, 400);
  }
});
