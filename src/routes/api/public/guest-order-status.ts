import { createFileRoute } from "@tanstack/react-router";

const SMM_API = "https://smm.media/api/reseller";

const STATUS_MAP: Record<number, string> = {
  1: "processing",
  2: "awaiting_payment",
  3: "completed",
  4: "partial",
  5: "cancelled",
  6: "error",
  7: "processing",
  8: "refunded",
  9: "processing",
  10: "processing",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/api/public/guest-order-status")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { guest_token?: string };
        try { body = await request.json(); } catch { return new Response("bad json", { status: 400 }); }
        const token = String(body?.guest_token ?? "").trim();
        if (!UUID_RE.test(token)) return new Response("bad token", { status: 400 });

        const { createSupabaseServerPublicClient } = await import("@/lib/yookassa.server");
        const sb = createSupabaseServerPublicClient();

        // Read order via admin (bypass RLS on server, token-scoped)
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: order, error } = await supabaseAdmin
          .from("orders")
          .select("id, status, external_status, external_order_id, guest_token")
          .eq("guest_token", token)
          .maybeSingle();
        if (error) return new Response("db error", { status: 500 });
        if (!order) return new Response("not found", { status: 404 });

        // If external order exists, refresh status from smm.media
        if (order.external_order_id) {
          const smmToken = process.env.SMM_MEDIA_API_TOKEN;
          if (smmToken) {
            try {
              const params = new URLSearchParams();
              params.set("api_token", smmToken);
              params.set("order_id", String(order.external_order_id));
              const res = await fetch(`${SMM_API}/order_status`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params,
              });
              const text = await res.text();
              let json: { order?: { status_id: number; status_name: string } } = {};
              try { json = JSON.parse(text); } catch { /* ignore */ }
              if (json?.order) {
                const newLocal = STATUS_MAP[json.order.status_id] ?? order.status;
                await sb.rpc("sync_guest_smm_status" as never, {
                  _guest_token: token,
                  _external_status: json.order.status_name,
                  _local_status: newLocal,
                } as never);
                order.external_status = json.order.status_name;
                order.status = newLocal;
              }
            } catch { /* keep prior status */ }
          }
        }

        return Response.json({
          id: order.id,
          status: order.status,
          external_status: order.external_status,
          external_order_id: order.external_order_id ? String(order.external_order_id) : null,
        });
      },
    },
  },
});
