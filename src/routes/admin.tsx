import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { SERVICES } from "@/data/services";
import { useServicePrices } from "@/hooks/useServicePrices";
import { usePlatforms, type Platform } from "@/hooks/usePlatforms";
import { useServiceTypes, type ServiceType } from "@/hooks/useServiceTypes";
import { usePaymentMethods, type PaymentMethod } from "@/hooks/usePaymentMethods";
import { OrderMessages } from "@/components/site/OrderMessages";
import { IconPicker } from "@/components/site/IconPicker";
import { parseBuiltinIcon } from "@/data/icon-library";
import { useAdminNotifier } from "@/hooks/useAdminNotifier";
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

type Profile = { id: string; email: string | null; name: string | null; balance_rub?: number | null };

const STATUSES: { key: string; label: string; color: string }[] = [
  { key: "awaiting_payment", label: "Ожидает оплаты", color: "bg-amber-500/15 text-amber-400" },
  { key: "payment_reported", label: "Оплата на проверке", color: "bg-blue-500/15 text-blue-400" },
  { key: "paid", label: "Оплачен", color: "bg-emerald-500/15 text-emerald-400" },
  { key: "processing", label: "В работе", color: "bg-violet-500/15 text-violet-400" },
  { key: "completed", label: "Выполнен", color: "bg-emerald-500/15 text-emerald-400" },
  { key: "cancelled", label: "Отменён", color: "bg-red-500/15 text-red-400" },
];

type Tab = "dashboard" | "orders" | "users" | "balance" | "promos" | "prices" | "platforms" | "types" | "payments" | "actions" | "settings";

async function logAction(adminId: string, action: string, targetType?: string, targetId?: string, details?: Record<string, unknown>) {
  try {
    await supabase.from("admin_actions").insert({
      admin_id: adminId, action, target_type: targetType ?? null, target_id: targetId ?? null, details: details ?? null,
    });
  } catch { /* ignore */ }
}

const STATUS_MESSAGES: Record<string, string> = {
  payment_reported: "Спасибо! Мы получили информацию об оплате и проверяем её.",
  paid: "Оплата подтверждена. Приступаем к выполнению заказа.",
  processing: "Заказ взят в работу. Скоро всё будет готово ✨",
  completed: "Заказ выполнен! Спасибо, что выбрали нас 💜",
  cancelled: "Заказ отменён. Если это ошибка — напишите нам в чате.",
};

function AdminPage() {
  const { user, loading: sessionLoading } = useSession();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("orders");

  useAdminNotifier(!sessionLoading && !adminLoading && !!user, user?.id);

  useEffect(() => {
    if (sessionLoading || adminLoading) return;
    if (!user) navigate({ to: "/login" });
  }, [user, sessionLoading, adminLoading, navigate]);

  if (sessionLoading || adminLoading) {
    return <section className="mx-auto max-w-6xl px-4 py-14 text-muted-foreground">Загрузка…</section>;
  }
  if (!isAdmin) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Доступ запрещён</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          У вашего аккаунта нет прав администратора.
        </p>
        <p className="mt-4 text-xs text-muted-foreground break-all">Ваш ID: {user?.id}</p>
      </section>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "dashboard", label: "Дашборд" },
    { key: "orders", label: "Заказы" },
    { key: "users", label: "Пользователи" },
    { key: "balance", label: "Баланс" },
    { key: "prices", label: "Цены" },
    { key: "platforms", label: "Платформы" },
    { key: "types", label: "Типы услуг" },
    { key: "payments", label: "Способы оплаты" },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl md:text-4xl font-extrabold">Админ-панель</h1>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-3">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
              tab === t.key ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <DashboardTab />}
      {tab === "orders" && user && <OrdersTab adminId={user.id} />}
      {tab === "users" && user && <UsersTab currentUserId={user.id} />}
      {tab === "balance" && <BalanceTab />}
      {tab === "prices" && <PricesManager />}
      {tab === "platforms" && <PlatformsManager />}
      {tab === "types" && <ServiceTypesManager />}
      {tab === "payments" && <PaymentMethodsManager />}
    </section>
  );
}

function OrdersTab({ adminId }: { adminId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [openChat, setOpenChat] = useState<Record<string, boolean>>({});
  const { platforms } = usePlatforms({ onlyActive: false });
  const { types } = useServiceTypes({ onlyActive: false });

  const platformName = (id: string) =>
    platforms.find((p) => p.id === id)?.name ?? SERVICES.find((p) => p.id === id)?.name ?? id;
  const typeLabel = (id: string) => types.find((t) => t.id === id)?.label ?? id;

  useEffect(() => {
    (async () => {
      const { data: ord, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) { toast.error(error.message); setLoading(false); return; }
      const list = (ord ?? []) as Order[];
      setOrders(list);
      const ids = [...new Set(list.map((o) => o.user_id))];
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, email, name, balance_rub").in("id", ids);
        const map: Record<string, Profile> = {};
        (profs ?? []).forEach((p) => (map[p.id] = p as Profile));
        setProfiles(map);
      }
      setLoading(false);
    })();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o)));
    const autoMsg = STATUS_MESSAGES[status];
    if (autoMsg) {
      await supabase.from("order_messages").insert({
        order_id: id, sender: "admin", author_id: adminId, body: autoMsg,
      });
    }
    toast.success("Статус обновлён");
  };

  const updatePrice = async (id: string, price: number) => {
    if (!Number.isFinite(price) || price < 0) { toast.error("Некорректная цена"); return; }
    const { error } = await supabase.from("orders").update({ price_rub: price }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, price_rub: price } : o)));
    toast.success("Цена обновлена");
  };

  const q = query.trim().toLowerCase();
  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (!q) return true;
    const prof = profiles[o.user_id];
    return (
      o.id.toLowerCase().includes(q) ||
      o.link.toLowerCase().includes(q) ||
      platformName(o.platform).toLowerCase().includes(q) ||
      typeLabel(o.service_type).toLowerCase().includes(q) ||
      (prof?.email ?? "").toLowerCase().includes(q) ||
      (prof?.name ?? "").toLowerCase().includes(q)
    );
  });

  const exportCsv = () => {
    const rows = [
      ["ID", "Дата", "Клиент", "Email", "Платформа", "Услуга", "Ссылка", "Кол-во", "Цена ₽", "Статус"],
      ...filtered.map((o) => {
        const p = profiles[o.user_id];
        return [
          o.id, new Date(o.created_at).toLocaleString("ru-RU"),
          p?.name ?? "", p?.email ?? "",
          platformName(o.platform), typeLabel(o.service_type),
          o.link, String(o.quantity), String(o.price_rub), o.status,
        ];
      }),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск: ID, ссылка, email, клиент…"
          className="flex-1 min-w-52 rounded-full border border-border bg-background px-4 py-2 text-sm" />
        <button onClick={exportCsv}
          className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:border-primary/50">
          Экспорт CSV
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${filter === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
          Все ({orders.length})
        </button>
        {STATUSES.map((s) => (
          <button key={s.key} onClick={() => setFilter(s.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${filter === s.key ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-10 text-muted-foreground">Загрузка заказов…</div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-card p-10 text-center shadow-tile text-muted-foreground">Заказов нет</div>
      ) : (
        <div className="mt-8 space-y-4">
          {filtered.map((o) => {
            const s = STATUSES.find((x) => x.key === o.status) ?? { label: o.status, color: "bg-muted text-foreground" };
            const prof = profiles[o.user_id];
            return (
              <div key={o.id} className="rounded-3xl bg-card p-6 shadow-tile">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">#{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleString("ru-RU")}</div>
                    <div className="mt-1 text-lg font-bold">{platformName(o.platform)} · {typeLabel(o.service_type)}</div>
                    <div className="mt-1 text-sm text-muted-foreground break-all">{o.link}</div>
                    <div className="mt-2 text-sm">Количество: <span className="font-semibold">{o.quantity.toLocaleString("ru-RU")}</span></div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Клиент: {prof?.email ?? o.user_id}{prof?.name ? ` · ${prof.name}` : ""}
                      {prof?.balance_rub !== undefined && (
                        <span className="ml-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          Баланс: {Number(prof.balance_rub).toFixed(2)} ₽
                        </span>
                      )}
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
                        o.status === st.key ? "bg-muted text-muted-foreground border-transparent cursor-default"
                          : "border-border hover:bg-primary hover:text-primary-foreground hover:border-primary"
                      }`}>
                      {st.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => setOpenChat((s) => ({ ...s, [o.id]: !s[o.id] }))}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {openChat[o.id] ? "Скрыть переписку" : "Написать клиенту"}
                  </button>
                  {openChat[o.id] && (
                    <OrderMessages orderId={o.id} currentUserId={adminId} sender="admin" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PriceEditor({ price, onSave }: { price: number; onSave: (p: number) => void | Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(price.toFixed(2));
  if (!editing) {
    return (
      <div className="mt-3 flex flex-col items-end gap-1.5">
        <div className="text-2xl font-extrabold text-primary">{price.toFixed(2)} ₽</div>
        <button onClick={() => { setValue(price.toFixed(2)); setEditing(true); }}
          className="rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary transition">
          Изменить цену
        </button>
      </div>
    );
  }
  return (
    <div className="mt-3 flex items-center gap-2 justify-end">
      <input type="number" step="0.01" min="0" autoFocus value={value} onChange={(e) => setValue(e.target.value)}
        className="w-28 rounded-lg border border-border bg-background px-2 py-1 text-right text-lg font-bold" />
      <span className="text-sm text-muted-foreground">₽</span>
      <button onClick={async () => { await onSave(parseFloat(value)); setEditing(false); }}
        className="rounded-lg bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">OK</button>
      <button onClick={() => setEditing(false)} className="rounded-lg border border-border px-3 py-1 text-xs">×</button>
    </div>
  );
}

function PricesManager() {
  const { prices, loading, reload } = useServicePrices();
  const { platforms } = usePlatforms({ onlyActive: false });
  const { types } = useServiceTypes({ onlyActive: false });
  const [saving, setSaving] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const keyOf = (platform: string, type: string) => `${platform}:${type}`;
  const getVal = (platform: string, type: string) => {
    const k = keyOf(platform, type);
    if (drafts[k] !== undefined) return drafts[k];
    const p = prices.find((x) => x.platform === platform && x.service_type === type);
    return p ? String(p.price_per_unit) : "0";
  };

  const save = async (platform: string, type: string) => {
    const k = keyOf(platform, type);
    const val = parseFloat(getVal(platform, type));
    if (!Number.isFinite(val) || val < 0) { toast.error("Некорректная цена"); return; }
    setSaving(k);
    const existing = prices.find((x) => x.platform === platform && x.service_type === type);
    const { error } = existing
      ? await supabase.from("service_prices").update({ price_per_unit: val }).eq("id", existing.id)
      : await supabase.from("service_prices").insert({ platform, service_type: type, price_per_unit: val });
    setSaving(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Цена сохранена");
    setDrafts((d) => { const n = { ...d }; delete n[k]; return n; });
    reload();
  };

  return (
    <div className="mt-6 rounded-3xl bg-card p-6 md:p-8 shadow-tile">
      <h2 className="text-xl md:text-2xl font-extrabold">Цены на услуги (₽ за 1 шт.)</h2>
      <p className="mt-1 text-sm text-muted-foreground">Используются в форме заказа.</p>
      {loading ? (
        <div className="mt-6 text-muted-foreground">Загрузка цен…</div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-4 font-semibold">Платформа</th>
                {types.map((t) => (<th key={t.id} className="py-2 px-2 font-semibold">{t.label}</th>))}
              </tr>
            </thead>
            <tbody>
              {platforms.map((s) => (
                <tr key={s.id} className="border-b border-border/50">
                  <td className="py-3 pr-4 font-semibold">{s.name}</td>
                  {types.map((t) => {
                    const k = keyOf(s.id, t.id);
                    return (
                      <td key={t.id} className="py-3 px-2">
                        <div className="flex items-center gap-1.5">
                          <input type="number" step="0.01" min="0" value={getVal(s.id, t.id)}
                            onChange={(e) => setDrafts((d) => ({ ...d, [k]: e.target.value }))}
                            className="w-24 rounded-lg border border-border bg-background px-2 py-1.5 text-right" />
                          <button onClick={() => save(s.id, t.id)} disabled={saving === k}
                            className="rounded-lg bg-primary text-primary-foreground px-2.5 py-1.5 text-xs font-semibold disabled:opacity-60">
                            {saving === k ? "…" : "Сохранить"}
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PlatformsManager() {
  const { platforms, loading, reload } = usePlatforms({ onlyActive: false });
  const [form, setForm] = useState({
    id: "",
    name: "",
    description: "",
    color: "#7B4FFF",
    icon_url: "",
    icon_emoji: "",
    letter: "",
    sort_order: 100,
  });

  const add = async () => {
    if (!form.id.trim() || !form.name.trim()) return toast.error("Заполните ID и название");
    const { error } = await supabase.from("platforms").insert({
      id: form.id.trim().toLowerCase(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      color: form.color || "#7B4FFF",
      icon_url: form.icon_url.trim() || null,
      icon_emoji: form.icon_emoji.trim() || null,
      letter: form.letter.trim() || null,
      sort_order: Number(form.sort_order) || 100,
    });
    if (error) return toast.error(error.message);
    toast.success("Платформа добавлена");
    setForm({ id: "", name: "", description: "", color: "#7B4FFF", icon_url: "", icon_emoji: "", letter: "", sort_order: 100 });
    reload();
  };

  const update = async (p: Platform, patch: Partial<Platform>) => {
    const { error } = await supabase.from("platforms").update(patch).eq("id", p.id);
    if (error) return toast.error(error.message);
    reload();
  };

  const remove = async (id: string) => {
    if (!confirm("Удалить платформу? Существующие заказы останутся.")) return;
    const { error } = await supabase.from("platforms").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Удалено");
    reload();
  };

  const previewIcon = (p: { icon_url: string | null; icon_emoji: string | null; letter: string | null; name: string; color: string }) => {
    const builtin = parseBuiltinIcon(p.icon_url);
    return (
      <div className="h-12 w-12 shrink-0 rounded-xl flex items-center justify-center overflow-hidden ring-1 ring-white/5"
        style={{ backgroundColor: p.color || "#7B4FFF" }}>
        {builtin?.imageUrl ? (
          <img src={builtin.imageUrl} alt="" className="h-7 w-7 object-contain" />
        ) : builtin?.Icon ? (
          <builtin.Icon width={26} height={26} color="#ffffff" />
        ) : p.icon_url ? (
          <img src={p.icon_url} alt="" className="h-7 w-7 object-contain" />
        ) : p.icon_emoji ? (
          <span className="text-xl">{p.icon_emoji}</span>
        ) : (
          <span className="text-white font-bold">{p.letter ?? p.name.slice(0, 1)}</span>
        )}
      </div>
    );
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-3xl bg-card p-6 shadow-tile">
        <h2 className="text-lg font-bold">Добавить платформу / соцсеть</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Иконка: укажите ссылку на картинку (PNG/SVG) или эмодзи, или букву-заглушку. Цвет — фон плитки.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input placeholder="ID (латиницей, напр. tiktok)" value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <input placeholder="Название (напр. TikTok)" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <input placeholder="Описание (напр. Короткие видео)" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="sm:col-span-2 rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <div className="sm:col-span-2">
            <div className="text-xs text-muted-foreground mb-1">Иконка соцсети</div>
            <IconPicker
              value={form.icon_url}
              onChange={(url, color) =>
                setForm({ ...form, icon_url: url ?? "", color: color ?? form.color })
              }
            />
          </div>
          <input placeholder="Или ссылка на картинку (https://…)" value={form.icon_url.startsWith("builtin:") ? "" : form.icon_url}
            onChange={(e) => setForm({ ...form, icon_url: e.target.value })}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <input placeholder="Или эмодзи (📱)" value={form.icon_emoji}
            onChange={(e) => setForm({ ...form, icon_emoji: e.target.value })}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <div className="flex items-center gap-2">
            <input type="color" value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="h-10 w-14 rounded-lg border border-input bg-background cursor-pointer" />
            <input placeholder="Цвет плитки (#RRGGBB)" value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <input placeholder="Буква-заглушка (напр. T)" value={form.letter}
            onChange={(e) => setForm({ ...form, letter: e.target.value })}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <input type="number" placeholder="Порядок" value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="mt-4 flex items-center gap-3">
          {previewIcon({ ...form, icon_url: form.icon_url || null, icon_emoji: form.icon_emoji || null, letter: form.letter || null })}
          <button onClick={add} className="btn-primary text-sm">Добавить платформу</button>
        </div>
      </div>

      <div className="rounded-3xl bg-card p-6 shadow-tile">
        <h2 className="text-lg font-bold">Платформы</h2>
        {loading ? (
          <div className="mt-4 text-muted-foreground">Загрузка…</div>
        ) : (
          <div className="mt-4 space-y-3">
            {platforms.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border p-4 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {previewIcon(p)}
                  <div className="text-xs text-muted-foreground w-16">{p.id}</div>
                  <input defaultValue={p.name} onBlur={(e) => e.target.value !== p.name && update(p, { name: e.target.value })}
                    className="flex-1 min-w-40 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-semibold" />
                  <input type="number" defaultValue={p.sort_order}
                    onBlur={(e) => Number(e.target.value) !== p.sort_order && update(p, { sort_order: Number(e.target.value) })}
                    className="w-20 rounded-lg border border-input bg-background px-2 py-1.5 text-sm text-right" />
                  <label className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" checked={p.is_active} onChange={(e) => update(p, { is_active: e.target.checked })} />
                    Активна
                  </label>
                  <button onClick={() => remove(p.id)} className="text-xs text-red-400 hover:underline">Удалить</button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input defaultValue={p.description ?? ""} placeholder="Описание"
                    onBlur={(e) => (e.target.value || null) !== p.description && update(p, { description: e.target.value || null })}
                    className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm" />
                  <div className="sm:col-span-2">
                    <IconPicker
                      value={p.icon_url}
                      onChange={(url, color) =>
                        update(p, color && !p.icon_url?.startsWith("builtin:") ? { icon_url: url, color } : { icon_url: url })
                      }
                    />
                  </div>
                  <input defaultValue={p.icon_url && !p.icon_url.startsWith("builtin:") ? p.icon_url : ""} placeholder="Или ссылка на картинку"
                    onBlur={(e) => (e.target.value || null) !== p.icon_url && update(p, { icon_url: e.target.value || null })}
                    className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm" />
                  <input defaultValue={p.icon_emoji ?? ""} placeholder="Эмодзи"
                    onBlur={(e) => (e.target.value || null) !== p.icon_emoji && update(p, { icon_emoji: e.target.value || null })}
                    className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm" />
                  <div className="flex items-center gap-2">
                    <input type="color" defaultValue={p.color || "#7B4FFF"}
                      onBlur={(e) => e.target.value !== p.color && update(p, { color: e.target.value })}
                      className="h-9 w-12 rounded-lg border border-input bg-background cursor-pointer" />
                    <input defaultValue={p.color || ""} placeholder="Цвет #RRGGBB"
                      onBlur={(e) => e.target.value !== p.color && update(p, { color: e.target.value })}
                      className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


function ServiceTypesManager() {
  const { types, loading, reload } = useServiceTypes({ onlyActive: false });
  const [form, setForm] = useState({ id: "", label: "", description: "", sort_order: 100 });

  const add = async () => {
    if (!form.id.trim() || !form.label.trim()) return toast.error("Заполните поля");
    const { error } = await supabase.from("service_types").insert({
      id: form.id.trim().toLowerCase(),
      label: form.label.trim(),
      description: form.description.trim() || null,
      sort_order: Number(form.sort_order) || 100,
    });
    if (error) return toast.error(error.message);
    toast.success("Тип добавлен");
    setForm({ id: "", label: "", description: "", sort_order: 100 });
    reload();
  };
  const update = async (t: ServiceType, patch: Partial<ServiceType>) => {
    const { error } = await supabase.from("service_types").update(patch).eq("id", t.id);
    if (error) return toast.error(error.message);
    reload();
  };
  const remove = async (id: string) => {
    if (!confirm("Удалить тип услуги?")) return;
    const { error } = await supabase.from("service_types").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Тип удалён");
    reload();
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-3xl bg-card p-6 shadow-tile">
        <h2 className="text-lg font-bold">Добавить тип услуги</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_120px_auto]">
          <input placeholder="ID (напр. reposts)" value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <input placeholder="Название (напр. Репосты)" value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <input type="number" placeholder="Порядок" value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <button onClick={add} className="btn-primary text-sm">Добавить</button>
        </div>
        <textarea
          placeholder="Описание (необязательно) — короткая подсказка для клиента"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="mt-3 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="rounded-3xl bg-card p-6 shadow-tile">
        <h2 className="text-lg font-bold">Типы услуг</h2>
        {loading ? (
          <div className="mt-4 text-muted-foreground">Загрузка…</div>
        ) : (
          <div className="mt-4 space-y-3">
            {types.map((t) => (
              <div key={t.id} className="rounded-2xl border border-border p-3 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-xs text-muted-foreground w-20">{t.id}</div>
                  <input defaultValue={t.label} onBlur={(e) => e.target.value !== t.label && update(t, { label: e.target.value })}
                    className="flex-1 min-w-40 rounded-lg border border-input bg-background px-3 py-1.5 text-sm" />
                  <input type="number" defaultValue={t.sort_order}
                    onBlur={(e) => Number(e.target.value) !== t.sort_order && update(t, { sort_order: Number(e.target.value) })}
                    className="w-20 rounded-lg border border-input bg-background px-2 py-1.5 text-sm text-right" />
                  <label className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" checked={t.is_active} onChange={(e) => update(t, { is_active: e.target.checked })} />
                    Активен
                  </label>
                  <button onClick={() => remove(t.id)} className="text-xs text-red-400 hover:underline">Удалить</button>
                </div>
                <textarea
                  defaultValue={t.description ?? ""}
                  placeholder="Описание для клиента"
                  rows={2}
                  onBlur={(e) => {
                    const val = e.target.value.trim();
                    const next = val === "" ? null : val;
                    if (next !== (t.description ?? null)) update(t, { description: next });
                  }}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentMethodsManager() {
  const { methods, loading, reload } = usePaymentMethods({ onlyActive: false });
  const [form, setForm] = useState({ label: "", url: "", details: "", sort_order: 100 });

  const add = async () => {
    if (!form.label.trim()) return toast.error("Укажите название");
    const { error } = await supabase.from("payment_methods").insert({
      label: form.label.trim(),
      url: form.url.trim() || null,
      details: form.details.trim() || null,
      sort_order: Number(form.sort_order) || 100,
    });
    if (error) return toast.error(error.message);
    toast.success("Способ оплаты добавлен");
    setForm({ label: "", url: "", details: "", sort_order: 100 });
    reload();
  };
  const update = async (m: PaymentMethod, patch: Partial<PaymentMethod>) => {
    const { error } = await supabase.from("payment_methods").update(patch).eq("id", m.id);
    if (error) return toast.error(error.message);
    reload();
  };
  const remove = async (id: string) => {
    if (!confirm("Удалить способ оплаты?")) return;
    const { error } = await supabase.from("payment_methods").delete().eq("id", id);
    if (error) return toast.error(error.message);
    reload();
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-3xl bg-card p-6 shadow-tile">
        <h2 className="text-lg font-bold">Добавить способ оплаты</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Ссылка может вести на СБП QR, форму банка, Т-Кассу, ЮMoney, крипто-кошелёк и т.п.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input placeholder="Название (напр. СБП Т-Банк)" value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <input placeholder="Ссылка на оплату (https://…)" value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <textarea placeholder="Детали (телефон СБП, номер карты, получатель, комментарий)"
            value={form.details} rows={3}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
            className="sm:col-span-2 rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <input type="number" placeholder="Порядок" value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            className="w-32 rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <button onClick={add} className="btn-primary text-sm mt-3">Добавить способ оплаты</button>
      </div>

      <div className="rounded-3xl bg-card p-6 shadow-tile">
        <h2 className="text-lg font-bold">Способы оплаты</h2>
        {loading ? (
          <div className="mt-4 text-muted-foreground">Загрузка…</div>
        ) : methods.length === 0 ? (
          <div className="mt-4 text-muted-foreground text-sm">Пока не добавлено ни одного способа.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {methods.map((m) => (
              <div key={m.id} className="rounded-2xl border border-border p-4 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <input defaultValue={m.label}
                    onBlur={(e) => e.target.value !== m.label && update(m, { label: e.target.value })}
                    className="flex-1 min-w-48 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-semibold" />
                  <input type="number" defaultValue={m.sort_order}
                    onBlur={(e) => Number(e.target.value) !== m.sort_order && update(m, { sort_order: Number(e.target.value) })}
                    className="w-20 rounded-lg border border-input bg-background px-2 py-1.5 text-sm text-right" />
                  <label className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" checked={m.is_active}
                      onChange={(e) => update(m, { is_active: e.target.checked })} />
                    Активен
                  </label>
                  <button onClick={() => remove(m.id)} className="text-xs text-red-400 hover:underline">Удалить</button>
                </div>
                <input defaultValue={m.url ?? ""} placeholder="Ссылка на оплату"
                  onBlur={(e) => (e.target.value || null) !== m.url && update(m, { url: e.target.value || null })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm" />
                <textarea defaultValue={m.details ?? ""} placeholder="Детали" rows={2}
                  onBlur={(e) => (e.target.value || null) !== m.details && update(m, { details: e.target.value || null })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardTab() {
  const [stats, setStats] = useState<{
    total: number; today: number; awaiting: number; processing: number; completed: number;
    revenueTotal: number; revenueToday: number; revenueMonth: number;
    recent: Order[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      const list = (data ?? []) as Order[];
      const now = new Date();
      const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const paidStatuses = new Set(["paid", "processing", "completed"]);
      let revenueTotal = 0, revenueToday = 0, revenueMonth = 0;
      let today = 0, awaiting = 0, processing = 0, completed = 0;
      for (const o of list) {
        const t = new Date(o.created_at).getTime();
        const price = Number(o.price_rub) || 0;
        if (t >= startDay) today++;
        if (o.status === "awaiting_payment" || o.status === "payment_reported") awaiting++;
        if (o.status === "processing") processing++;
        if (o.status === "completed") completed++;
        if (paidStatuses.has(o.status)) {
          revenueTotal += price;
          if (t >= startDay) revenueToday += price;
          if (t >= startMonth) revenueMonth += price;
        }
      }
      setStats({
        total: list.length, today, awaiting, processing, completed,
        revenueTotal, revenueToday, revenueMonth,
        recent: list.slice(0, 5),
      });
      setLoading(false);
    })();
  }, []);

  if (loading || !stats) return <div className="mt-6 text-muted-foreground">Загрузка…</div>;

  const Card = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
    <div className="rounded-3xl bg-card p-5 shadow-tile">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Заказов всего" value={stats.total.toString()} hint={`Сегодня: +${stats.today}`} />
        <Card label="Ожидают оплаты" value={stats.awaiting.toString()} hint="Требуют внимания" />
        <Card label="В работе" value={stats.processing.toString()} hint={`Выполнено: ${stats.completed}`} />
        <Card label="Выручка (всё время)" value={`${stats.revenueTotal.toLocaleString("ru-RU")} ₽`} hint={`Сегодня: ${stats.revenueToday.toLocaleString("ru-RU")} ₽ · Месяц: ${stats.revenueMonth.toLocaleString("ru-RU")} ₽`} />
      </div>

      <div className="rounded-3xl bg-card p-6 shadow-tile">
        <h2 className="text-lg font-bold">Последние заказы</h2>
        {stats.recent.length === 0 ? (
          <div className="mt-3 text-sm text-muted-foreground">Заказов пока нет.</div>
        ) : (
          <div className="mt-4 space-y-2 text-sm">
            {stats.recent.map((o) => {
              const s = STATUSES.find((x) => x.key === o.status);
              return (
                <div key={o.id} className="flex items-center justify-between gap-3 border-b border-border/50 py-2 last:border-0">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">#{o.id.slice(0, 8)} · {o.platform} / {o.service_type}</div>
                    <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("ru-RU")}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{Number(o.price_rub).toLocaleString("ru-RU")} ₽</div>
                    {s && <div className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.color}`}>{s.label}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

type UserRow = { id: string; email: string | null; name: string | null; isAdmin: boolean; ordersCount: number; totalSpent: number; balance: number };

function UsersTab({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    const [{ data: profs }, { data: roles }, { data: ords }] = await Promise.all([
      supabase.from("profiles").select("id, email, name, balance_rub"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("orders").select("user_id, price_rub, status"),
    ]);
    const adminIds = new Set((roles ?? []).filter((r: any) => r.role === "admin").map((r: any) => r.user_id));
    const paid = new Set(["paid", "processing", "completed"]);
    const stats = new Map<string, { count: number; total: number }>();
    (ords ?? []).forEach((o: any) => {
      const s = stats.get(o.user_id) ?? { count: 0, total: 0 };
      s.count++;
      if (paid.has(o.status)) s.total += Number(o.price_rub) || 0;
      stats.set(o.user_id, s);
    });
    setUsers((profs ?? []).map((p: any) => ({
      id: p.id, email: p.email, name: p.name,
      isAdmin: adminIds.has(p.id),
      ordersCount: stats.get(p.id)?.count ?? 0,
      totalSpent: stats.get(p.id)?.total ?? 0,
      balance: Number(p.balance_rub ?? 0),
    })).sort((a, b) => b.totalSpent - a.totalSpent));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleAdmin = async (u: UserRow) => {
    if (u.id === currentUserId && u.isAdmin) {
      if (!confirm("Снять с себя роль администратора? Вы потеряете доступ.")) return;
    }
    if (u.isAdmin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", u.id).eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("Роль снята");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: u.id, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success("Назначен администратором");
    }
    load();
  };

  const q = query.trim().toLowerCase();
  const filtered = q
    ? users.filter((u) => (u.email ?? "").toLowerCase().includes(q) || (u.name ?? "").toLowerCase().includes(q) || u.id.includes(q))
    : users;

  return (
    <div className="mt-6 space-y-4">
      <input value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск по email, имени, ID…"
        className="w-full rounded-full border border-border bg-background px-4 py-2 text-sm" />

      {loading ? (
        <div className="text-muted-foreground">Загрузка…</div>
      ) : (
        <div className="rounded-3xl bg-card shadow-tile overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-3 px-4 font-semibold">Клиент</th>
                  <th className="py-3 px-4 font-semibold">Заказы</th>
                  <th className="py-3 px-4 font-semibold">Потрачено</th>
                  <th className="py-3 px-4 font-semibold">Баланс</th>
                  <th className="py-3 px-4 font-semibold">Роль</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-border/40 last:border-0">
                    <td className="py-3 px-4">
                      <div className="font-semibold">{u.name || u.email || "—"}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                      <div className="text-[10px] text-muted-foreground break-all">{u.id}</div>
                    </td>
                    <td className="py-3 px-4">{u.ordersCount}</td>
                    <td className="py-3 px-4 font-semibold">{u.totalSpent.toLocaleString("ru-RU")} ₽</td>
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-primary">{u.balance.toFixed(2)} ₽</div>
                      <button
                        onClick={async () => {
                          const raw = prompt(`Пополнить баланс ${u.email ?? u.id}\nВведите сумму в ₽ (можно отрицательную для списания):`) ?? "";
                          if (!raw) return;
                          const amount = parseFloat(raw.replace(",", "."));
                          if (!Number.isFinite(amount) || amount === 0) { toast.error("Неверная сумма"); return; }
                          const note = prompt("Комментарий (необязательно):") || "";
                          const { error } = await supabase.rpc("admin_topup_balance", {
                            _user_id: u.id, _amount: amount, _note: note,
                          });
                          if (error) { toast.error(error.message); return; }
                          toast.success("Баланс обновлён");
                          load();
                        }}
                        className="mt-1 text-[11px] font-semibold text-primary hover:underline"
                      >
                        Пополнить
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      {u.isAdmin ? (
                        <span className="inline-block rounded-full bg-primary/15 text-primary px-2.5 py-0.5 text-xs font-semibold">Админ</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Клиент</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => toggleAdmin(u)}
                        className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary/50">
                        {u.isAdmin ? "Снять админа" : "Назначить админом"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

type AdminTxn = {
  id: string;
  user_id: string;
  amount_rub: number;
  kind: string;
  note: string | null;
  order_id: string | null;
  created_at: string;
};

const KIND_LABEL_ADMIN: Record<string, string> = {
  topup: "Пополнение",
  spend: "Оплата заказа",
  refund: "Возврат",
  adjust: "Корректировка",
};

function BalanceTab() {
  const [txns, setTxns] = useState<AdminTxn[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("balance_transactions")
        .select("id, user_id, amount_rub, kind, note, order_id, created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) { toast.error(error.message); setLoading(false); return; }
      const list = (data ?? []) as AdminTxn[];
      setTxns(list);
      const ids = [...new Set(list.map((t) => t.user_id))];
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, email, name").in("id", ids);
        const map: Record<string, Profile> = {};
        (profs ?? []).forEach((p) => (map[p.id] = p as Profile));
        setProfiles(map);
      }
      setLoading(false);
    })();
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? txns.filter((t) => {
        const p = profiles[t.user_id];
        return (p?.email ?? "").toLowerCase().includes(q) ||
               (p?.name ?? "").toLowerCase().includes(q) ||
               (t.note ?? "").toLowerCase().includes(q) ||
               t.user_id.includes(q);
      })
    : txns;

  const totalTopup = filtered.filter((t) => Number(t.amount_rub) > 0).reduce((s, t) => s + Number(t.amount_rub), 0);
  const totalSpend = filtered.filter((t) => Number(t.amount_rub) < 0).reduce((s, t) => s + Number(t.amount_rub), 0);

  return (
    <div className="mt-6 space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-card p-4 shadow-tile">
          <div className="text-xs text-muted-foreground">Всего операций</div>
          <div className="mt-1 text-2xl font-extrabold">{filtered.length}</div>
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-tile">
          <div className="text-xs text-muted-foreground">Пополнения</div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-500">+{totalTopup.toFixed(2)} ₽</div>
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-tile">
          <div className="text-xs text-muted-foreground">Списания</div>
          <div className="mt-1 text-2xl font-extrabold text-red-500">{totalSpend.toFixed(2)} ₽</div>
        </div>
      </div>

      <input value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск: email, имя, ID, комментарий…"
        className="w-full rounded-full border border-border bg-background px-4 py-2 text-sm" />

      {loading ? (
        <div className="text-muted-foreground">Загрузка…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-card p-10 text-center shadow-tile text-muted-foreground">Операций нет</div>
      ) : (
        <div className="rounded-3xl bg-card shadow-tile overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-3 px-4 font-semibold">Дата</th>
                  <th className="py-3 px-4 font-semibold">Клиент</th>
                  <th className="py-3 px-4 font-semibold">Тип</th>
                  <th className="py-3 px-4 font-semibold">Комментарий</th>
                  <th className="py-3 px-4 font-semibold text-right">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const p = profiles[t.user_id];
                  const amt = Number(t.amount_rub);
                  return (
                    <tr key={t.id} className="border-b border-border/40 last:border-0">
                      <td className="py-2 px-4 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString("ru-RU")}</td>
                      <td className="py-2 px-4">
                        <div className="font-semibold">{p?.name || p?.email || t.user_id.slice(0, 8)}</div>
                        <div className="text-xs text-muted-foreground">{p?.email}</div>
                      </td>
                      <td className="py-2 px-4">{KIND_LABEL_ADMIN[t.kind] ?? t.kind}</td>
                      <td className="py-2 px-4 text-xs text-muted-foreground">
                        {t.note ?? ""}{t.order_id ? ` · #${t.order_id.slice(0, 8)}` : ""}
                      </td>
                      <td className={`py-2 px-4 text-right font-extrabold ${amt >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {amt >= 0 ? "+" : ""}{amt.toFixed(2)} ₽
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
