import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SERVICES } from "@/data/services";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { useServicePrices } from "@/hooks/useServicePrices";
import { usePlatforms } from "@/hooks/usePlatforms";
import { useServiceTypes } from "@/hooks/useServiceTypes";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";

type Search = { platform?: string };

export const Route = createFileRoute("/order")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    platform: typeof s.platform === "string" ? s.platform : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Оформить заказ — smm-cat.site" },
      { name: "description", content: "Оформите заказ на накрутку подписчиков, лайков или просмотров в Max, VK, Telegram, Одноклассники, Instagram, RuTube и YouTube." },
      { property: "og:title", content: "Оформить заказ — smm-cat.site" },
      { property: "og:description", content: "Быстрое оформление SMM-заказа." },
    ],
  }),
  component: OrderPage,
});

const schema = z.object({
  platform: z.string().min(1),
  type: z.string().min(1),
  link: z.string().trim().url({ message: "Введите корректную ссылку" }).max(500),
  count: z.number().int().min(10, "Минимум 10").max(1000000, "Слишком большое количество"),
});

function linkPlaceholder(platformId: string) {
  switch (platformId) {
    case "vk": return "https://vk.com/username";
    case "telegram": return "https://t.me/channelname";
    case "tiktok": return "https://tiktok.com/@username";
    case "ok": return "https://ok.ru/profile/username";
    case "instagram": return "https://instagram.com/username";
    case "rutube": return "https://rutube.ru/video/video_id";
    case "youtube": return "https://youtube.com/@username";
    case "max": return "https://max.ru/username";
    default: return "https://example.com/username";
  }
}

function OrderPage() {
  const { platform: initial } = Route.useSearch();
  const { user, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const { getPrice } = useServicePrices();
  const { platforms } = usePlatforms();
  const { types } = useServiceTypes();
  const { methods } = usePaymentMethods();

  const [platform, setPlatform] = useState(initial ?? "");
  const [type, setType] = useState("");
  const [link, setLink] = useState("");
  const [count, setCount] = useState(100);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestContact, setGuestContact] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!platform && platforms.length) setPlatform(initial ?? platforms[0].id);
  }, [platforms, platform, initial]);
  useEffect(() => {
    if (!type && types.length) setType(types[0].id);
  }, [types, type]);

  const unitPrice = getPrice(platform, type);
  const price = useMemo(() => +(unitPrice * count).toFixed(2), [unitPrice, count]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ platform, type, link, count });
    if (!result.success) return toast.error(result.error.issues[0].message);

    if (!user) {
      const emailOk = z.string().trim().email().safeParse(guestEmail).success;
      if (!emailOk && !guestContact.trim()) {
        return toast.error("Укажите email или контакт для связи");
      }
    }

    setLoading(true);
    const payload: Record<string, unknown> = {
      platform: result.data.platform,
      service_type: result.data.type,
      link: result.data.link,
      quantity: result.data.count,
      price_rub: price,
    };
    if (user) {
      payload.user_id = user.id;
    } else {
      payload.guest_email = guestEmail.trim() || null;
      payload.guest_contact = guestContact.trim() || null;
    }

    const { data, error } = await supabase
      .from("orders")
      .insert(payload as never)
      .select("id, guest_token")
      .single();
    setLoading(false);

    if (error) return toast.error("Не удалось создать заказ: " + error.message);
    toast.success("Заказ создан. Осталось оплатить.");
    if (user) {
      navigate({ to: "/account", search: { order: data.id } as never });
    } else {
      try {
        const saved = JSON.parse(localStorage.getItem("guest_orders") || "[]");
        saved.unshift({ id: data.id, token: data.guest_token, at: Date.now() });
        localStorage.setItem("guest_orders", JSON.stringify(saved.slice(0, 20)));
      } catch {}
      navigate({ to: "/guest-order/$token", params: { token: data.guest_token as string } });
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl md:text-4xl font-extrabold">Оформить заказ</h1>
      <p className="mt-2 text-muted-foreground">
        Заполните форму. После создания заказа вы увидите реквизиты для оплаты.
      </p>

      {!sessionLoading && !user && (
        <div className="mt-6 rounded-2xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
          Можно оформить заказ без регистрации — доступ к заказу сохранится по ссылке.
          Или <Link to="/login" className="text-primary font-semibold">войдите</Link> /{" "}
          <Link to="/register" className="text-primary font-semibold">зарегистрируйтесь</Link>,
          чтобы видеть все заказы в личном кабинете.
        </div>
      )}


      <form onSubmit={submit} className="mt-8 rounded-3xl bg-card p-6 md:p-8 shadow-tile space-y-6">
        <div>
          <label className="text-sm font-semibold">Платформа</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {platforms.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">Тип услуги</label>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {types.map((t) => (
              <button type="button" key={t.id} onClick={() => setType(t.id)}
                className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                  type === t.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                }`}>
                {t.label}
                <div className="text-[11px] text-muted-foreground font-normal mt-0.5">{getPrice(platform, t.id)} ₽/шт</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold">Ссылка на объект накрутки</label>
          <input type="url" value={link} onChange={(e) => setLink(e.target.value)}
            placeholder="https://instagram.com/username" required maxLength={500}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div>
          <label className="text-sm font-semibold">Количество</label>
          <input type="number" min={10} max={1000000} value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        {!user && (
          <div className="grid gap-4 sm:grid-cols-2 rounded-2xl border border-dashed border-border p-4">
            <div className="sm:col-span-2 text-xs text-muted-foreground">
              Контакты для связи по заказу (без регистрации). Достаточно одного поля.
            </div>
            <div>
              <label className="text-sm font-semibold">Email</label>
              <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="you@example.com" maxLength={255}
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-semibold">Telegram / телефон</label>
              <input type="text" value={guestContact} onChange={(e) => setGuestContact(e.target.value)}
                placeholder="@username или +7…" maxLength={100}
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between rounded-2xl bg-muted p-4">
          <div className="text-sm text-muted-foreground">Итоговая стоимость</div>
          <div className="text-2xl font-extrabold text-primary">{price.toFixed(2)} ₽</div>
        </div>


        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? "Создаём заказ…" : "Оформить и перейти к оплате"}
        </button>
      </form>

      {methods.length > 0 && (
        <div className="mt-8 rounded-3xl bg-card p-6 md:p-8 shadow-tile">
          <h2 className="text-lg font-bold">Способы оплаты</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {methods.map((m) => (
              <div key={m.id} className="rounded-2xl border border-border p-4">
                <div className="font-semibold">{m.label}</div>
                {m.details && <div className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">{m.details}</div>}
                {m.url && (
                  <a href={m.url} target="_blank" rel="noreferrer"
                    className="mt-3 inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold hover:bg-primary/20">
                    Открыть ссылку →
                  </a>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            После создания заказа реквизиты будут закреплены в личном кабинете. Платформы: {SERVICES.map(s=>s.name).join(", ")}.
          </p>
        </div>
      )}
    </section>
  );
}
