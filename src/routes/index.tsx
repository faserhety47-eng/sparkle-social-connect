import { createFileRoute } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { ServicesGrid } from "@/components/site/ServicesGrid";
import { Stats } from "@/components/site/Stats";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OzTop Media — Бесплатная и платная SMM накрутка" },
      { name: "description", content: "Быстрая и качественная накрутка подписчиков, лайков и просмотров в 40+ соцсетях. Регистрация не требуется." },
      { property: "og:title", content: "OzTop Media — SMM накрутка" },
      { property: "og:description", content: "40+ соцсетей, миллионы выполненных заказов, работа без регистрации." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative overflow-hidden">
      {/* Decorative floating shapes */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute top-40 -right-24 h-96 w-96 rounded-full bg-brand-2/10 blur-3xl" />
      </div>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 md:pt-16">
        <div className="flex items-start gap-4 md:gap-6">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-2 shadow-cta">
            <Zap className="h-6 w-6 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-foreground">
              Бесплатная и платная SMM<br className="hidden md:block" /> накрутка подписчиков, лайков
            </h1>
            <p className="mt-3 text-muted-foreground text-base md:text-lg">Регистрация не требуется</p>
          </div>
        </div>

        <div className="mt-10">
          <ServicesGrid />
        </div>

        <Stats />

        <section className="mt-24 grid gap-8 md:grid-cols-3">
          {[
            { t: "Быстрый старт", d: "Заказы обрабатываются в течение нескольких минут после оплаты." },
            { t: "Гарантия качества", d: "Мы работаем только с проверенными поставщиками уже 8 лет." },
            { t: "API для реселлеров", d: "Полноценное REST-API для интеграции в ваши сервисы." },
          ].map((f) => (
            <div key={t_key(f.t)} className="rounded-3xl bg-card p-6 shadow-tile">
              <h3 className="text-lg font-bold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </section>
      </section>
    </div>
  );
}

function t_key(s: string) { return s; }
