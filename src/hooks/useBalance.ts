import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";

export function useBalance() {
  const { user } = useSession();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setBalance(0);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("balance_rub")
      .eq("id", user.id)
      .maybeSingle();
    setBalance(Number((data as { balance_rub?: number } | null)?.balance_rub ?? 0));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`profile-balance-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload) => {
          const next = (payload.new as { balance_rub?: number })?.balance_rub;
          if (next != null) setBalance(Number(next));
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "balance_transactions", filter: `user_id=eq.${user.id}` },
        () => { load(); },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, load]);

  useEffect(() => {
    const onFocus = () => load();
    const onVisible = () => { if (document.visibilityState === "visible") load(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);



  return { balance, loading, reload: load };
}
