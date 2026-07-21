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

type Tab = "dashboard" | "orders" | "users" | "prices" | "platforms" | "types" | "payments";

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
    { key: "orders", label: "Заказы" },
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

      {tab === "orders" && user && <OrdersTab adminId={user.id} />}
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
        const { data: profs } = await supabase.from("profiles").select("id, email, name").in("id", ids);
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
    toast.success("Статус обновлён");
  };

  const updatePrice = async (id: string, price: number) => {
    if (!Number.isFinite(price) || price < 0) { toast.error("Некорректная цена"); return; }
    const { error } = await supabase.from("orders").update({ price_rub: price }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, price_rub: price } : o)));
    toast.success("Цена обновлена");
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2">
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

  const previewIcon = (p: { icon_url: string | null; icon_emoji: string | null; letter: string | null; name: string; color: string }) => (
    <div className="h-12 w-12 shrink-0 rounded-xl flex items-center justify-center overflow-hidden ring-1 ring-white/5"
      style={{ backgroundColor: p.color || "#7B4FFF" }}>
      {p.icon_url ? (
        <img src={p.icon_url} alt="" className="h-7 w-7 object-contain" />
      ) : p.icon_emoji ? (
        <span className="text-xl">{p.icon_emoji}</span>
      ) : (
        <span className="text-white font-bold">{p.letter ?? p.name.slice(0, 1)}</span>
      )}
    </div>
  );

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
          <input placeholder="Ссылка на иконку (https://…)" value={form.icon_url}
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
                  <input defaultValue={p.icon_url ?? ""} placeholder="Ссылка на иконку"
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
  const [form, setForm] = useState({ id: "", label: "", sort_order: 100 });

  const add = async () => {
    if (!form.id.trim() || !form.label.trim()) return toast.error("Заполните поля");
    const { error } = await supabase.from("service_types").insert({
      id: form.id.trim().toLowerCase(), label: form.label.trim(), sort_order: Number(form.sort_order) || 100,
    });
    if (error) return toast.error(error.message);
    toast.success("Тип добавлен");
    setForm({ id: "", label: "", sort_order: 100 });
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
      </div>

      <div className="rounded-3xl bg-card p-6 shadow-tile">
        <h2 className="text-lg font-bold">Типы услуг</h2>
        {loading ? (
          <div className="mt-4 text-muted-foreground">Загрузка…</div>
        ) : (
          <div className="mt-4 space-y-2">
            {types.map((t) => (
              <div key={t.id} className="flex items-center gap-3 flex-wrap rounded-2xl border border-border p-3">
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
