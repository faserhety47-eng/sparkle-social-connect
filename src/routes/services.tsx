import { createFileRoute, Link } from "@tanstack/react-router";
import { SERVICES } from "@/data/services";
import { BRAND_ICONS } from "@/data/service-icons";
import { parseBuiltinIcon } from "@/data/icon-library";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Услуги smm-cat.site — 7 платформ для накрутки" },
      { name: "description", content: "Каталог услуг накрутки smm-cat.site: Max, VK, Telegram, Одноклассники, Instagram, RuTube и YouTube." },
      { property: "og:title", content: "Услуги smm-cat.site" },
      { property: "og:description", content: "Каталог из 7 платформ с прозрачными ценами." },
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
        {SERVICES.map((s) => {
          const Icon = BRAND_ICONS[s.id];
          const builtin = parseBuiltinIcon(s.icon_url);
          return (
            <Link
              key={s.id}
              to="/order"
              search={{ platform: s.id } as never}
              className="rounded-2xl bg-card p-5 shadow-tile flex items-center gap-4 hover:-translate-y-0.5 transition"
            >
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0 overflow-hidden"
                style={{ backgroundColor: s.color }}
              >
                {builtin?.imageUrl ? (
                  <img src={builtin.imageUrl} alt="" className="h-8 w-8 object-contain" />
                ) : builtin?.Icon ? (
                  <builtin.Icon width={28} height={28} color="#ffffff" />
                ) : Icon ? (
                  <Icon width={28} height={28} color="#ffffff" />
                ) : (
                  s.letter
                )}
              </div>
              <div className="min-w-0">
                <div className="font-semibold">{s.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Подписчики · Лайки · Просмотры · Комментарии
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
