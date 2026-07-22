import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type NavLink = {
  id: string;
  location: "header" | "footer";
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
};

const DEFAULTS: Record<"header" | "footer", { label: string; url: string }[]> = {
  header: [
    { label: "Главная", url: "/" },
    { label: "Заказать", url: "/order" },
    { label: "Услуги", url: "/services" },
    { label: "Накрутка", url: "/nakrutka" },
  ],
  footer: [
    { label: "Главная", url: "/" },
    { label: "Оформить заказ", url: "/order" },
    { label: "Услуги", url: "/services" },
    { label: "Каталог накрутки", url: "/nakrutka" },
  ],
};

export function useNavLinks(location: "header" | "footer") {
  const [links, setLinks] = useState<{ label: string; url: string }[]>(DEFAULTS[location]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("nav_links")
        .select("label,url,sort_order,is_active,location")
        .eq("location", location)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (!alive) return;
      if (data && data.length) setLinks(data.map((d) => ({ label: d.label, url: d.url })));
    })();
    return () => { alive = false; };
  }, [location]);

  return links;
}
