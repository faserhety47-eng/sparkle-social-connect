import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { SERVICES } from "@/data/services";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { OrderMessages } from "@/components/site/OrderMessages";
import { createYookassaTopup } from "@/lib/yookassa.functions";
import { toast } from "sonner";
import { reachGoal } from "@/lib/metrika";

type Search = { order?: string };

export const Route = createFileRoute("/account")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    order: typeof s.order === "string" ? s.order : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Личный кабинет — smm-cat.site" },
      { name: "description", content: "История заказов и оплата в smm-cat.site." },
      { property: "og:title", content: "Личный кабинет — smm-cat.site" },
      { property: "og:description", content: "Управление заказами smm-cat.site." },
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

type Txn = {
  id: string;
  amount_rub: number;
  kind: string;
  note: string | null;
  order_id: string | null;
  created_at: string;
};

const KIND_LABEL: Record<string, string> = {
  topup: "Пополнение",
  spend: "Оплата заказа",
  refund: "Возврат",
  adjust: "Корректировка",
};

function AccountPage() {
  const { order: highlightId } = Route.useSearch();
  const { user, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [showTxns, setShowTxns] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openChat, setOpenChat] = useState<Record<string, boolean>>({});
  const { methods } = usePaymentMethods();
  const [topupAmount, setTopupAmount] = useState<number>(500);
  const [topupLoading, setTopupLoading] = useState(false);
  const createTopup = useServerFn(createYookassaTopup);

  const handleTopup = async () => {
    if (!topupAmount || topupAmount < 100) return toast.error("Минимум 100 ₽");
    if (topupAmount > 300000) return toast.error("Максимум 300 000 ₽");
    setTopupLoading(true);
    try {
      const res = await createTopup({
        data: { amount: Number(topupAmount), return_url: `${window.location.origin}/account` },
      });
      window.location.href = res.confirmation_url;
    } catch (err) {
      toast.error("Не удалось создать платёж: " + (err instanceof Error ? err.message : String(err)));
      setTopupLoading(false);
    }
  };

  const loadAll = async () => {
    const [ordersRes, profRes, txnRes] = await Promise.all([
      supabase.from("orders")
        .select("id, platform, service_type, link, quantity, price_rub, status, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("balance_rub").eq("id", user!.id).maybeSingle(),
      supabase.from("balance_transactions")
        .select("id, amount_rub, kind, note, order_id, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    if (ordersRes.error) toast.error(ordersRes.error.message);
    setOrders((ordersRes.data ?? []) as Order[]);
    setBalance(Number((profRes.data as { balance_rub?: number } | null)?.balance_rub ?? 0));
    setTxns((txnRes.data ?? []) as Txn[]);
  };

  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    (async () => {
      await loadAll();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sessionLoading, navigate]);

  const markPaid = async (id: string) => {
    const { error } = await supabase.from("orders").update({ status: "payment_reported" }).eq("id", id);
    if (error) return toast.error(error.message);
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status: "payment_reported" } : x)));
    toast.success("Спасибо! Проверим оплату в течение 15 минут.");
  };

  const payFromBalance = async (id: string, price: number) => {
    if (balance < price) return toast.error("Недостаточно средств на балансе");
    const { error } = await supabase.rpc("pay_order_from_balance", { _order_id: id });
    if (error) return toast.error(error.message);
    toast.success("Заказ оплачен с баланса");
    reachGoal("paid_order", { order_id: id, amount: price, source: "balance" });
    await loadAll();
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

      <div className="mt-8 rounded-3xl bg-card p-6 shadow-tile">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Баланс</div>
            <div className="mt-1 text-3xl md:text-4xl font-extrabold text-primary">
              {balance.toFixed(2)} ₽
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Пополните баланс онлайн через ЮKassa — деньги зачислятся автоматически.
            </p>
          </div>
          <button
            onClick={() => setShowTxns((v) => !v)}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:border-primary/50"
          >
            {showTxns ? "Скрыть историю" : "История пополнений"}
          </button>
        </div>

        <div id="topup" className="mt-5 rounded-2xl border border-border bg-background/50 p-4">
          <div className="text-sm font-semibold">Пополнить баланс</div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {[300, 500, 1000, 2000, 5000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setTopupAmount(v)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  topupAmount === v
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {v} ₽
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="number"
              min={100}
              max={300000}
              value={topupAmount}
              onChange={(e) => setTopupAmount(Number(e.target.value))}
              className="w-40 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-sm text-muted-foreground">₽ (от 100 до 300 000)</span>
            <button
              onClick={handleTopup}
              disabled={topupLoading}
              className="btn-primary text-sm disabled:opacity-60"
            >
              {topupLoading ? "Открываем ЮKassa…" : "Оплатить через ЮKassa"}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Оплата картой, СБП, ЮMoney и другими способами. Средства зачислятся автоматически после подтверждения платежа.
          </p>
        </div>
        {showTxns && (
          <div className="mt-4 border-t border-border pt-4">
            {txns.length === 0 ? (
              <div className="text-sm text-muted-foreground">Операций пока нет.</div>
            ) : (
              <ul className="divide-y divide-border/60 text-sm">
                {txns.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <div className="font-semibold">{KIND_LABEL[t.kind] ?? t.kind}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(t.created_at).toLocaleString("ru-RU")}
                        {t.note ? ` · ${t.note}` : ""}
                        {t.order_id ? ` · #${t.order_id.slice(0, 8)}` : ""}
                      </div>
                    </div>
                    <div className={`text-right font-extrabold ${Number(t.amount_rub) >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {Number(t.amount_rub) >= 0 ? "+" : ""}{Number(t.amount_rub).toFixed(2)} ₽
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
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
                      <button
                        onClick={() => payFromBalance(o.id, Number(o.price_rub))}
                        disabled={balance < Number(o.price_rub)}
                        className="rounded-full border border-primary/40 text-primary px-4 py-2 text-sm font-semibold hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={balance < Number(o.price_rub) ? "Недостаточно средств на балансе" : ""}
                      >
                        Оплатить с баланса ({balance.toFixed(2)} ₽)
                      </button>
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
