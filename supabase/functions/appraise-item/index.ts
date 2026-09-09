// appraise-item
//   買取の服1点（buyback_items）の査定用写真を Claude に渡し、
//   タグの有無・ブランド・種類・色・サイズ表記・素材・状態の所見を JSON で返す。
//   ランクと金額には関与しない（スタッフが決める）。
//   管理者のみ呼び出せる。生の出力は buyback_item_internal.ai_reading に保存する。
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
const MAX_PHOTOS = 6;

// src/lib/buyback.ts の ITEM_TYPE_OPTIONS と揃える
const ITEM_TYPES = ["パーカー", "トレーナー", "Tシャツ", "タンクトップ", "ニット", "ワンピース", "アウター", "レインコート", "ハーネス", "その他"];

const SYSTEM_PROMPT = `あなたは犬服のリユースショップの査定スタッフを補助するアシスタントです。
届いた犬服1点の写真（タグ・全体・気になる箇所）を見て、分かることだけを日本語で JSON にまとめてください。

## 出力する項目
- has_tag: タグ（ブランドタグ・洗濯表示・サイズ表記）が写っていれば true、無ければ false
- brand: タグやロゴから読み取れるブランド名。読み取れない・ロゴが無い場合は null（推測で埋めない）
- item_type: 次のいずれか1つ: ${ITEM_TYPES.join(" / ")}
- color: 主な色（例: グレー、ネイビー、赤×白のボーダー）
- size_label: タグに書かれたサイズ表記（例: S、M、2L、フリー）。無ければ null
- material: 素材表示（例: 綿100%、ポリエステル）。読めなければ null
- condition_notes: 写真から見える状態の所見を箇条書きの配列で（例: 「袖口に軽い毛玉」「胸元に薄い汚れ」「タグ付き未使用に見える」）。見えなければ空配列
- notes: スタッフへの補足があれば1〜2文。無ければ null

## ルール
- 写真に無いことは書かない。断定できないときは null か「〜に見える」と書く
- ランク（A/B/C）や金額、定価には触れない
- 出力は JSON オブジェクトのみ。前後に説明文やコードフェンスを付けない
{"has_tag":true,"brand":null,"item_type":"パーカー","color":"グレー","size_label":"S","material":"綿100%","condition_notes":["袖口に軽い毛玉"],"notes":null}`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1) 呼び出し元が管理者か確認
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return json({ error: "UNAUTHORIZED" }, 401);
    }
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: profile } = await admin.from("profiles").select("is_admin").eq("id", user.id).single();
    if (!profile?.is_admin) {
      return json({ error: "FORBIDDEN" }, 403);
    }

    // 2) 入力検証と写真の取得
    const input = await req.json().catch(() => ({}));
    const itemId = typeof input?.item_id === "string" && UUID_RE.test(input.item_id) ? input.item_id : null;
    if (!itemId) {
      return json({ error: "INVALID_INPUT" }, 400);
    }
    const { data: item } = await admin.from("buyback_items").select("id, intake_photos").eq("id", itemId).single();
    const photos: string[] = (item?.intake_photos ?? []).slice(0, MAX_PHOTOS);
    if (photos.length === 0) {
      return json({ error: "NO_PHOTOS" }, 400);
    }

    // 3) Claude に写真を渡す
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
        messages: [{
          role: "user",
          content: [
            ...photos.map((url) => ({ type: "image", source: { type: "url", url } })),
            { type: "text", text: `この犬服1点の写真（${photos.length}枚）から、分かる項目を JSON で出力してください。` },
          ],
        }],
      }),
    });
    if (!res.ok) {
      throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    const text: string = data?.content?.[0]?.text ?? "";
    const parsed = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim());

    const result = {
      has_tag: typeof parsed?.has_tag === "boolean" ? parsed.has_tag : null,
      brand: typeof parsed?.brand === "string" && parsed.brand.trim() ? parsed.brand.trim() : null,
      item_type: ITEM_TYPES.includes(parsed?.item_type) ? parsed.item_type : null,
      color: typeof parsed?.color === "string" && parsed.color.trim() ? parsed.color.trim() : null,
      size_label: typeof parsed?.size_label === "string" && parsed.size_label.trim() ? parsed.size_label.trim() : null,
      material: typeof parsed?.material === "string" && parsed.material.trim() ? parsed.material.trim() : null,
      condition_notes: Array.isArray(parsed?.condition_notes) ? parsed.condition_notes.filter((n: unknown) => typeof n === "string").slice(0, 10) : [],
      notes: typeof parsed?.notes === "string" && parsed.notes.trim() ? parsed.notes.trim() : null,
    };

    // 4) 生の出力を社内テーブルに保存（本人には見えない）
    await admin.from("buyback_item_internal").upsert({
      item_id: itemId,
      ai_reading: { ...result, raw: text, photos, model: "claude-sonnet-4-6", read_at: new Date().toISOString() },
      updated_at: new Date().toISOString(),
    });

    return json(result);
  } catch (error) {
    console.error("appraise-item failed:", error);
    return json({ error: (error as Error).message ?? "INTERNAL_ERROR" }, 400);
  }
});
