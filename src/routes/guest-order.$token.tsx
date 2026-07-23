import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { createGuestClient } from "@/lib/guest-client";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { toast } from "sonner";

export const Route = createFileRoute("/guest-order/$token")({
  head: () => ({
    meta: [
      { title: "Ваш заказ — smm-cat.site" },
      { name: "description", content: "Статус и оплата заказа на smm-cat.site без регистрации." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: GuestOrderPage,
});

const STATUS_LABEL: Record<string, string> = {
  awaiting_payment: "Ожидает оплаты",
  payment_reported: "Оплата на проверке",
  paid: "Оплачен, готовим отправку",
  processing: "В работе",
  in_progress: "В работе",
  partial: "Выполнен частично",
  completed: "Выполнен",
  cancelled: "Отменён",
  refunded: "Возврат средств",
  error: "Ошибка — свяжитесь с поддержкой",
};

type Order = {
  id: string;
  status: string;
  platform: string;
  service_type: string;
  link: string;
  quantity: number;
  price_rub: number;
  created_at: string;
  guest_email: string | null;
  guest_contact: string | null;
  external_status: string | null;
  external_order_id: number | null;
};

type Message = { id: string; sender: string; body: string; created_at: string };

function GuestOrderPage() {
  const { token } = Route.useParams();
  const guestClient = useMemo(() => createGuestClient(token), [token]);
  const { methods } = usePaymentMethods();
  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    const { data, error } = await guestClient
      .from("orders")
      .select("id, status, platform, service_type, link, quantity, price_rub, created_at, guest_email, guest_contact, external_status, external_order_id")
      .eq("guest_token", token)
      .maybeSingle();
    if (error || !data) {
      setOrder(null);
    } else {
      setOrder(data as Order);
      const { data: msgs } = await guestClient
        .from("order_messages")
        .select("id, sender, body, created_at")
        .eq("order_id", (data as Order).id)
        .order("created_at", { ascending: true });
      setMessages((msgs ?? []) as Message[]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [token, guestClient]);

  const reportPayment = async () => {
    if (!order) return;
    const { error } = await guestClient
      .from("orders")
      .update({ status: "payment_reported" })
      .eq("guest_token", token);
    if (error) return toast.error("Не удалось: " + error.message);
    toast.success("Мы проверим оплату и запустим заказ");
    load();
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !reply.trim()) return;
    setSending(true);
    const { error } = await guestClient.from("order_messages").insert({
      order_id: order.id,
      sender: "client",
      body: reply.trim().slice(0, 2000),
    } as never);
    setSending(false);
    if (error) return toast.error("Не удалось отправить: " + error.message);
    setReply("");
    load();
  };

  if (loading) {
    return <section className="mx-auto max-w-3xl px-4 py-14 text-muted-foreground">Загрузка…</section>;
  }
  if (!order) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-3xl font-extrabold">Заказ не найден</h1>
        <p className="mt-3 text-muted-foreground">
          Проверьте ссылку. Если вы регистрировались — заказ находится в{" "}
          <Link to="/account" className="text-primary font-semibold">личном кабинете</Link>.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-14 space-y-6">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Гостевой заказ</div>
        <h1 className="mt-1 text-3xl md:text-4xl font-extrabold">
          {order.platform} · {order.service_type}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Сохраните эту страницу — по ссылке вы всегда сможете вернуться к заказу.
        </p>
      </div>

      <div className="rounded-3xl bg-card p-6 md:p-8 shadow-tile space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Статус</div>
          <div className="font-semibold text-primary">{STATUS_LABEL[order.status] ?? order.status}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Ссылка</div>
          <div className="font-mono text-xs break-all text-right max-w-[70%]">{order.link}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Количество</div>
          <div className="font-semibold">{order.quantity}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">К оплате</div>
          <div className="text-2xl font-extrabold text-primary">{order.price_rub} ₽</div>
        </div>
      </div>

      {order.status === "awaiting_payment" && methods.length > 0 && (
        <div className="rounded-3xl bg-card p-6 md:p-8 shadow-tile">
          <h2 className="text-lg font-bold">Оплатите удобным способом</h2>
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
          <button onClick={reportPayment} className="btn-primary w-full mt-6">
            Я оплатил — проверьте
          </button>
        </div>
      )}

      <div className="rounded-3xl bg-card p-6 md:p-8 shadow-tile">
        <h2 className="text-lg font-bold">Сообщения по заказу</h2>
        <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-sm text-muted-foreground">Пока сообщений нет.</div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`rounded-2xl p-3 text-sm ${m.sender === "client" ? "bg-primary/10 ml-8" : "bg-muted mr-8"}`}>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                {m.sender === "client" ? "Вы" : "Поддержка"} · {new Date(m.created_at).toLocaleString("ru-RU")}
              </div>
              <div className="whitespace-pre-wrap">{m.body}</div>
            </div>
          ))}
        </div>
        <form onSubmit={send} className="mt-4 flex gap-2">
          <input value={reply} onChange={(e) => setReply(e.target.value)} maxLength={2000}
            placeholder="Ваше сообщение…"
            className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <button type="submit" disabled={sending || !reply.trim()} className="btn-primary disabled:opacity-60">
            Отправить
          </button>
        </form>
      </div>
    </section>
  );
}
