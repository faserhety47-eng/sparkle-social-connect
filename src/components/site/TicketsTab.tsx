import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, X } from "lucide-react";

type Ticket = {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  guest_name: string | null;
  subject: string;
  message: string;
  status: string;
  priority: string;
  admin_unread: boolean;
  created_at: string;
};

type Msg = { id: string; body: string; from_admin: boolean; created_at: string };

const STATUSES = [
  { key: "open", label: "Открыт", cls: "bg-amber-500/15 text-amber-600" },
  { key: "in_progress", label: "В работе", cls: "bg-blue-500/15 text-blue-600" },
  { key: "closed", label: "Закрыт", cls: "bg-emerald-500/15 text-emerald-600" },
];

export function TicketsTab({ adminId }: { adminId: string }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Ticket | null>(null);

  async function load() {
    const { data } = await supabase.from("tickets").select("*").order("created_at", { ascending: false }).limit(200);
    setTickets((data as Ticket[]) ?? []);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const ch = supabase.channel("admin:tickets")
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);
  const unreadCount = tickets.filter((t) => t.admin_unread).length;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1.5 text-sm border ${filter === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
          Все ({tickets.length})
        </button>
        {STATUSES.map((s) => (
          <button key={s.key} onClick={() => setFilter(s.key)}
            className={`rounded-full px-3 py-1.5 text-sm border ${filter === s.key ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
            {s.label} ({tickets.filter((t) => t.status === s.key).length})
          </button>
        ))}
        {unreadCount > 0 && <span className="ml-auto text-sm text-primary font-semibold">Непрочитанных: {unreadCount}</span>}
      </div>

      <div className="space-y-2">
        {filtered.map((t) => {
          const s = STATUSES.find((x) => x.key === t.status);
          return (
            <button key={t.id} onClick={() => setSelected(t)}
              className="w-full text-left rounded-2xl border border-border bg-card p-4 hover:border-primary/60 transition">
              <div className="flex items-center gap-3">
                {t.admin_unread && <span className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{t.subject}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    {t.guest_email ?? (t.user_id ? `user: ${t.user_id.slice(0, 8)}` : "—")}
                    {t.guest_name ? ` • ${t.guest_name}` : ""}
                    {" • "}{new Date(t.created_at).toLocaleString("ru-RU")}
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold shrink-0 ${s?.cls ?? ""}`}>{s?.label ?? t.status}</span>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && <div className="text-sm text-muted-foreground py-8 text-center">Тикетов нет</div>}
      </div>

      {selected && <TicketDrawer ticket={selected} adminId={adminId} onClose={() => { setSelected(null); load(); }} />}
    </div>
  );
}

function TicketDrawer({ ticket, adminId, onClose }: { ticket: Ticket; adminId: string; onClose: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState(ticket.status);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("ticket_messages").select("id,body,from_admin,created_at").eq("ticket_id", ticket.id).order("created_at");
      setMessages((data as Msg[]) ?? []);
      await supabase.from("tickets").update({ admin_unread: false }).eq("id", ticket.id);
    })();
    const ch = supabase.channel(`admin:ticket:${ticket.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_messages", filter: `ticket_id=eq.${ticket.id}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Msg]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [ticket.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (body.trim().length < 1) return;
    setSending(true);
    const { error } = await supabase.from("ticket_messages").insert({
      ticket_id: ticket.id, author_id: adminId, from_admin: true, body: body.trim().slice(0, 4000),
    });
    if (!error) {
      await supabase.from("tickets").update({ user_unread: true, status: status === "open" ? "in_progress" : status }).eq("id", ticket.id);
      if (status === "open") setStatus("in_progress");
      setBody("");
    } else toast.error(error.message);
    setSending(false);
  }

  async function changeStatus(newStatus: string) {
    setStatus(newStatus);
    const { error } = await supabase.from("tickets").update({ status: newStatus }).eq("id", ticket.id);
    if (error) toast.error(error.message); else toast.success("Статус обновлён");
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div className="w-full max-w-2xl h-full bg-background border-l border-border overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-background border-b border-border p-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-bold truncate">{ticket.subject}</div>
            <div className="text-xs text-muted-foreground truncate">
              {ticket.guest_email ?? ticket.user_id?.slice(0, 8)} {ticket.guest_name ? ` • ${ticket.guest_name}` : ""}
            </div>
          </div>
          <select value={status} onChange={(e) => changeStatus(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
            {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-4 space-y-3">
          <div className="rounded-2xl border border-border bg-card p-4 whitespace-pre-wrap text-sm">{ticket.message}</div>
          {messages.map((m) => (
            <div key={m.id} className={`rounded-2xl p-3 max-w-[85%] whitespace-pre-wrap text-sm ${m.from_admin ? "bg-primary/10 border border-primary/30 ml-auto" : "bg-card border border-border"}`}>
              <div className="text-xs font-semibold mb-1">{m.from_admin ? "Вы (админ)" : "Клиент"} • {new Date(m.created_at).toLocaleString("ru-RU")}</div>
              <div>{m.body}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} className="sticky bottom-0 bg-background border-t border-border p-4 flex gap-2">
          <input value={body} onChange={(e) => setBody(e.target.value)} maxLength={4000}
            className="flex-1 rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
            placeholder="Ответить клиенту..." />
          <button disabled={sending} className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 font-semibold hover:opacity-90 disabled:opacity-60">
            <Send className="h-4 w-4" /> Отправить
          </button>
        </form>
      </div>
    </div>
  );
}
