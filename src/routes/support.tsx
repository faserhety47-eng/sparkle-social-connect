import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";
import { LifeBuoy, Send, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Поддержка — smm-cat.site" },
      { name: "description", content: "Служба поддержки smm-cat.site: задайте вопрос по заказу, оплате или списанию — мы отвечаем в течение 15 минут в рабочее время и помогаем с любой ситуацией." },
      { property: "og:title", content: "Поддержка — smm-cat.site" },
      { property: "og:description", content: "Свяжитесь со службой поддержки smm-cat.site." },
      { property: "og:url", content: "https://smm-cat.site/support" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://smm-cat.site/support" }],
  }),
  component: SupportPage,
});

type MyTicket = {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  user_unread: boolean;
};

function SupportPage() {
  const { user } = useSession();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [myTickets, setMyTickets] = useState<MyTicket[]>([]);

  useEffect(() => {
    if (!user) { setMyTickets([]); return; }
    (async () => {
      const { data } = await supabase
        .from("tickets")
        .select("id,subject,status,created_at,user_unread")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setMyTickets((data as MyTicket[]) ?? []);
    })();
  }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (subject.trim().length < 3) return toast.error("Укажите тему");
    if (message.trim().length < 5) return toast.error("Опишите проблему подробнее");
    if (!user && !guestEmail.trim()) return toast.error("Укажите email для связи");
    setSending(true);
    const { error } = await supabase.from("tickets").insert({
      subject: subject.trim().slice(0, 200),
      message: message.trim().slice(0, 4000),
      user_id: user?.id ?? null,
      guest_name: user ? null : (guestName.trim().slice(0, 100) || null),
      guest_email: user ? null : guestEmail.trim().slice(0, 200),
    });
    setSending(false);
    if (error) return toast.error("Не удалось отправить: " + error.message);
    toast.success("Тикет отправлен! Мы ответим вам в ближайшее время.");
    setSubject(""); setMessage("");
    if (user) {
      const { data } = await supabase
        .from("tickets")
        .select("id,subject,status,created_at,user_unread")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setMyTickets((data as MyTicket[]) ?? []);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
          <LifeBuoy className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Служба поддержки</h1>
          <p className="text-sm text-muted-foreground mt-1">Опишите вопрос — мы ответим на почту или в личный кабинет.</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-8 space-y-4">
        {!user && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Ваше имя</label>
              <input value={guestName} onChange={(e) => setGuestName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:border-primary"
                placeholder="Как к вам обращаться" />
            </div>
            <div>
              <label className="text-sm font-semibold">Email <span className="text-destructive">*</span></label>
              <input value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} type="email" required
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:border-primary"
                placeholder="you@example.com" />
            </div>
          </div>
        )}
        <div>
          <label className="text-sm font-semibold">Тема <span className="text-destructive">*</span></label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} required maxLength={200}
            className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:border-primary"
            placeholder="Например: Не пришли подписчики по заказу" />
        </div>
        <div>
          <label className="text-sm font-semibold">Сообщение <span className="text-destructive">*</span></label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={6} maxLength={4000}
            className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary resize-y"
            placeholder="Опишите ситуацию, укажите номер заказа, если есть" />
          <div className="text-xs text-muted-foreground mt-1">{message.length}/4000</div>
        </div>
        <button type="submit" disabled={sending}
          className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 font-semibold hover:opacity-90 disabled:opacity-60">
          <Send className="h-4 w-4" />
          {sending ? "Отправка..." : "Отправить тикет"}
        </button>
        {!user && (
          <p className="text-xs text-muted-foreground">
            Хотите видеть переписку в личном кабинете? <Link to="/register" className="text-primary underline">Зарегистрируйтесь</Link>.
          </p>
        )}
      </form>

      {user && myTickets.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold flex items-center gap-2"><MessageCircle className="h-5 w-5" /> Мои обращения</h2>
          <div className="mt-4 space-y-2">
            {myTickets.map((t) => (
              <Link key={t.id} to="/support/$id" params={{ id: t.id }}
                className="block rounded-2xl border border-border bg-card p-4 hover:border-primary/60 transition">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{t.subject}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{new Date(t.created_at).toLocaleString("ru-RU")}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {t.user_unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    open: { label: "Открыт", cls: "bg-amber-500/15 text-amber-600" },
    in_progress: { label: "В работе", cls: "bg-blue-500/15 text-blue-600" },
    closed: { label: "Закрыт", cls: "bg-emerald-500/15 text-emerald-600" },
  };
  const s = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>{s.label}</span>;
}
