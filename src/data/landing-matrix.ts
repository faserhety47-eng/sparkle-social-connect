// SEO landing matrix: тип услуги × платформа
// Используется на страницах /nakrutka/$type/$platform и в /nakrutka хабе.

export type LandingType = {
  slug: string;              // podpischikov
  singular: string;          // подписчик
  plural: string;            // подписчиков
  what: string;              // "подписчиков"
  action: string;            // "Накрутка подписчиков"
  metric: string;            // "1000 подписчиков"
  benefit: string;
};

export const LANDING_TYPES: LandingType[] = [
  {
    slug: "podpischikov",
    singular: "подписчик",
    plural: "подписчиков",
    what: "подписчиков",
    action: "Накрутка подписчиков",
    metric: "1000 подписчиков",
    benefit: "Увеличьте аудиторию и социальное доказательство: чем больше подписчиков — тем выше доверие новых пользователей.",
  },
  {
    slug: "laykov",
    singular: "лайк",
    plural: "лайков",
    what: "лайков",
    action: "Накрутка лайков",
    metric: "1000 лайков",
    benefit: "Лайки повышают охват публикации: алгоритмы соцсетей чаще показывают посты с активной реакцией.",
  },
  {
    slug: "prosmotrov",
    singular: "просмотр",
    plural: "просмотров",
    what: "просмотров",
    action: "Накрутка просмотров",
    metric: "1000 просмотров",
    benefit: "Просмотры разгоняют ролики и сторис в топ рекомендаций — контент видит больше живых пользователей.",
  },
];

export type LandingPlatform = {
  slug: string;             // совпадает с platforms.id в БД
  name: string;             // "TikTok"
  namePrepositional: string; // "в TikTok"
  short: string;            // короткое описание для карточек
};

export const LANDING_PLATFORMS: LandingPlatform[] = [
  { slug: "tiktok",    name: "TikTok",         namePrepositional: "в TikTok",        short: "Вертикальные видео и трендовые ролики" },
  { slug: "instagram", name: "Instagram",      namePrepositional: "в Instagram",     short: "Reels, посты, сторис и IGTV" },
  { slug: "telegram",  name: "Telegram",       namePrepositional: "в Telegram",      short: "Каналы, группы, посты и реакции" },
  { slug: "youtube",   name: "YouTube",        namePrepositional: "на YouTube",      short: "Ролики, Shorts, каналы и стримы" },
  { slug: "vk",        name: "ВКонтакте",      namePrepositional: "во ВКонтакте",    short: "Группы, сообщества, посты и клипы" },
  { slug: "ok",        name: "Одноклассники",  namePrepositional: "в Одноклассниках", short: "Группы, посты, фото и видео" },
  { slug: "rutube",    name: "RuTube",         namePrepositional: "на RuTube",       short: "Российский видеохостинг" },
  { slug: "max",       name: "Max",            namePrepositional: "в Max",           short: "Новый российский мессенджер" },
];

export function findType(slug: string) {
  return LANDING_TYPES.find((t) => t.slug === slug) ?? null;
}
export function findPlatform(slug: string) {
  return LANDING_PLATFORMS.find((p) => p.slug === slug) ?? null;
}

// Ориентировочная минимальная цена за 1000 (для отображения "от N ₽").
// Реальные цены управляются админом в service_prices; это только SEO-подсказка.
export const PRICE_HINT: Record<string, Record<string, number>> = {
  podpischikov: { tiktok: 90, instagram: 120, telegram: 150, youtube: 250, vk: 80, ok: 90, rutube: 200, max: 150 },
  laykov:       { tiktok: 40, instagram: 60,  telegram: 30,  youtube: 90,  vk: 30, ok: 40, rutube: 90,  max: 60  },
  prosmotrov:   { tiktok: 15, instagram: 20,  telegram: 10,  youtube: 40,  vk: 10, ok: 15, rutube: 25,  max: 20  },
};

export function priceHint(typeSlug: string, platformSlug: string): number | null {
  return PRICE_HINT[typeSlug]?.[platformSlug] ?? null;
}

export function landingTitle(t: LandingType, p: LandingPlatform) {
  return `${t.action} ${p.namePrepositional} — быстро, недорого, с гарантией`;
}
export function landingDescription(t: LandingType, p: LandingPlatform) {
  return `${t.action} ${p.namePrepositional} на smm-cat.site: живые аккаунты, старт за 1–5 минут, автоподбор скорости и гарантия возврата.`;
}
