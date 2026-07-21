import { Link } from "@tanstack/react-router";
import { Gift } from "lucide-react";

type Free = { platform: string; color: string; emoji?: string; letter: string; count: number; label: string };

const FREE_ITEMS: Free[] = [
  { platform: "instagram", color: "#E4405F", emoji: "📷", letter: "I", count: 40, label: "Подписчиков в Инстаграм" },
  { platform: "tiktok", color: "#111111", emoji: "🎵", letter: "T", count: 10, label: "Лайков на видео в ТикТок" },
  { platform: "vk", color: "#0077FF", letter: "В", count: 100, label: "Просмотров на видео ВК" },
  { platform: "vk", color: "#0077FF", letter: "В", count: 10, label: "Подписчиков ВК из СНГ" },
  { platform: "telegram", color: "#229ED9", emoji: "✈️", letter: "T", count: 15, label: "Подписчиков в Телеграм" },
  { platform: "telegram", color: "#229ED9", emoji: "✈️", letter: "T", count: 50, label: "Реакций 👍❤️🔥 на пост Telegram" },
  { platform: "instagram", color: "#E4405F", emoji: "📷", letter: "I", count: 100, label: "Просмотров историй Инстаграм" },
  { platform: "telegram", color: "#229ED9", emoji: "✈️", letter: "T", count: 10, label: "Репостов на пост в Telegram" },
  { platform: "tiktok", color: "#111111", emoji: "🎵", letter: "T", count: 100, label: "Репостов на видео в ТикТоке" },
  { platform: "twitch", color: "#9146FF", letter: "T", count: 50, label: "Зрителей на стрим на 5 минут" },
  { platform: "youtube", color: "#FF0000", emoji: "▶", letter: "Y", count: 30, label: "Лайков на видео YouTube" },
  { platform: "web", color: "#334155", emoji: "🌐", letter: "🌐", count: 100, label: "Посетителей на сайт из FaceBook" },
];

export function FreeBoost() {
  return (
    <section className="mt-24">
      <div className="rounded-3xl bg-gradient-to-br from-brand/10 via-brand-2/5 to-transparent p-6 md:p-10 shadow-tile">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-brand to-brand-2 flex items-center justify-center shadow-cta">
            <Gift className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold">Накрутите БЕСПЛАТНО прямо сейчас</h2>
            <p className="text-sm text-muted-foreground">и БЕЗ регистрации</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground max-w-3xl">
          Услуги ниже можно заказывать на выбор <span className="font-semibold text-foreground">1 раз в 20 минут</span>, без ограничений.
          Перед заказом убедитесь, что ссылка указана корректно и профиль не закрыт — иначе накрутка может не пройти.
        </p>

        <div className="mt-8 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {FREE_ITEMS.map((f, i) => (
            <Link
              key={i}
              to="/order"
              search={{ platform: f.platform } as never}
              className="group relative rounded-2xl bg-card p-4 shadow-tile hover:-translate-y-0.5 transition text-left"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                  style={{ backgroundColor: f.color }}
                >
                  {f.emoji ?? f.letter}
                </div>
                <div className="text-3xl font-extrabold text-primary leading-none">{f.count}</div>
              </div>
              <div className="mt-3 text-xs font-medium text-foreground/80 leading-snug">{f.label}</div>
              <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Бесплатно</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
