import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const createYookassaTopup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({
      amount: z.number().min(100).max(300000),
      return_url: z.string().url(),
    }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { createYooKassaPayment } = await import("@/lib/yookassa.server");

    const { data: topupId, error: topupErr } = await context.supabase.rpc(
      "create_account_yookassa_topup" as never,
      { _amount: data.amount } as never,
    );
    if (topupErr) throw new Error(topupErr.message);
    const topup_id = topupId as unknown as string;

    const body = {
      amount: { value: data.amount.toFixed(2), currency: "RUB" },
      capture: true,
      confirmation: { type: "redirect", return_url: data.return_url },
      description: `Пополнение баланса smm-cat.site · ${context.userId.slice(0, 8)}`,
      metadata: { user_id: context.userId, topup_id },
    };

    const payment = await createYooKassaPayment(body);

    const { error: attachErr } = await context.supabase.rpc(
      "attach_yookassa_payment" as never,
      { _topup_id: topup_id, _payment_id: payment.id, _status: payment.status } as never,
    );
    if (attachErr) throw new Error(attachErr.message);

    const url = payment.confirmation?.confirmation_url;
    if (!url) throw new Error("YooKassa: confirmation_url missing");
    return { confirmation_url: url, payment_id: payment.id };
  });

// ─── Гостевой заказ + оплата через ЮKassa (без регистрации) ───────
export const createGuestOrderPayment = createServerFn({ method: "POST" })
  .inputValidator((raw) =>
    z.object({
      service_id: z.number().int().positive(),
      link: z.string().trim().url().max(500),
      quantity: z.number().int().min(1).max(10000000),
      email: z.string().trim().email().max(200),
      contact: z.string().trim().max(200).optional().default(""),
      return_url: z.string().url(),
    }).parse(raw),
  )
  .handler(async ({ data }) => {
    const { createSupabaseServerPublicClient, createYooKassaPayment } = await import("@/lib/yookassa.server");
    const supabasePublic = createSupabaseServerPublicClient();

    const { data: rpc, error: rpcErr } = await supabasePublic.rpc("create_guest_yookassa_payment" as never, {
      _service_id: data.service_id,
      _link: data.link,
      _quantity: data.quantity,
      _email: data.email,
      _contact: data.contact ?? "",
    } as never);
    if (rpcErr) throw new Error(rpcErr.message);
    const rowRet = (Array.isArray(rpc) ? rpc[0] : rpc) as {
      order_id: string;
      guest_token: string;
      amount: number;
      topup_id: string;
    };
    const orderId = rowRet.order_id as string;
    const guestToken = rowRet.guest_token as string;
    const amount = Number(rowRet.amount);

    const returnUrl = `${new URL(data.return_url).origin}/guest-order/${guestToken}`;
    const body = {
      amount: { value: amount.toFixed(2), currency: "RUB" },
      capture: true,
      confirmation: { type: "redirect", return_url: returnUrl },
      description: `Заказ smm-cat.site · ${orderId.slice(0, 8)}`,
      receipt: {
        customer: { email: data.email },
        items: [{
          description: `Услуга #${data.service_id} · ${data.quantity} шт.`.slice(0, 128),
          quantity: "1.00",
          amount: { value: amount.toFixed(2), currency: "RUB" },
          vat_code: 1,
          payment_mode: "full_payment",
          payment_subject: "service",
        }],
      },
      metadata: { order_id: orderId, topup_id: rowRet.topup_id, kind: "guest_order" },
    };

    const payment = await createYooKassaPayment(body);

    const { error: attachErr } = await supabasePublic.rpc("attach_yookassa_payment" as never, {
      _topup_id: rowRet.topup_id,
      _payment_id: payment.id,
      _status: payment.status,
    } as never);
    if (attachErr) throw new Error(attachErr.message);

    const url = payment.confirmation?.confirmation_url;
    if (!url) throw new Error("YooKassa: confirmation_url missing");
    return { confirmation_url: url, guest_token: guestToken, order_id: orderId };
  });
