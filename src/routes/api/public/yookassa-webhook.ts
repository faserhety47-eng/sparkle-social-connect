import { createFileRoute } from "@tanstack/react-router";

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

        const { createSupabaseServerPublicClient, smmCreateOrder, verifyYooKassaPayment } = await import("@/lib/yookassa.server");
        let verified: { id: string; status: string; paid?: boolean };
        try {
          verified = await verifyYooKassaPayment(paymentId);
        } catch (err) {
          console.error("yookassa verify failed", err);
          return new Response("verify failed", { status: 502 });
        }

        const supabasePublic = createSupabaseServerPublicClient();
        const { data: processed, error: processErr } = await supabasePublic.rpc(
          "process_yookassa_verified" as never,
          { _payment_id: verified.id, _status: verified.status, _paid: Boolean(verified.paid) } as never,
        );
        if (processErr) {
          console.error("process_yookassa_verified error", processErr);
          return new Response("process error", { status: 500 });
        }

        if (verified.status === "succeeded" && verified.paid) {
          const row = (Array.isArray(processed) ? processed[0] : processed) as {
            payment_kind?: string;
            related_order_id?: string | null;
            smm_service_id?: number | null;
            smm_link?: string | null;
            smm_quantity?: number | null;
            needs_smm?: boolean;
          } | undefined;

          if (row?.payment_kind === "guest_order" && row.related_order_id && row.needs_smm && row.smm_service_id && row.smm_link && row.smm_quantity) {
            try {
              const extId = await smmCreateOrder({
                service_id: row.smm_service_id,
                count: row.smm_quantity,
                link: row.smm_link,
              });
              await supabasePublic.rpc("mark_guest_smm_order_started" as never, {
                _order_id: row.related_order_id,
                _external_order_id: extId,
              } as never);
            } catch (err) {
              console.error("smm.media create_order failed", err);
              await supabasePublic.rpc("mark_guest_smm_order_error" as never, {
                _order_id: row.related_order_id,
                _message: `Оплачено, но не удалось запустить: ${err instanceof Error ? err.message : String(err)}`.slice(0, 500),
              } as never);
            }
          }
        }

        return new Response("ok");
      },
    },
  },
});
