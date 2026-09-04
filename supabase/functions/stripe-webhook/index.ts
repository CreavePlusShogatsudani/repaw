// stripe-webhook
//   Stripe からの通知を受け、決済結果をDBに反映する。
//     payment_intent.succeeded      → finalize_order（注文＋明細＋sold_out を1トランザクションで）
//     payment_intent.payment_failed → release_checkout（予約解放）
//     payment_intent.canceled       → release_checkout
//   認証は Stripe の署名検証で行う（JWT は不要 = verify_jwt: false でデプロイ）。
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@12.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const admin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature || !WEBHOOK_SECRET) {
    return new Response("Missing signature", { status: 400 });
  }

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      WEBHOOK_SECRET,
      undefined,
      cryptoProvider,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", (err as Error).message);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const { error } = await admin.rpc("finalize_order", { p_payment_intent_id: pi.id });
        if (error) throw error;
        break;
      }
      case "payment_intent.payment_failed":
      case "payment_intent.canceled": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const { error } = await admin.rpc("release_checkout", { p_payment_intent_id: pi.id });
        if (error) throw error;
        break;
      }
      default:
        // 関心のないイベントは 200 で受け流す
        break;
    }
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // 500 を返すと Stripe が再送してくれる
    console.error(`Webhook handling failed for ${event.type}:`, error);
    return new Response("Handler error", { status: 500 });
  }
});
