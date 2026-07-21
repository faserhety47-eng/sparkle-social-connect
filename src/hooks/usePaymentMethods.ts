import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PaymentMethod = {
  id: string;
  label: string;
  url: string | null;
  details: string | null;
  is_active: boolean;
  sort_order: number;
};

export function usePaymentMethods(opts: { onlyActive?: boolean } = { onlyActive: true }) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    let q = supabase.from("payment_methods").select("id, label, url, details, is_active, sort_order").order("sort_order");
    if (opts.onlyActive) q = q.eq("is_active", true);
    const { data } = await q;
    setMethods((data ?? []) as PaymentMethod[]);
    setLoading(false);
  }, [opts.onlyActive]);

  useEffect(() => { load(); }, [load]);

  return { methods, loading, reload: load };
}
