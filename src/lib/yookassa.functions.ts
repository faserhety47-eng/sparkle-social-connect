import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const YK_API = "https://api.yookassa.ru/v3";

function ykAuthHeader() {
  const shop = process.env.YOOKASSA_SHOP_ID;
  const secret = process.env.YOOKASSA_SECRET_KEY;
  if (!shop || !secret) throw new Error("YooKassa credentials not configured");
  return "Basic " + Buffer.from(`${shop}:${secret}`).toString("base64");
}

export const createYookassaTopup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({
      amount: z.number().min(100).max(300000),
      return_url: z.string().url(),
    }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Local row (без payment_id — заполним после ответа API)
    const { data: row, error: insErr } = await supabaseAdmin
      .from("topup_payments")
      .insert({
        user_id: context.userId,
        amount_rub: data.amount,
        status: "pending",
      })
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);

    // 2. Создаём платёж в ЮKassa
    const idempotencyKey = crypto.randomUUID();
    const body = {
      amount: { value: data.amount.toFixed(2), currency: "RUB" },
      capture: true,
      confirmation: { type: "redirect", return_url: data.return_url },
      description: `Пополнение баланса smm-cat.site · ${context.userId.slice(0, 8)}`,
      metadata: { user_id: context.userId, topup_id: row.id },
    };

    const res = await fetch(`${YK_API}/payments`, {
      method: "POST",
      headers: {
        "Authorization": ykAuthHeader(),
        "Idempotence-Key": idempotencyKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      await supabaseAdmin.from("topup_payments")
        .update({ status: "failed" }).eq("id", row.id);
      throw new Error(`YooKassa error [${res.status}]: ${text.slice(0, 300)}`);
    }
    const payment = JSON.parse(text) as {
      id: string;
      status: string;
      confirmation?: { confirmation_url?: string };
    };

    await supabaseAdmin.from("topup_payments")
      .update({
        yookassa_payment_id: payment.id,
        status: payment.status,
      })
      .eq("id", row.id);

    const url = payment.confirmation?.confirmation_url;
    if (!url) throw new Error("YooKassa: confirmation_url missing");
    return { confirmation_url: url, payment_id: payment.id };
  });
