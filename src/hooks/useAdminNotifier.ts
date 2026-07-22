import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function playBeep(pattern: "order" | "message") {
  try {
    const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    const ctx = new AC();
    const notes = pattern === "order" ? [880, 1175, 1568] : [988, 1319];
    const now = ctx.currentTime;
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.18;
      const end = start + 0.16;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(end + 0.02);
    });
    setTimeout(() => ctx.close(), (notes.length * 200) + 400);
  } catch {
    /* ignore */
  }
}

export function useAdminNotifier(enabled: boolean, adminId?: string) {
  const mountedAt = useRef<number>(Date.now());

  useEffect(() => {
    if (!enabled) return;
    mountedAt.current = Date.now();

    const ordersCh = supabase
      .channel("admin-notify-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const created = new Date((payload.new as { created_at?: string }).created_at ?? Date.now()).getTime();
          if (created < mountedAt.current - 5000) return;
          playBeep("order");
          toast.success("Новый заказ!", { description: "Поступил новый заказ в админ-панель." });
        },
      )
      .subscribe();

    const msgCh = supabase
      .channel("admin-notify-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_messages" },
        (payload) => {
          const row = payload.new as { sender?: string; author_id?: string; body?: string };
          if (row.sender !== "user") return;
          if (adminId && row.author_id === adminId) return;
          playBeep("message");
          toast.message("Новое сообщение от клиента", {
            description: row.body?.slice(0, 120) ?? "",
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersCh);
      supabase.removeChannel(msgCh);
    };
  }, [enabled, adminId]);
}
