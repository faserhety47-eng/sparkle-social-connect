import { createFileRoute } from "@tanstack/react-router";

const YK_API = "https://api.yookassa.ru/v3";

// ЮKassa не подписывает нотификации — проверяем платёж запросом к API.
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

        // Верифицируем платёж у ЮKassa
        const res = await fetch(`${YK_API}/payments/${paymentId}`, {
          headers: { Authorization: auth },
        });
        if (!res.ok) {
          console.error("yookassa verify failed", res.status, await res.text());
          return new Response("verify failed", { status: 502 });
        }
        const verified = (await res.json()) as { id: string; status: string; paid?: boolean };

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (verified.status === "succeeded" && verified.paid) {
          const { error } = await supabaseAdmin.rpc("credit_yookassa_topup", {
            _payment_id: verified.id,
          });
          if (error) {
            console.error("credit_yookassa_topup error", error);
            return new Response("credit error", { status: 500 });
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
