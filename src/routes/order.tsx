import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useSession } from "@/hooks/useSession";
import { usePlatforms } from "@/hooks/usePlatforms";
import { useSmmServices, humanizeCategory, type SmmService } from "@/hooks/useSmmServices";
import { submitSmmOrder } from "@/lib/smm.functions";
import { createGuestOrderPayment } from "@/lib/yookassa.functions";
import { reachGoal } from "@/lib/metrika";

type Search = { platform?: string };

export const Route = createFileRoute("/order")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    platform: typeof s.platform === "string" ? s.platform : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Оформить заказ — smm-cat.site" },
      { name: "description", content: "Оформите заказ на накрутку. Оплата с баланса и мгновенная отправка в работу." },
      { property: "og:title", content: "Оформить заказ — smm-cat.site" },
      { property: "og:description", content: "Быстрое оформление SMM-заказа с автосписанием." },
      { property: "og:url", content: "https://smm-cat.site/order" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://smm-cat.site/order" }],
  }),
  component: OrderPage,
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
  const { platforms } = usePlatforms();
  const submit = useServerFn(submitSmmOrder);
  const createGuest = useServerFn(createGuestOrderPayment);

  const [platform, setPlatform] = useState(initial ?? "");
  const [category, setCategory] = useState("");
  const [serviceId, setServiceId] = useState<number | "">("");
  const [link, setLink] = useState("");
  const [count, setCount] = useState(100);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestContact, setGuestContact] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!platform && platforms.length) setPlatform(initial ?? platforms[0].id);
  }, [platforms, platform, initial]);

  const { services, loading: svcLoading } = useSmmServices(platform);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of services) map.set(s.category, (map.get(s.category) ?? 0) + 1);
    return Array.from(map.entries());
  }, [services]);

  useEffect(() => {
    if (categories.length && !categories.find(([c]) => c === category)) {
      setCategory(categories[0][0]);
    }
  }, [categories, category]);

  const filtered = useMemo(
    () => services.filter((s) => s.category === category),
    [services, category],
  );

  useEffect(() => {
    if (filtered.length && !filtered.find((s) => s.id === serviceId)) {
      setServiceId(filtered[0].id);
    }
  }, [filtered, serviceId]);

  const selected: SmmService | undefined = filtered.find((s) => s.id === serviceId);
  const price = useMemo(() => {
    const unitPrice = Number(selected?.price_rub ?? 0);
    const quantity = Number.isFinite(count) ? count : 0;
    return +(unitPrice * quantity).toFixed(2);
  }, [selected, count]);

  useEffect(() => {
    if (!selected) return;
    if (count < selected.min_qty) setCount(selected.min_qty);
    else if (count > selected.max_qty) setCount(selected.max_qty);
    // Only re-clamp when the chosen service changes, not on every count edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, selected?.min_qty, selected?.max_qty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return toast.error("Выберите услугу");
    const linkOk = z.string().trim().url().max(500).safeParse(link).success;
    if (!linkOk) return toast.error("Введите корректную ссылку");
    if (count < selected.min_qty || count > selected.max_qty) {
      return toast.error(`Количество должно быть от ${selected.min_qty} до ${selected.max_qty}`);
    }

    // Гостевой заказ → оплата через ЮKassa
    if (!user) {
      const emailOk = z.string().trim().email().safeParse(guestEmail).success;
      if (!emailOk) return toast.error("Укажите корректный email для чека и связи");
      if (price < 100) return toast.error("Минимальная сумма гостевого заказа — 100 ₽. Увеличьте количество или войдите в аккаунт.");
      setLoading(true);
      try {
        const res = await createGuest({
          data: {
            service_id: selected.id,
            link: link.trim(),
            quantity: count,
            email: guestEmail.trim(),
            contact: guestContact.trim(),
            return_url: `${window.location.origin}/order`,
          },
        });
        window.location.href = res.confirmation_url;
      } catch (err) {
        toast.error("Не удалось создать оплату: " + (err instanceof Error ? err.message : String(err)));
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await submit({ data: { service_id: selected.id, link: link.trim(), quantity: count } });
      reachGoal("paid_order", { order_id: res.order_id, external_id: res.external_order_id, source: "balance" });
      toast.success(`Заказ #${res.external_order_id} отправлен в работу`);
      navigate({ to: "/account", search: { order: res.order_id } as never });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/insufficient balance/i.test(msg)) {
        toast.error("Недостаточно средств. Пополните баланс в личном кабинете.");
      } else if (/auth required/i.test(msg)) {
        toast.error("Войдите, чтобы оформить заказ");
      } else {
        toast.error("Не удалось создать заказ: " + msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl md:text-4xl font-extrabold">Оформить заказ</h1>
      <p className="mt-2 text-muted-foreground">
        {user
          ? "Выберите услугу — стоимость спишется с баланса и заказ моментально уйдёт в работу."
          : "Оформите заказ без регистрации — оплата картой, СБП или ЮMoney через ЮKassa. После оплаты заказ уйдёт в работу автоматически."}
      </p>

      {!sessionLoading && !user && (
        <div className="mt-6 rounded-2xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
          Есть аккаунт с балансом?{" "}
          <Link to="/login" className="text-primary font-semibold">Войти</Link>
          {" "}или{" "}
          <Link to="/register" className="text-primary font-semibold">зарегистрироваться</Link>.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 rounded-3xl bg-card p-6 md:p-8 shadow-tile space-y-6">
        <div>
          <label className="text-sm font-semibold">Платформа</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {platforms.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">Категория услуги</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={!categories.length}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {svcLoading && <option>Загружаем…</option>}
            {!svcLoading && !categories.length && <option>Нет доступных услуг — админ должен обновить каталог</option>}
            {categories.map(([c, n]) => (
              <option key={c} value={c}>{humanizeCategory(c)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">Услуга</label>
          <select value={serviceId} onChange={(e) => setServiceId(Number(e.target.value))} disabled={!filtered.length}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {filtered.map((s) => (
              <option key={s.id} value={s.id}>
                {s.price_rub.toFixed(3)} ₽/шт — {s.name}
              </option>
            ))}
          </select>
          {selected?.description && (
            <p className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4">{selected.description}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold">Ссылка на объект накрутки</label>
          <input type="url" value={link} onChange={(e) => setLink(e.target.value)}
            placeholder={linkPlaceholder(platform)} required maxLength={500}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div>
          <label className="text-sm font-semibold">
            Количество
            {selected && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                от {selected.min_qty} до {selected.max_qty}
              </span>
            )}
          </label>
          <input type="number"
            min={selected?.min_qty ?? 10} max={selected?.max_qty ?? 1000000}
            value={Number.isFinite(count) ? count : ""} onChange={(e) => {
              const next = e.target.valueAsNumber;
              setCount(Number.isFinite(next) ? next : 0);
            }}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        {!user && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Email для чека</label>
              <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)}
                required maxLength={200} placeholder="you@example.com"
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-semibold">Контакт для связи <span className="text-xs font-normal text-muted-foreground">(необязательно)</span></label>
              <input type="text" value={guestContact} onChange={(e) => setGuestContact(e.target.value)}
                maxLength={200} placeholder="Telegram, WhatsApp, телефон"
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between rounded-2xl bg-muted p-4">
          <div className="text-sm text-muted-foreground">{user ? "Спишется с баланса" : "К оплате через ЮKassa"}</div>
          <div className="text-2xl font-extrabold text-primary">{price.toFixed(2)} ₽</div>
        </div>

        {!user && price > 0 && price < 100 && (
          <p className="text-xs text-amber-600">
            Минимальная сумма гостевой оплаты — 100 ₽. Увеличьте количество или войдите в аккаунт.
          </p>
        )}

        <button type="submit" disabled={loading || !selected}
          className="btn-primary w-full disabled:opacity-60">
          {loading
            ? (user ? "Отправляем…" : "Открываем ЮKassa…")
            : user
              ? "Оплатить с баланса и отправить в работу"
              : "Перейти к оплате через ЮKassa"}
        </button>
      </form>
    </section>
  );
}
