import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LANDING_TYPES,
  LANDING_PLATFORMS,
} from "@/data/landing-matrix";

export const Route = createFileRoute("/nakrutka/")({
  head: () => ({
    meta: [
      { title: "Накрутка подписчиков, лайков и просмотров — smm-cat.site" },
      { name: "description", content: "Каталог услуг накрутки: подписчики, лайки, просмотры в TikTok, Instagram, Telegram, YouTube, ВКонтакте, Одноклассниках, RuTube и Max." },
      { property: "og:title", content: "Накрутка подписчиков, лайков и просмотров" },
      { property: "og:description", content: "24 услуги накрутки на 8 платформах. Живые аккаунты, старт за 1–5 минут, гарантия возврата." },
      { property: "og:url", content: "https://smm-cat.site/nakrutka" },
    ],
    links: [{ rel: "canonical", href: "https://smm-cat.site/nakrutka" }],
  }),
  component: NakrutkaHub,
});

function NakrutkaHub() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl md:text-5xl font-extrabold">Накрутка в соцсетях</h1>
      <p className="mt-3 text-muted-foreground max-w-2xl">
        Выберите тип услуги и платформу — откроется страница с описанием и формой заказа.
      </p>

      {LANDING_TYPES.map((t) => (
        <div key={t.slug} className="mt-12">
          <h2 className="text-2xl md:text-3xl font-extrabold">{t.action}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t.benefit}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LANDING_PLATFORMS.map((p) => (
              <Link
                key={`${t.slug}-${p.slug}`}
                to="/nakrutka/$type/$platform"
                params={{ type: t.slug, platform: p.slug }}
                className="rounded-2xl bg-card p-4 shadow-tile hover:-translate-y-0.5 transition"
              >
                <div className="font-semibold">
                  {t.what.charAt(0).toUpperCase() + t.what.slice(1)} {p.namePrepositional}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{p.short}</div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
