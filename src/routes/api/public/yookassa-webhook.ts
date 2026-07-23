import { createFileRoute } from "@tanstack/react-router";

const YK_API = "https://api.yookassa.ru/v3";
const SMM_API = "https://smm.media/api/reseller";

async function smmCreateOrder(params: { service_id: number; count: number; link: string }) {
  const token = process.env.SMM_MEDIA_API_TOKEN;
  if (!token) throw new Error("SMM_MEDIA_API_TOKEN is not configured");
  const body = new URLSearchParams();
  body.set("api_token", token);
  body.set("service_id", String(params.service_id));
  body.set("count", String(params.count));
  body.set("link", params.link);
  const res = await fetch(`${SMM_API}/create_order`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const text = await res.text();
  let json: { order_id?: number; status?: number; message?: string } = {};
  try { json = JSON.parse(text); } catch { /* keep text */ }
  if (!res.ok || !json?.order_id || json.status !== 200) {
    throw new Error(json?.message || `smm.media failed: ${text.slice(0, 200)}`);
  }
  return json.order_id;
}

export const Route = createFileRoute("/api/public/yookassa-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: { event?: string; object?: { id?: string; status?: string } };
        try {
          payload = await request.json();
        } catch {
          return new Response("bad json", { status: 400 });
        }
        const paymentId = payload?.object?.id;
        if (!paymentId) return new Response("no id", { status: 400 });

        const shop = process.env.YOOKASSA_SHOP_ID;
        const secret = process.env.YOOKASSA_SECRET_KEY;
        if (!shop || !secret) return new Response("not configured", { status: 500 });
        const auth = "Basic " + Buffer.from(`${shop}:${secret}`).toString("base64");

        const res = await fetch(`${YK_API}/payments/${paymentId}`, {
          headers: { Authorization: auth },
        });
        if (!res.ok) {
          console.error("yookassa verify failed", res.status, await res.text());
          return new Response("verify failed", { status: 502 });
        }
        const verified = (await res.json()) as { id: string; status: string; paid?: boolean };

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Определяем тип платежа
        const { data: topup } = await supabaseAdmin
          .from("topup_payments")
          .select("id, kind, order_id, credited")
          .eq("yookassa_payment_id", verified.id)
          .maybeSingle();

        if (verified.status === "succeeded" && verified.paid) {
          if (topup && (topup as { kind?: string }).kind === "guest_order" && (topup as { order_id?: string }).order_id) {
            if ((topup as { credited?: boolean }).credited) {
              return new Response("ok");
            }
            const orderId = (topup as { order_id: string }).order_id;

            // Загружаем заказ
            const { data: order } = await supabaseAdmin
              .from("orders")
              .select("id, status, external_service_id, link, quantity, external_order_id")
              .eq("id", orderId)
              .maybeSingle();
            if (!order) return new Response("order missing", { status: 500 });

            // Помечаем как оплаченный
            await supabaseAdmin.from("orders")
              .update({ status: "paid" })
              .eq("id", orderId);
            await supabaseAdmin.from("topup_payments")
              .update({ status: "succeeded", credited: true })
              .eq("id", (topup as { id: string }).id);

            // Отправляем в SMM.media
            const o = order as { external_service_id: number | null; link: string; quantity: number; external_order_id: number | null };
            if (!o.external_order_id && o.external_service_id) {
              try {
                const extId = await smmCreateOrder({
                  service_id: o.external_service_id,
                  count: o.quantity,
                  link: o.link,
                });
                await supabaseAdmin.from("orders").update({
                  external_order_id: extId,
                  external_status: "queued",
                  status: "processing",
                }).eq("id", orderId);
              } catch (err) {
                console.error("smm.media create_order failed", err);
                await supabaseAdmin.from("orders").update({
                  status: "error",
                  payment_note: `Оплачено, но не удалось запустить: ${err instanceof Error ? err.message : String(err)}`.slice(0, 500),
                }).eq("id", orderId);
              }
            }
          } else {
            // Обычное пополнение баланса
            const { error } = await supabaseAdmin.rpc("credit_yookassa_topup", {
              _payment_id: verified.id,
            });
            if (error) {
              console.error("credit_yookassa_topup error", error);
              return new Response("credit error", { status: 500 });
            }
          }
        } else if (verified.status === "canceled") {
          await supabaseAdmin.from("topup_payments")
            .update({ status: "canceled" })
            .eq("yookassa_payment_id", verified.id);
        } else {
          await supabaseAdmin.from("topup_payments")
            .update({ status: verified.status })
            .eq("yookassa_payment_id", verified.id);
        }

        return new Response("ok");
      },
    },
  },
});
