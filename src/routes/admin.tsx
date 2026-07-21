import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { SERVICES } from "@/data/services";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Админ — Oz Top" },
      { name: "description", content: "Управление заказами Oz Top." },
    ],
  }),
  component: AdminPage,
});

type Order = {
  id: string;
  user_id: string;
  platform: string;
  service_type: string;
  link: string;
  quantity: number;
  price_rub: number;
  status: string;
  created_at: string;
  payment_note: string | null;
};

type Profile = { id: string; email: string | null; name: string | null };

const STATUSES: { key: string; label: string; color: string }[] = [
  { key: "awaiting_payment", label: "Ожидает оплаты", color: "bg-amber-500/15 text-amber-400" },
  { key: "payment_reported", label: "Оплата на проверке", color: "bg-blue-500/15 text-blue-400" },
  { key: "paid", label: "Оплачен", color: "bg-emerald-500/15 text-emerald-400" },
  { key: "processing", label: "В работе", color: "bg-violet-500/15 text-violet-400" },
  { key: "completed", label: "Выполнен", color: "bg-emerald-500/15 text-emerald-400" },
  { key: "cancelled", label: "Отменён", color: "bg-red-500/15 text-red-400" },
];

const TYPE_LABEL: Record<string, string> = {
  followers: "Подписчики", likes: "Лайки", views: "Просмотры", comments: "Комментарии",
};

function AdminPage() {
  const { user, loading: sessionLoading } = useSession();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (sessionLoading || adminLoading) return;
    if (!user) { navigate({ to: "/login" }); return; }
    if (!isAdmin) return;
    (async () => {
      const { data: ord, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) { toast.error(error.message); setLoading(false); return; }
      const list = (ord ?? []) as Order[];
      setOrders(list);
      const ids = [...new Set(list.map((o) => o.user_id))];
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, email, name").in("id", ids);
        const map: Record<string, Profile> = {};
        (profs ?? []).forEach((p) => (map[p.id] = p as Profile));
        setProfiles(map);
      }
      setLoading(false);
    })();
  }, [user, isAdmin, sessionLoading, adminLoading, navigate]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o)));
    toast.success("Статус обновлён");
  };

  const updatePrice = async (id: string, price: number) => {
    if (!Number.isFinite(price) || price < 0) { toast.error("Некорректная цена"); return; }
    const { error } = await supabase.from("orders").update({ price_rub: price }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, price_rub: price } : o)));
    toast.success("Цена обновлена");
  };

  if (sessionLoading || adminLoading) {
    return <section className="mx-auto max-w-6xl px-4 py-14 text-muted-foreground">Загрузка…</section>;
  }
  if (!isAdmin) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Доступ запрещён</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          У вашего аккаунта нет прав администратора. Чтобы выдать их, добавьте свой user_id в таблицу <code>user_roles</code> с ролью <code>admin</code>.
        </p>
        <p className="mt-4 text-xs text-muted-foreground break-all">Ваш ID: {user?.id}</p>
      </section>
    );
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Админ-панель</h1>
          <p className="mt-2 text-muted-foreground text-sm">Всего заказов: {orders.length}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${filter === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
            Все
          </button>
          {STATUSES.map((s) => (
            <button key={s.key} onClick={() => setFilter(s.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${filter === s.key ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-10 text-muted-foreground">Загрузка заказов…</div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-card p-10 text-center shadow-tile text-muted-foreground">
          Заказов нет
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {filtered.map((o) => {
            const s = STATUSES.find((x) => x.key === o.status) ?? { label: o.status, color: "bg-muted text-foreground" };
            const platform = SERVICES.find((p) => p.id === o.platform)?.name ?? o.platform;
            const prof = profiles[o.user_id];
            return (
              <div key={o.id} className="rounded-3xl bg-card p-6 shadow-tile">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">#{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleString("ru-RU")}</div>
                    <div className="mt-1 text-lg font-bold">
                      {platform} · {TYPE_LABEL[o.service_type] ?? o.service_type}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground break-all">{o.link}</div>
                    <div className="mt-2 text-sm">
                      Количество: <span className="font-semibold">{o.quantity.toLocaleString("ru-RU")}</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Клиент: {prof?.email ?? o.user_id}
                      {prof?.name ? ` · ${prof.name}` : ""}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${s.color}`}>{s.label}</span>
                    <PriceEditor price={Number(o.price_rub)} onSave={(p) => updatePrice(o.id, p)} />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-border/60 pt-4">
                  {STATUSES.map((st) => (
                    <button key={st.key} onClick={() => updateStatus(o.id, st.key)} disabled={o.status === st.key}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                        o.status === st.key
                          ? "bg-muted text-muted-foreground border-transparent cursor-default"
                          : "border-border hover:bg-primary hover:text-primary-foreground hover:border-primary"
                      }`}>
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function PriceEditor({ price, onSave }: { price: number; onSave: (p: number) => void | Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(price.toFixed(2));

  if (!editing) {
    return (
      <button
        onClick={() => { setValue(price.toFixed(2)); setEditing(true); }}
        className="mt-3 text-2xl font-extrabold text-primary hover:underline"
        title="Изменить цену"
      >
        {price.toFixed(2)} ₽
      </button>
    );
  }
  return (
    <div className="mt-3 flex items-center gap-2 justify-end">
      <input
        type="number" step="0.01" min="0" autoFocus
        value={value} onChange={(e) => setValue(e.target.value)}
        className="w-28 rounded-lg border border-border bg-background px-2 py-1 text-right text-lg font-bold"
      />
      <span className="text-sm text-muted-foreground">₽</span>
      <button
        onClick={async () => { await onSave(parseFloat(value)); setEditing(false); }}
        className="rounded-lg bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold"
      >OK</button>
      <button
        onClick={() => setEditing(false)}
        className="rounded-lg border border-border px-3 py-1 text-xs"
      >×</button>
    </div>
  );
}
