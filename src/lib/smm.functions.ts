import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const API_BASE = "https://smm.media/api/reseller";
const MARKUP_PER_UNIT = 0.5; // ₽ к цене API за 1 единицу

// Наши 8 платформ → ключ платформы в API smm.media
export const PLATFORM_MAP: Record<string, string> = {
  max: "kupit-nakrutku-max",
  vk: "vk",
  telegram: "telegram",
  ok: "nakrutit-odnoklassniki",
  instagram: "kupit-nakrutku-v-instagram",
  rutube: "kupit-nakrutku-v-rutub",
  youtube: "youtube",
  tiktok: "tiktok",
};

function requireToken() {
  const t = process.env.SMM_MEDIA_API_TOKEN;
  if (!t) throw new Error("SMM_MEDIA_API_TOKEN is not configured");
  return t;
}

async function callApi<T = unknown>(path: string, params: Record<string, string | number>): Promise<T> {
  const body = new URLSearchParams();
  body.set("api_token", requireToken());
  for (const [k, v] of Object.entries(params)) body.set(k, String(v));
  const res = await fetch(`${API_BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const text = await res.text();
  let json: unknown = null;
  try { json = JSON.parse(text); } catch { /* keep text */ }
  if (!res.ok) {
    throw new Error(`smm.media ${path} failed [${res.status}]: ${text.slice(0, 300)}`);
  }
  return json as T;
}

// ─── 1. Синхронизация каталога (admin) ─────────────────────────────
export const syncSmmCatalog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Проверяем роль
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("forbidden");

    const data = await callApi<{
      services: Record<string, Record<string, Record<string, {
        service_id: number; price: number; min: number; max: number; name: string; description?: string;
      }>>>;
      status: number;
    }>("services", {});
    if (!data?.services) throw new Error("empty services response");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let imported = 0;
    const platformStats: Record<string, number> = {};
    const keepIds: number[] = [];

    for (const [ourKey, apiKey] of Object.entries(PLATFORM_MAP)) {
      const cats = data.services[apiKey];
      if (!cats) continue;
      for (const [catKey, items] of Object.entries(cats)) {
        for (const svc of Object.values(items)) {
          const priceRub = Math.round((Number(svc.price) + MARKUP_PER_UNIT) * 10000) / 10000;
          const { error } = await supabaseAdmin.rpc("admin_upsert_smm_service", {
            _id: svc.service_id,
            _platform: ourKey,
            _api_platform: apiKey,
            _category: catKey,
            _name: svc.name,
            _description: svc.description ?? "",
            _price_api: svc.price,
            _price_rub: priceRub,
            _min: svc.min,
            _max: svc.max,
          });
          if (error) throw new Error(error.message);
          keepIds.push(svc.service_id);
          imported++;
          platformStats[ourKey] = (platformStats[ourKey] ?? 0) + 1;
        }
      }
    }

    // Деактивируем услуги, которых нет в свежем ответе
    if (keepIds.length) {
      const CHUNK = 1000;
      for (let i = 0; i < keepIds.length; i += CHUNK) {
        // no-op chunk loop – just to keep signature simple
      }
      const { error: deactErr } = await supabaseAdmin
        .from("smm_services")
        .update({ active: false })
        .not("id", "in", `(${keepIds.join(",")})`);
      if (deactErr) throw new Error(deactErr.message);
    }

    return { imported, platforms: platformStats };
  });

// ─── 2. Оплата и отправка заказа в API ─────────────────────────────
export const submitSmmOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({
      service_id: z.number().int().positive(),
      link: z.string().trim().url().max(500),
      quantity: z.number().int().min(1).max(10000000),
    }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    // 1. Списываем и создаём локальный заказ (RLS + функция)
    const { data: orderId, error: chargeErr } = await context.supabase.rpc(
      "charge_and_create_smm_order",
      { _service_id: data.service_id, _link: data.link, _quantity: data.quantity },
    );
    if (chargeErr) throw new Error(chargeErr.message);
    const orderUuid = orderId as unknown as string;

    // 2. Отправляем в API smm.media
    try {
      const apiResp = await callApi<{ order_id?: number; status?: number; message?: string }>(
        "create_order",
        {
          service_id: data.service_id,
          count: data.quantity,
          link: data.link,
        },
      );
      if (!apiResp?.order_id || apiResp.status !== 200) {
        throw new Error(apiResp?.message || `unexpected api response: ${JSON.stringify(apiResp)}`);
      }

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("orders")
        .update({ external_order_id: apiResp.order_id, external_status: "queued", status: "processing" })
        .eq("id", orderUuid);

      return { ok: true, order_id: orderUuid, external_order_id: apiResp.order_id };
    } catch (err) {
      // 3. Возврат средств при провале
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.rpc("refund_smm_order", {
        _order_id: orderUuid,
        _reason: `Ошибка API: ${err instanceof Error ? err.message : String(err)}`.slice(0, 500),
      });
      throw err instanceof Error ? err : new Error(String(err));
    }
  });

// ─── 3. Обновление статуса конкретного заказа ──────────────────────
const STATUS_MAP: Record<number, string> = {
  1: "processing", // В обработке
  2: "awaiting_payment", // Не оплачено
  3: "completed",
  4: "partial",
  5: "cancelled",
  6: "error",
  7: "processing", // Выполняется
  8: "refunded",
  9: "processing",
  10: "processing", // В очереди
};

export const syncSmmOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ order_id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("orders")
      .select("id, external_order_id, status")
      .eq("id", data.order_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row?.external_order_id) throw new Error("order has no external id");

    const resp = await callApi<{
      order?: { id: number; status_id: number; status_name: string };
      status: number;
    }>("order_status", { order_id: row.external_order_id });
    if (!resp?.order) throw new Error("no order in response");

    const newLocal = STATUS_MAP[resp.order.status_id] ?? row.status;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("orders")
      .update({ external_status: resp.order.status_name, status: newLocal })
      .eq("id", row.id);
    return { status: newLocal, external_status: resp.order.status_name };
  });

// ─── 4. Баланс аккаунта smm.media (admin) ──────────────────────────
export const getSmmBalance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId, _role: "admin",
    });
    if (!isAdmin) throw new Error("forbidden");
    const resp = await callApi<{ balance: number; status: number }>("balance", {});
    return { balance: resp.balance };
  });
