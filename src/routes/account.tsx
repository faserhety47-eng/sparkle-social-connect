import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { SERVICES } from "@/data/services";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { OrderMessages } from "@/components/site/OrderMessages";
import { toast } from "sonner";

type Search = { order?: string };

export const Route = createFileRoute("/account")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    order: typeof s.order === "string" ? s.order : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Личный кабинет — Oz Top" },
      { name: "description", content: "История заказов и оплата в Oz Top." },
      { property: "og:title", content: "Личный кабинет — Oz Top" },
      { property: "og:description", content: "Управление заказами Oz Top." },
    ],
  }),
  component: AccountPage,
});

type Order = {
  id: string;
  platform: string;
  service_type: string;
  link: string;
  quantity: number;
  price_rub: number;
  status: string;
  created_at: string;
};

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  awaiting_payment: { text: "Ожидает оплаты", color: "bg-amber-500/15 text-amber-400" },
  payment_reported: { text: "Оплата на проверке", color: "bg-blue-500/15 text-blue-400" },
  paid: { text: "Оплачен", color: "bg-emerald-500/15 text-emerald-400" },
  processing: { text: "В работе", color: "bg-violet-500/15 text-violet-400" },
  completed: { text: "Выполнен", color: "bg-emerald-500/15 text-emerald-400" },
  cancelled: { text: "Отменён", color: "bg-red-500/15 text-red-400" },
};

const TYPE_LABEL: Record<string, string> = {
  followers: "Подписчики", likes: "Лайки", views: "Просмотры", comments: "Комментарии",
};

function AccountPage() {
  const { order: highlightId } = Route.useSearch();
  const { user, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [openChat, setOpenChat] = useState<Record<string, boolean>>({});
  const { methods } = usePaymentMethods();

  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, platform, service_type, link, quantity, price_rub, status, created_at")
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setOrders((data ?? []) as Order[]);
      setLoading(false);
    })();
  }, [user, sessionLoading, navigate]);

  const markPaid = async (id: string) => {
    const { error } = await supabase.from("orders").update({ status: "payment_reported" }).eq("id", id);
    if (error) return toast.error(error.message);
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status: "payment_reported" } : x)));
    toast.success("Спасибо! Проверим оплату в течение 15 минут.");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (sessionLoading || loading) {
    return <section className="mx-auto max-w-4xl px-4 py-14 text-muted-foreground">Загрузка…</section>;
  }

  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Личный кабинет</h1>
          <p className="mt-2 text-muted-foreground text-sm">{user?.email}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/order" className="btn-primary text-sm">Новый заказ</Link>
          <button onClick={logout} className="btn-ghost text-sm border border-border rounded-full px-4">Выйти</button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-card p-10 text-center shadow-tile">
          <div className="text-lg font-semibold">У вас пока нет заказов</div>
          <p className="mt-1 text-sm text-muted-foreground">Оформите первый заказ, чтобы начать продвижение.</p>
          <Link to="/order" className="btn-primary mt-6 inline-flex">Оформить заказ</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o) => {
            const s = STATUS_LABEL[o.status] ?? { text: o.status, color: "bg-muted text-foreground" };
            const platform = SERVICES.find((p) => p.id === o.platform)?.name ?? o.platform;
            const isHighlighted = o.id === highlightId;
            return (
              <div key={o.id}
                className={`rounded-3xl bg-card p-6 shadow-tile ${isHighlighted ? "ring-2 ring-primary" : ""}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-xs text-muted-foreground">Заказ #{o.id.slice(0, 8)}</div>
                    <div className="mt-1 text-lg font-bold">
                      {platform} · {TYPE_LABEL[o.service_type] ?? o.service_type}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground break-all">{o.link}</div>
                    <div className="mt-2 text-sm">
                      Количество: <span className="font-semibold">{o.quantity.toLocaleString("ru-RU")}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${s.color}`}>{s.text}</span>
                    <div className="mt-3 text-2xl font-extrabold text-primary">{Number(o.price_rub).toFixed(2)} ₽</div>
                  </div>
                </div>

                {o.status === "awaiting_payment" && (
                  <div className="mt-5 rounded-2xl border border-border bg-background/50 p-5">
                    <div className="text-sm font-semibold">Реквизиты для оплаты</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Сумма: <span className="font-bold text-primary">{Number(o.price_rub).toFixed(2)} ₽</span>{" "}
                      · Комментарий: <span className="font-mono">Заказ #{o.id.slice(0, 8)}</span>
                    </div>
                    {methods.length === 0 ? (
                      <p className="mt-3 text-xs text-muted-foreground">Способы оплаты пока не добавлены администратором.</p>
                    ) : (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {methods.map((m) => (
                          <div key={m.id} className="rounded-xl border border-border p-3 text-sm">
                            <div className="font-semibold">{m.label}</div>
                            {m.details && <div className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">{m.details}</div>}
                            {m.url && (
                              <a href={m.url} target="_blank" rel="noreferrer"
                                className="mt-2 inline-flex rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold hover:bg-primary/20">
                                Оплатить →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => markPaid(o.id)} className="btn-primary text-sm">Я оплатил</button>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <button
                    onClick={() => setOpenChat((s) => ({ ...s, [o.id]: !s[o.id] }))}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {openChat[o.id] ? "Скрыть переписку" : "Открыть переписку с администратором"}
                  </button>
                  {openChat[o.id] && user && (
                    <OrderMessages orderId={o.id} currentUserId={user.id} sender="user" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
