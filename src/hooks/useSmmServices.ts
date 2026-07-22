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

const TOKENS: Record<string, string> = {
  kupit: "Купить",
  nakrutka: "Накрутка",
  nakrutku: "накрутку",
  nakrutit: "Накрутить",
  podpisciki: "подписчики",
  podpiscikov: "подписчиков",
  podpischiki: "подписчики",
  laiki: "лайки",
  laikov: "лайков",
  dizlaiki: "дизлайки",
  prosmotry: "просмотры",
  prosmotr: "просмотр",
  prosmotrov: "просмотров",
  proslusivanii: "прослушиваний",
  pleilistov: "плейлистов",
  kommentarii: "комментарии",
  kommentariev: "комментариев",
  reposty: "репосты",
  repostov: "репостов",
  reakcii: "реакции",
  druzei: "друзей",
  klassy: "классы",
  zritelei: "зрителей",
  golosovanii: "голосований",
  oprosax: "опросах",
  oxvatov: "охватов",
  pokazov: "показов",
  poseshhenii: "посещений",
  profilia: "профиля",
  soxranenii: "сохранений",
  soxranenie: "сохранение",
  rekomendacii: "рекомендации",
  transliacii: "трансляции",
  popadaniia: "попадания",
  uslugi: "услуги",
  tovary: "товары",
  klipy: "клипы",
  zapisi: "записи",
  video: "видео",
  foto: "фото",
  post: "пост",
  posty: "посты",
  postov: "постов",
  postam: "постам",
  strim: "стрим",
  shorts: "Shorts",
  reels: "Reels",
  rils: "Reels",
  istorii: "истории",
  istoriyah: "историях",
  igtv: "IGTV",
  busty: "бусты",
  botov: "ботов",
  kanala: "канала",
  kanalov: "каналов",
  privatnyx: "приватных",
  zakrytyx: "закрытых",
  referalnyx: "реферальных",
  premium: "Premium",
  polzovatelei: "пользователей",
  vyvoda: "вывода",
  top: "топ",
  gruppu: "группу",
  gruppy: "группы",
  soobshhestvo: "сообщество",
  reklamy: "рекламы",
  klipov: "клипов",
  intervalom: "интервалом",
  statistikoi: "статистикой",
  neskolko: "несколько",
  odin: "один",
  budushhie: "будущие",
  avtoprosmotry: "автопросмотры",
  avtoreakcii: "автореакции",
  avtorepostov: "авторепосты",
  avtomaticeskaia: "автоматическая",
  negativnye: "негативные",
  priamogo: "прямого",
  efira: "эфира",
  stranam: "странам",
  telescope: "Telescope",
  telegram: "Telegram",
  telegramu: "Telegram",
  instagram: "Instagram",
  instagrame: "Instagram",
  vkontakte: "ВКонтакте",
  vk: "ВК",
  tiktok: "TikTok",
  tik: "TikTok",
  tok: "",
  youtube: "YouTube",
  iutub: "YouTube",
  rutub: "RuTube",
  rutube: "RuTube",
  max: "Max",
  odnoklassniki: "Одноклассники",
  odnoklassnikax: "Одноклассниках",
  casov: "часов",
};

const SKIP = new Set(["v", "na", "po", "dlia", "s", "so", "ot", "i", "k", "ili"]);

export function humanizeCategory(cat: string): string {
  const parts = cat.split("-").map((p) => p.toLowerCase());
  const out: string[] = [];
  for (const p of parts) {
    if (!p) continue;
    if (SKIP.has(p)) continue;
    const mapped = TOKENS[p];
    if (mapped === "") continue;
    out.push(mapped ?? p);
  }
  const joined = out.join(" ").replace(/\s+/g, " ").trim();
  return joined.charAt(0).toUpperCase() + joined.slice(1);
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
