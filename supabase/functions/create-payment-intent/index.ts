// create-payment-intent
//   クライアントからは productIds と配送先だけを受け取る。
//   金額はDB（begin_checkout）が決め、商品は15分間予約される。
//   PaymentIntent 作成後、購入内容を checkout_sessions に保存し、
//   決済成功は stripe-webhook が受けて finalize_order で注文化する。
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@12.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
});

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    const body = await req.json().catch(() => ({}));
    const productIds: string[] = Array.isArray(body?.productIds)
      ? body.productIds.filter((x: unknown) => typeof x === "string" && UUID_RE.test(x))
      : [];
    const shippingAddress = body?.shippingAddress;

    if (productIds.length === 0) {
      return json({ error: "EMPTY_CART" }, 400);
    }
    if (!shippingAddress || typeof shippingAddress !== "object" || Array.isArray(shippingAddress)) {
      return json({ error: "INVALID_ADDRESS" }, 400);
    }

    // 3) DBで金額計算 + 在庫予約（service_role）
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: amounts, error: rpcError } = await admin
      .rpc("begin_checkout", { p_user_id: user.id, p_product_ids: productIds })
      .single();

    if (rpcError) {
      if (rpcError.message?.includes("SOLD_OUT")) return json({ error: "SOLD_OUT" }, 409);
      if (rpcError.message?.includes("TOO_MANY_ITEMS")) return json({ error: "TOO_MANY_ITEMS" }, 400);
      throw rpcError;
    }

    const { subtotal, shipping_fee, total_amount } = amounts as {
      subtotal: number; shipping_fee: number; total_amount: number;
    };

    // 4) PaymentIntent 作成
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total_amount,
      currency: "jpy",
      automatic_payment_methods: { enabled: true },
      metadata: { user_id: user.id, product_count: String(productIds.length) },
    });

    // 5) 購入内容を保存（Webhook が読む）
    const { error: insertError } = await admin.from("checkout_sessions").insert({
      payment_intent_id: paymentIntent.id,
      user_id: user.id,
      product_ids: productIds,
      subtotal,
      shipping_fee,
      total_amount,
      shipping_address: shippingAddress,
    });
    if (insertError) {
      await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => {});
      throw insertError;
    }

    return json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      subtotal,
      shippingFee: shipping_fee,
      total: total_amount,
    });
  } catch (error) {
    console.error("create-payment-intent failed:", error);
    return json({ error: (error as Error).message ?? "INTERNAL_ERROR" }, 400);
  }
});
