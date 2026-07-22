import { createFileRoute, Link } from "@tanstack/react-router";
import { ServicesGrid } from "@/components/site/ServicesGrid";
import heroCat from "@/assets/hero-cat-transparent.png.asset.json";
import { LANDING_TYPES, LANDING_PLATFORMS } from "@/data/landing-matrix";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "smm-cat.site — Продвижение в социальных сетях" },
      { name: "description", content: "Быстрая и качественная накрутка подписчиков, лайков и просмотров в Max, VK, Telegram, Одноклассники, Instagram, RuTube и YouTube." },
      { property: "og:title", content: "smm-cat.site — Продвижение в социальных сетях" },
      { property: "og:description", content: "Быстрая и качественная накрутка подписчиков, лайков и просмотров в Max, VK, Telegram, Одноклассники, Instagram, RuTube и YouTube." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-brand/15 blur-3xl" />
        <div className="absolute top-72 -right-40 h-[420px] w-[420px] rounded-full bg-brand-2/15 blur-3xl" />
        <div className="absolute top-96 -left-40 h-[360px] w-[360px] rounded-full bg-brand/10 blur-3xl" />
      </div>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-24">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="text-center md:text-left max-w-2xl mx-auto md:mx-0 order-2 md:order-1">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] text-foreground">
              Продвижение в <span className="brand-logo">социальных&nbsp;сетях</span>
            </h1>
            <p className="mt-5 text-muted-foreground text-base md:text-lg">
              Повысьте активность и привлекательность вашего блога или личной страницы
            </p>
          </div>

          <div className="order-1 md:order-2 flex justify-center md:justify-end">
            <div className="relative">
              <div aria-hidden className="absolute inset-0 -z-10 rounded-full bg-brand/20 blur-3xl scale-90" />
              <img
                src={heroCat.url}
                alt="Милый кот-маскот smm-cat.site"
                className="w-64 sm:w-80 md:w-[420px] lg:w-[500px] h-auto drop-shadow-2xl select-none"
                draggable={false}
              />
            </div>
          </div>
        </div>

        <div className="mt-16">
          <ServicesGrid />
        </div>
      </section>
    </div>
  );
}

