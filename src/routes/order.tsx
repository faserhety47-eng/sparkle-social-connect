import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SERVICES } from "@/data/services";
import { toast } from "sonner";
import { z } from "zod";

type Search = { platform?: string };

export const Route = createFileRoute("/order")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    platform: typeof s.platform === "string" ? s.platform : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Оформить заказ — SMM Rails" },
      { name: "description", content: "Оформите заказ на накрутку подписчиков, лайков или просмотров в Max, VK, Telegram, Одноклассники, Instagram, RuTube и YouTube." },
      { property: "og:title", content: "Оформить заказ — SMM Rails" },
      { property: "og:description", content: "Быстрое оформление SMM-заказа." },
    ],
  }),
  component: OrderPage,
});

const SERVICE_TYPES = [
  { id: "followers", label: "Подписчики", price: 0.5 },
  { id: "likes", label: "Лайки", price: 0.2 },
  { id: "views", label: "Просмотры", price: 0.05 },
  { id: "comments", label: "Комментарии", price: 2 },
];

const schema = z.object({
  platform: z.string().min(1),
  type: z.string().min(1),
  link: z.string().trim().url({ message: "Введите корректную ссылку" }).max(500),
  count: z.number().int().min(10, "Минимум 10").max(1000000, "Слишком большое количество"),
});

function OrderPage() {
  const { platform: initial } = Route.useSearch();
  const [platform, setPlatform] = useState(initial ?? SERVICES[0].id);
  const [type, setType] = useState(SERVICE_TYPES[0].id);
  const [link, setLink] = useState("");
  const [count, setCount] = useState(100);
  const [loading, setLoading] = useState(false);

  const price = useMemo(() => {
    const t = SERVICE_TYPES.find((x) => x.id === type)!;
    return (t.price * count).toFixed(2);
  }, [type, count]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ platform, type, link, count });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    const orderId = Math.floor(100000 + Math.random() * 900000);
    toast.success(`Заказ #${orderId} создан`, {
      description: `${SERVICE_TYPES.find(t => t.id === type)?.label} · ${count} шт · ${price} ₽`,
    });
    setLoading(false);
  };

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl md:text-4xl font-extrabold">Оформить заказ</h1>
      <p className="mt-2 text-muted-foreground">
        Заполните форму — заказ уйдёт в обработку в течение нескольких минут.
      </p>

      <form onSubmit={submit} className="mt-8 rounded-3xl bg-card p-6 md:p-8 shadow-tile space-y-6">
        <div>
          <label className="text-sm font-semibold">Платформа</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {SERVICES.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">Тип услуги</label>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SERVICE_TYPES.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setType(t.id)}
                className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                  type === t.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {t.label}
                <div className="text-[11px] text-muted-foreground font-normal mt-0.5">
                  от {t.price} ₽/шт
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold">Ссылка на объект накрутки</label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://instagram.com/username"
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            required
            maxLength={500}
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Количество</label>
          <input
            type="number"
            min={10}
            max={1000000}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-muted p-4">
          <div className="text-sm text-muted-foreground">Итоговая стоимость</div>
          <div className="text-2xl font-extrabold text-primary">{price} ₽</div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? "Создаём заказ…" : "Оформить заказ"}
        </button>
        <p className="text-xs text-muted-foreground text-center">
          Демо-режим: заказ создаётся локально без реального списания.
        </p>
      </form>
    </section>
  );
}
