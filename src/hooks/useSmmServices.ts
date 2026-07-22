import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SmmService = {
  id: number;
  platform: string;
  category: string;
  name: string;
  description: string | null;
  price_rub: number;
  min_qty: number;
  max_qty: number;
};

export function humanizeCategory(cat: string): string {
  return cat
    .replace(/^kupit-(nakrutku-)?/i, "")
    .replace(/^nakrutit-/i, "")
    .replace(/^nakrutka-/i, "")
    .replace(/-v-[a-z-]+$/i, "")
    .replace(/-po-stranam/i, " (по странам)")
    .replace(/-/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

export function useSmmServices(platform: string | undefined) {
  const [services, setServices] = useState<SmmService[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!platform) { setServices([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("smm_services")
      .select("id, platform, category, name, description, price_rub, min_qty, max_qty")
      .eq("platform", platform)
      .eq("active", true)
      .order("category")
      .order("price_rub");
    setLoading(false);
    if (error) { setServices([]); return; }
    setServices(
      (data ?? []).map((s) => ({ ...s, price_rub: Number(s.price_rub) })) as SmmService[],
    );
  }, [platform]);

  useEffect(() => { load(); }, [load]);

  return { services, loading, reload: load };
}
