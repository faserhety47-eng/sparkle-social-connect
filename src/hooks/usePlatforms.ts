import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Platform = {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  description: string | null;
  color: string;
  icon_url: string | null;
  icon_emoji: string | null;
  letter: string | null;
};

export function usePlatforms(opts: { onlyActive?: boolean } = { onlyActive: true }) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    let q = supabase
      .from("platforms")
      .select("id, name, is_active, sort_order, description, color, icon_url, icon_emoji, letter")
      .order("sort_order");
    if (opts.onlyActive) q = q.eq("is_active", true);
    const { data } = await q;
    setPlatforms((data ?? []) as Platform[]);
    setLoading(false);
  }, [opts.onlyActive]);

  useEffect(() => { load(); }, [load]);

  return { platforms, loading, reload: load };
}
