import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ServiceType = {
  id: string;
  label: string;
  is_active: boolean;
  sort_order: number;
  description: string | null;
};

export function useServiceTypes(opts: { onlyActive?: boolean } = { onlyActive: true }) {
  const [types, setTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    let q = supabase.from("service_types").select("id, label, is_active, sort_order, description").order("sort_order");
    if (opts.onlyActive) q = q.eq("is_active", true);
    const { data } = await q;
    setTypes((data ?? []) as ServiceType[]);
    setLoading(false);
  }, [opts.onlyActive]);

  useEffect(() => { load(); }, [load]);

  return { types, loading, reload: load };
}
