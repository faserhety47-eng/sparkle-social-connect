import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  findType,
  findPlatform,
  landingTitle,
  landingDescription,
} from "@/data/landing-matrix";
import { BRAND_ICONS, BRAND_IMAGE_ICONS } from "@/data/service-icons";
import { parseBuiltinIcon } from "@/data/icon-library";
import { usePlatforms } from "@/hooks/usePlatforms";

export const Route = createFileRoute("/nakrutka/$type/$platform")({
  loader: ({ params }) => {
    const t = findType(params.type);
    const p = findPlatform(params.platform);
    if (!t || !p) throw notFound();
    return { t, p };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Страница не найдена" }, { name: "robots", content: "noindex" }] };
    }
    const { t, p } = loaderData;
    const url = `https://smm-cat.site/nakrutka/${params.type}/${params.platform}`;
    const title = landingTitle(t, p);
    const desc = landingDescription(t, p);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "product" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: title,
            description: desc,
            provider: { "@type": "Organization", name: "smm-cat.site", url: "https://smm-cat.site" },
            areaServed: "RU",
            offers: {
              "@type": "Offer",
              priceCurrency: "RUB",
              price: priceHint(params.type, params.platform) ?? undefined,
              availability: "https://schema.org/InStock",
              url,
            },
          }),
        },
      ],
    };
  },
  component: LandingPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-3xl font-extrabold">Такая услуга не найдена</h1>
      <p className="mt-3 text-muted-foreground">Посмотрите каталог услуг.</p>
      <Link to="/nakrutka" className="btn-primary mt-6 inline-flex">Все услуги</Link>
    </div>
  ),
});

function LandingPage() {
  const { t, p } = Route.useLoaderData();
  const { platform: platformSlug } = Route.useParams();
  const { platforms } = usePlatforms({ onlyActive: true });
  const platformRow = platforms.find((x) => x.id === p.slug);
  const price = priceHint(t.slug, p.slug);

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[420px] w-[820px] rounded-full bg-brand/15 blur-3xl" />
      </div>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <nav className="text-xs text-muted-foreground mb-4">
          <Link to="/" className="hover:text-primary">Главная</Link>
          <span className="mx-1">/</span>
          <Link to="/nakrutka" className="hover:text-primary">Накрутка</Link>
          <span className="mx-1">/</span>
          <span className="text-foreground">{t.action} {p.namePrepositional}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-4">
          <PlatformBadge slug={p.slug} name={p.name} colorFallback={platformRow?.color} iconUrl={platformRow?.icon_url ?? undefined} />
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              {t.action} {p.namePrepositional}
            </h1>
            {price && (
              <div className="mt-2 text-muted-foreground">
                От <span className="font-semibold text-foreground">{price} ₽</span> за {t.metric}
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-3xl">
          {t.benefit} {p.short}. Заказ оформляется за минуту — просто вставьте ссылку и укажите количество.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/order"
            search={{ platform: p.slug } as never}
            className="btn-primary"
          >
            Заказать {t.what} {p.namePrepositional}
          </Link>
          <Link to="/nakrutka" className="btn-ghost border border-border rounded-full">
            Другие услуги
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <Feature
            title="Старт за 1–5 минут"
            text="Заказ уходит в работу сразу после оплаты, без ручного подтверждения."
          />
          <Feature
            title="Живые аккаунты"
            text={`Мы используем реальные аккаунты ${p.namePrepositional}: минимум списаний, стабильный результат.`}
          />
          <Feature
            title="Гарантия и возврат"
            text="Если объём не выполнен — автоматически возвращаем деньги на баланс."
          />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 prose-invert">
        <h2 className="text-2xl md:text-3xl font-extrabold">
          Зачем нужна {t.action.toLowerCase()} {p.namePrepositional}?
        </h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <p>
            {p.name} — одна из самых активных площадок Рунета. {t.benefit}
          </p>
          <p>
            Мы подбираем скорость поступления {t.plural} под возраст и тематику вашего профиля,
            чтобы {p.namePrepositional} рост выглядел естественно и не вызывал вопросов у алгоритмов.
          </p>
          <p>
            Услуга подходит как для личных страниц, так и для бизнес-профилей, брендов и медиа.
            Оплата принимается через СБП, банковские карты и внутренний баланс smm-cat.site.
          </p>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold mt-10">Как оформить заказ</h2>
        <ol className="mt-4 space-y-3 text-muted-foreground list-decimal list-inside">
          <li>Нажмите «Заказать {t.what} {p.namePrepositional}».</li>
          <li>Вставьте ссылку на профиль или публикацию.</li>
          <li>Укажите количество {t.plural} и оплатите заказ.</li>
          <li>Отслеживайте выполнение в личном кабинете.</li>
        </ol>

        <h2 className="text-2xl md:text-3xl font-extrabold mt-10">Частые вопросы</h2>
        <div className="mt-4 space-y-4">
          <FaqItem
            q={`Безопасна ли ${t.action.toLowerCase()} ${p.namePrepositional}?`}
            a={`Да. Мы работаем через легальные механики продвижения, не запрашиваем пароль и не имеем доступа к вашему аккаунту ${p.namePrepositional}.`}
          />
          <FaqItem
            q={`Как быстро появятся ${t.plural}?`}
            a="Первые результаты появляются в течение 1–5 минут после оплаты. Полное выполнение — от нескольких часов до 1–2 суток в зависимости от объёма."
          />
          <FaqItem
            q="Что делать, если часть списалась?"
            a="В течение 30 дней действует автовозврат: недостающий объём добавляется бесплатно или возвращается на баланс."
          />
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/order"
            search={{ platform: p.slug } as never}
            className="btn-primary inline-flex"
          >
            Заказать сейчас
          </Link>
        </div>
      </section>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-tile">
      <div className="font-semibold">{title}</div>
      <p className="text-sm text-muted-foreground mt-2">{text}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="rounded-xl bg-card/60 p-4 border border-border/60">
      <summary className="cursor-pointer font-medium">{q}</summary>
      <p className="mt-2 text-sm text-muted-foreground">{a}</p>
    </details>
  );
}

function PlatformBadge({
  slug,
  name,
  colorFallback,
  iconUrl,
}: {
  slug: string;
  name: string;
  colorFallback?: string;
  iconUrl?: string;
}) {
  const builtin = parseBuiltinIcon(iconUrl);
  const Icon = BRAND_ICONS[slug];
  const image = BRAND_IMAGE_ICONS[slug];
  const bg = builtin?.color ?? colorFallback ?? "#7B4FFF";
  return (
    <div
      className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-md overflow-hidden shrink-0"
      style={{ backgroundColor: bg }}
      aria-label={name}
    >
      {builtin?.imageUrl ? (
        <img src={builtin.imageUrl} alt="" className="h-9 w-9 object-contain" />
      ) : builtin?.Icon ? (
        <builtin.Icon width={32} height={32} color="#ffffff" />
      ) : image ? (
        <img src={image} alt="" className="h-9 w-9 object-contain" />
      ) : Icon ? (
        <Icon width={32} height={32} color="#ffffff" />
      ) : (
        <span className="text-white font-bold text-2xl">{name.slice(0, 1)}</span>
      )}
    </div>
  );
}
