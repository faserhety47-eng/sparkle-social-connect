import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SERVICES } from "@/data/services";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { useServicePrices, SERVICE_TYPE_LIST } from "@/hooks/useServicePrices";

type Search = { platform?: string };

export const Route = createFileRoute("/order")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    platform: typeof s.platform === "string" ? s.platform : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Оформить заказ — Oz Top" },
      { name: "description", content: "Оформите заказ на накрутку подписчиков, лайков или просмотров в Max, VK, Telegram, Одноклассники, Instagram, RuTube и YouTube." },
      { property: "og:title", content: "Оформить заказ — Oz Top" },
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

function OrderPage() {
  const { platform: initial } = Route.useSearch();
  const { user, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const { getPrice } = useServicePrices();

  const [platform, setPlatform] = useState(initial ?? SERVICES[0].id);
  const [type, setType] = useState(SERVICE_TYPE_LIST[0].id);
  const [link, setLink] = useState("");
  const [count, setCount] = useState(100);
  const [loading, setLoading] = useState(false);

  const unitPrice = getPrice(platform, type);
  const price = useMemo(() => +(unitPrice * count).toFixed(2), [unitPrice, count]);


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info("Войдите или зарегистрируйтесь, чтобы оформить заказ");
      navigate({ to: "/login" });
      return;
    }
    const result = schema.safeParse({ platform, type, link, count });
    if (!result.success) return toast.error(result.error.issues[0].message);

    setLoading(true);
    const { data, error } = await supabase.from("orders").insert({
      user_id: user.id,
      platform: result.data.platform,
      service_type: result.data.type,
      link: result.data.link,
      quantity: result.data.count,
      price_rub: price,
    }).select("id").single();
    setLoading(false);

    if (error) return toast.error("Не удалось создать заказ: " + error.message);
    toast.success("Заказ создан. Осталось оплатить.");
    navigate({ to: "/account", search: { order: data.id } as never });
  };

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl md:text-4xl font-extrabold">Оформить заказ</h1>
      <p className="mt-2 text-muted-foreground">
        Заполните форму. После создания заказа вы увидите реквизиты для оплаты.
      </p>

      {!sessionLoading && !user && (
        <div className="mt-6 rounded-2xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
          Чтобы оформить заказ, нужно <Link to="/login" className="text-primary font-semibold">войти</Link> или{" "}
          <Link to="/register" className="text-primary font-semibold">зарегистрироваться</Link>.
        </div>
      )}

      <form onSubmit={submit} className="mt-8 rounded-3xl bg-card p-6 md:p-8 shadow-tile space-y-6">
        <div>
          <label className="text-sm font-semibold">Платформа</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {SERVICES.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">Тип услуги</label>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SERVICE_TYPE_LIST.map((t) => (
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

        <div className="flex items-center justify-between rounded-2xl bg-muted p-4">
          <div className="text-sm text-muted-foreground">Итоговая стоимость</div>
          <div className="text-2xl font-extrabold text-primary">{price.toFixed(2)} ₽</div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? "Создаём заказ…" : "Оформить и перейти к оплате"}
        </button>
      </form>
    </section>
  );
}
