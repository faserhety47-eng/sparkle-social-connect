import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ServicePrice = {
  id: string;
  platform: string;
  service_type: string;
  price_per_unit: number;
};

export const SERVICE_TYPE_LIST = [
  { id: "followers", label: "Подписчики" },
  { id: "likes", label: "Лайки" },
  { id: "views", label: "Просмотры" },
  { id: "comments", label: "Комментарии" },
];

export function useServicePrices() {
  const [prices, setPrices] = useState<ServicePrice[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase
      .from("service_prices")
      .select("id, platform, service_type, price_per_unit");
    if (!error && data) {
      setPrices(
        data.map((p) => ({ ...p, price_per_unit: Number(p.price_per_unit) })),
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const getPrice = (platform: string, type: string) =>
    prices.find((p) => p.platform === platform && p.service_type === type)
      ?.price_per_unit ?? 0;

  return { prices, loading, getPrice, reload: load };
}
