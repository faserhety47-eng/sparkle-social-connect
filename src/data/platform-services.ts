// Sub-services per platform (demo pricing)
export type PlatformService = {
  id: string;
  name: string;
  price: number; // ₽ per unit
  min: number;
  max: number;
  speed?: string;
  description?: string;
};

const common = (extra: PlatformService[] = []): PlatformService[] => [
  { id: "followers", name: "Подписчики", price: 0.5, min: 50, max: 100000, speed: "1–5к/сутки", description: "Живые аккаунты, плавный набор" },
  { id: "likes", name: "Лайки", price: 0.2, min: 10, max: 50000, speed: "мгновенно", description: "Быстрый старт от 10 шт" },
  { id: "views", name: "Просмотры", price: 0.05, min: 100, max: 1000000, speed: "мгновенно", description: "Стабильные просмотры" },
  { id: "comments", name: "Комментарии", price: 2, min: 5, max: 1000, speed: "1–24ч", description: "Тематические, вручную" },
  ...extra,
];

export const PLATFORM_SERVICES: Record<string, PlatformService[]> = {
  max: [
    { id: "followers", name: "Подписчики канала", price: 0.7, min: 50, max: 50000, description: "Подписчики на канал в Max" },
    { id: "members", name: "Участники группы", price: 0.6, min: 50, max: 50000, description: "Живые участники" },
    { id: "views", name: "Просмотры поста", price: 0.1, min: 100, max: 500000, description: "Просмотры публикаций" },
    { id: "reactions", name: "Реакции", price: 0.4, min: 10, max: 20000, description: "Эмодзи-реакции" },
  ],
  vk: common([
    { id: "reposts", name: "Репосты", price: 0.8, min: 10, max: 20000, description: "Репосты записи" },
    { id: "friends", name: "Друзья", price: 0.9, min: 50, max: 10000, description: "Заявки в друзья" },
  ]),
  telegram: [
    { id: "subs_channel", name: "Подписчики канала", price: 0.9, min: 50, max: 100000, description: "Русскоязычные аккаунты" },
    { id: "members_group", name: "Участники группы", price: 0.8, min: 50, max: 100000, description: "Живые участники" },
    { id: "views", name: "Просмотры поста", price: 0.05, min: 100, max: 1000000, description: "Мгновенные просмотры" },
    { id: "reactions", name: "Реакции", price: 0.3, min: 10, max: 50000, description: "👍❤️🔥 и другие" },
    { id: "bot_starts", name: "Запуски бота", price: 3, min: 10, max: 10000, description: "Уникальные /start" },
    { id: "votes", name: "Голоса в опросе", price: 0.5, min: 10, max: 50000, description: "Голоса за вариант" },
  ],
  ok: common(),
  instagram: [
    { id: "followers", name: "Подписчики", price: 0.6, min: 50, max: 100000, description: "Живые аккаунты" },
    { id: "likes", name: "Лайки", price: 0.2, min: 10, max: 50000, description: "На фото и видео" },
    { id: "views_reels", name: "Просмотры Reels", price: 0.05, min: 100, max: 1000000, description: "Просмотры коротких видео" },
    { id: "views_stories", name: "Просмотры Stories", price: 0.1, min: 100, max: 500000, description: "На все сторис профиля" },
    { id: "comments", name: "Комментарии", price: 2.5, min: 5, max: 1000, description: "Осмысленные комментарии" },
    { id: "saves", name: "Сохранения", price: 0.3, min: 10, max: 20000, description: "В закладки" },
  ],
  rutube: [
    { id: "views", name: "Просмотры", price: 0.15, min: 100, max: 1000000, description: "Просмотры видео" },
    { id: "subs", name: "Подписчики канала", price: 1.5, min: 20, max: 20000, description: "На канал" },
    { id: "likes", name: "Лайки", price: 0.5, min: 10, max: 20000, description: "На видео" },
    { id: "comments", name: "Комментарии", price: 3, min: 5, max: 1000, description: "Тематические" },
  ],
  youtube: [
    { id: "views", name: "Просмотры", price: 0.2, min: 100, max: 1000000, description: "Быстрые и стабильные" },
    { id: "subs", name: "Подписчики канала", price: 2, min: 20, max: 50000, description: "На канал" },
    { id: "likes", name: "Лайки", price: 0.6, min: 10, max: 20000, description: "На видео" },
    { id: "views_shorts", name: "Просмотры Shorts", price: 0.1, min: 100, max: 1000000, description: "Просмотры коротких видео" },
    { id: "comments", name: "Комментарии", price: 3.5, min: 5, max: 1000, description: "Ручные комментарии" },
    { id: "watchtime", name: "Часы просмотра", price: 15, min: 10, max: 4000, description: "Для монетизации" },
  ],
};
