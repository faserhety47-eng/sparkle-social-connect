import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type OrderMessage = {
  id: string;
  order_id: string;
  sender: "admin" | "user";
  author_id: string;
  body: string;
  created_at: string;
};

export function OrderMessages({
  orderId,
  currentUserId,
  sender,
}: {
  orderId: string;
  currentUserId: string;
  sender: "admin" | "user";
}) {
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("order_messages")
      .select("id, order_id, sender, author_id, body, created_at")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    if (error) toast.error(error.message);
    setMessages((data ?? []) as OrderMessage[]);
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`order-messages-${orderId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_messages", filter: `order_id=eq.${orderId}` },
        (payload) => setMessages((m) => [...m, payload.new as OrderMessage]),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [orderId, load]);

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setSending(true);
    const { error } = await supabase.from("order_messages").insert({
      order_id: orderId, sender, author_id: currentUserId, body,
    });
    setSending(false);
    if (error) return toast.error(error.message);
    setText("");
  };

  return (
    <div className="mt-4 rounded-2xl border border-border bg-background/40 p-4">
      <div className="text-sm font-semibold mb-3">Переписка по заказу</div>
      {loading ? (
        <div className="text-xs text-muted-foreground">Загрузка…</div>
      ) : messages.length === 0 ? (
        <div className="text-xs text-muted-foreground">Сообщений пока нет.</div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {messages.map((m) => {
            const mine = m.sender === sender;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}>
                  <div className="text-[10px] opacity-70 mb-0.5">
                    {m.sender === "admin" ? "Администратор" : "Клиент"} · {new Date(m.created_at).toLocaleString("ru-RU")}
                  </div>
                  <div className="whitespace-pre-wrap break-words">{m.body}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ваше сообщение…"
          className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
        <button onClick={send} disabled={sending || !text.trim()} className="btn-primary text-sm disabled:opacity-60">
          {sending ? "…" : "Отправить"}
        </button>
      </div>
    </div>
  );
}
