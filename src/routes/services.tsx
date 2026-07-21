import { createFileRoute, Link } from "@tanstack/react-router";
import { SERVICES } from "@/data/services";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Услуги OzTop Media — 40+ соцсетей для накрутки" },
      { name: "description", content: "Полный каталог соцсетей и услуг накрутки OzTop Media: Instagram, TikTok, YouTube, Telegram, VK, Twitch и другие." },
      { property: "og:title", content: "Услуги OzTop Media" },
      { property: "og:description", content: "Каталог из 40+ соцсетей с прозрачными ценами." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl md:text-4xl font-extrabold">Все услуги</h1>
      <p className="mt-2 text-muted-foreground">Выберите платформу, чтобы посмотреть тарифы и оформить заказ.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <Link
            key={s.id}
            to="/order"
            search={{ platform: s.id } as never}
            className="rounded-2xl bg-card p-5 shadow-tile flex items-center gap-4 hover:-translate-y-0.5 transition"
          >
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0"
              style={{ backgroundColor: s.color }}
            >
              {s.emoji ?? s.letter}
            </div>
            <div className="min-w-0">
              <div className="font-semibold">{s.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Подписчики · Лайки · Просмотры · Комментарии
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
