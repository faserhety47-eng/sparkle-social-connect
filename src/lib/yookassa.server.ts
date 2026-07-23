import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const YK_API = "https://api.yookassa.ru/v3";
const SMM_API = "https://smm.media/api/reseller";

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }
    if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

export function createSupabaseServerPublicClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing backend public configuration");

  return createClient<Database>(url, key, {
    global: { fetch: createSupabaseFetch(key) },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function ykAuthHeader() {
  const shop = process.env.YOOKASSA_SHOP_ID;
  const secret = process.env.YOOKASSA_SECRET_KEY;
  if (!shop || !secret) throw new Error("YooKassa credentials not configured");
  return "Basic " + Buffer.from(`${shop}:${secret}`).toString("base64");
}

export type YooKassaPayment = {
  id: string;
  status: string;
  paid?: boolean;
  confirmation?: { confirmation_url?: string };
};

export async function createYooKassaPayment(body: unknown): Promise<YooKassaPayment> {
  const res = await fetch(`${YK_API}/payments`, {
    method: "POST",
    headers: {
      "Authorization": ykAuthHeader(),
      "Idempotence-Key": crypto.randomUUID(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`YooKassa error [${res.status}]: ${text.slice(0, 300)}`);
  }
  return JSON.parse(text) as YooKassaPayment;
}

export async function verifyYooKassaPayment(paymentId: string): Promise<YooKassaPayment> {
  const res = await fetch(`${YK_API}/payments/${paymentId}`, {
    headers: { Authorization: ykAuthHeader() },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`YooKassa verify failed [${res.status}]: ${text.slice(0, 300)}`);
  }
  return JSON.parse(text) as YooKassaPayment;
}

export async function smmCreateOrder(params: { service_id: number; count: number; link: string }) {
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