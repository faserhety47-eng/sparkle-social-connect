import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SERVICES } from "@/data/services";
import { BRAND_ICONS } from "@/data/service-icons";
import { PLATFORM_SERVICES, type PlatformService } from "@/data/platform-services";

export const Route = createFileRoute("/services/$platform")({
  head: ({ params }) => {
    const svc = SERVICES.find((s) => s.id === params.platform);
    const title = svc ? `Продвижение ${svc.name} — Oz Top` : "Услуга — Oz Top";
    const description = svc
      ? `Накрутка подписчиков, лайков, просмотров и комментариев для ${svc.name}. Быстрый запуск, низкие цены.`
      : "SMM услуги Oz Top";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  loader: ({ params }) => {
    const svc = SERVICES.find((s) => s.id === params.platform);
    const list = PLATFORM_SERVICES[params.platform];
    if (!svc || !list) throw notFound();
    return { svc, list };
  },
  component: PlatformPage,
  notFoundComponent: () => (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-extrabold">Платформа не найдена</h1>
      <Link to="/services" className="mt-4 inline-block text-primary underline">Ко всем услугам</Link>
    </section>
  ),
  errorComponent: ({ reset }) => (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-extrabold">Что-то пошло не так</h1>
      <button onClick={reset} className="mt-4 btn-primary">Повторить</button>
    </section>
  ),
});

function PlatformPage() {
  const { svc, list } = Route.useLoaderData();
  const Icon = BRAND_ICONS[svc.id];

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="flex items-center gap-4">
        <div
          className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-md ring-1 ring-white/5"
          style={{ backgroundColor: svc.color }}
        >
          {Icon ? <Icon width={32} height={32} color="#ffffff" /> : (
            <span className="text-white font-bold text-2xl">{svc.letter}</span>
          )}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Продвижение</div>
          <h1 className="text-3xl md:text-4xl font-extrabold">{svc.name}</h1>
        </div>
      </div>

      <p className="mt-4 text-muted-foreground max-w-2xl">
        Выберите услугу — быстрый старт, безопасно для аккаунта, оплата за фактическое выполнение.
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(list as PlatformService[]).map((item) => (
          <Link
            key={item.id}
            to="/order"
            search={{ platform: svc.id, service: item.id } as never}
            className="group rounded-2xl bg-card p-5 shadow-tile ring-1 ring-white/5 hover:ring-primary/40 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold">{item.name}</h3>
              <div className="text-primary font-extrabold whitespace-nowrap">
                {item.price} ₽<span className="text-xs text-muted-foreground font-medium"> /шт</span>
              </div>
            </div>
            {item.description && (
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              <span className="rounded-full bg-muted px-2 py-1">от {item.min} шт</span>
              <span className="rounded-full bg-muted px-2 py-1">до {item.max.toLocaleString("ru")} шт</span>
              {item.speed && <span className="rounded-full bg-muted px-2 py-1">{item.speed}</span>}
            </div>
            <div className="mt-4 text-sm font-semibold text-primary group-hover:translate-x-0.5 transition">
              Заказать →
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground">
          ← Все платформы
        </Link>
      </div>
    </section>
  );
}
