import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";
import { ArrowLeft, Send } from "lucide-react";

export const Route = createFileRoute("/support/$id")({
  head: () => ({
    meta: [
      { title: "Обращение — smm-cat.site" },
      { name: "description", content: "Переписка с поддержкой smm-cat.site: следите за статусом вашего обращения, получайте ответы оператора и отправляйте уточнения по заказу в режиме онлайн." },
    ],
  }),
  component: TicketDetail,
});

type Ticket = { id: string; subject: string; message: string; status: string; created_at: string; user_id: string | null };
type Msg = { id: string; body: string; from_admin: boolean; created_at: string };

function TicketDetail() {
  const { id } = Route.useParams();
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login" }); return; }
    (async () => {
      const { data: t } = await supabase.from("tickets").select("*").eq("id", id).maybeSingle();
      if (!t) { toast.error("Тикет не найден"); navigate({ to: "/support" }); return; }
      setTicket(t as Ticket);
      const { data: m } = await supabase.from("ticket_messages").select("id,body,from_admin,created_at").eq("ticket_id", id).order("created_at");
      setMessages((m as Msg[]) ?? []);
      await supabase.from("tickets").update({ user_unread: false }).eq("id", id);
    })();
  }, [id, user, loading, navigate]);

  useEffect(() => {
    if (!id) return;
    const ch = supabase.channel(`ticket:${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_messages", filter: `ticket_id=eq.${id}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Msg]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !ticket) return;
    if (body.trim().length < 1) return;
    setSending(true);
    const { error } = await supabase.from("ticket_messages").insert({
      ticket_id: id, author_id: user.id, from_admin: false, body: body.trim().slice(0, 4000),
    });
    if (!error) {
      await supabase.from("tickets").update({ admin_unread: true, status: ticket.status === "closed" ? "open" : ticket.status }).eq("id", id);
      setBody("");
    } else toast.error(error.message);
    setSending(false);
  }

  if (!ticket) return <section className="mx-auto max-w-3xl px-4 py-14"><div className="text-muted-foreground">Загрузка...</div></section>;

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/support" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Ко всем обращениям
      </Link>
      <h1 className="mt-3 text-2xl md:text-3xl font-extrabold">{ticket.subject}</h1>
      <div className="text-xs text-muted-foreground">Статус: {ticket.status} • {new Date(ticket.created_at).toLocaleString("ru-RU")}</div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4 whitespace-pre-wrap">{ticket.message}</div>

      <div className="mt-6 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`rounded-2xl p-3 max-w-[85%] whitespace-pre-wrap ${m.from_admin ? "bg-primary/10 border border-primary/30" : "bg-card border border-border ml-auto"}`}>
            <div className="text-xs font-semibold mb-1">{m.from_admin ? "Поддержка" : "Вы"} • {new Date(m.created_at).toLocaleString("ru-RU")}</div>
            <div className="text-sm">{m.body}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {ticket.status !== "closed" && (
        <form onSubmit={send} className="mt-6 flex gap-2">
          <input value={body} onChange={(e) => setBody(e.target.value)} maxLength={4000}
            className="flex-1 rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
            placeholder="Ваш ответ..." />
          <button disabled={sending} className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 font-semibold hover:opacity-90 disabled:opacity-60">
            <Send className="h-4 w-4" /> Отправить
          </button>
        </form>
      )}
    </section>
  );
}
