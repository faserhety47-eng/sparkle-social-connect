import { createFileRoute, Link } from "@tanstack/react-router";
import { useServicePrices, SERVICE_TYPE_LIST } from "@/hooks/useServicePrices";
import { SERVICES } from "@/data/services";

export const Route = createFileRoute("/tariffs")({
  head: () => ({
    meta: [
      { title: "Тарифы и цены — smm-cat.site" },
      { name: "description", content: "Актуальные тарифы smm-cat.site: стоимость подписчиков, лайков, просмотров и комментариев по всем платформам." },
      { property: "og:title", content: "Тарифы и цены — smm-cat.site" },
      { property: "og:description", content: "Прозрачные тарифы за подписчиков, лайки, просмотры и комментарии на всех поддерживаемых платформах." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TariffsPage,
});

function TariffsPage() {
  const { prices, loading, getPrice } = useServicePrices();

  const platforms = SERVICES;
  const types = SERVICE_TYPE_LIST;

  const fmt = (n: number) =>
    n > 0 ? `${n.toFixed(2).replace(/\.00$/, "")} ₽` : "—";

  return (
    <article className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">Тарифы и цены</h1>
      <p className="mt-3 text-sm text-muted-foreground">Редакция от 23 июля 2026 г.</p>
      <p className="mt-4 text-muted-foreground max-w-3xl">
        Ниже указаны актуальные цены на услуги smm-cat.site. Стоимость приведена за 1 единицу
        (1 подписчик / 1 лайк / 1 просмотр / 1 комментарий). Итоговая сумма заказа зависит от выбранного
        объёма и рассчитывается автоматически перед оплатой на странице оформления заказа.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-card p-4 md:p-6 overflow-x-auto">
        {loading ? (
          <p className="text-muted-foreground">Загружаем тарифы…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="py-3 pr-4 font-semibold">Платформа</th>
                {types.map((t) => (
                  <th key={t.id} className="py-3 px-3 font-semibold whitespace-nowrap">{t.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {platforms.map((p) => (
                <tr key={p.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 pr-4 font-medium">{p.name}</td>
                  {types.map((t) => (
                    <td key={t.id} className="py-3 px-3 tabular-nums">
                      {fmt(getPrice(p.id, t.id))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && prices.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            Тарифы обновляются. Актуальную стоимость можно увидеть на странице оформления заказа.
          </p>
        )}
      </div>

      <section className="mt-10 space-y-4 text-foreground">
        <h2 className="text-xl font-bold">Как формируется цена</h2>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Цена в таблице указана за 1 единицу выбранной услуги.</li>
          <li>Минимальный и максимальный объём заказа отображаются в форме оформления заказа.</li>
          <li>Итоговая сумма = цена за единицу × количество единиц.</li>
          <li>Оплата принимается через СБП и другие доступные способы, указанные при оформлении заказа.</li>
        </ul>

        <h2 className="text-xl font-bold mt-6">Порядок оплаты</h2>
        <p className="text-muted-foreground">
          После выбора услуги Пользователь видит итоговую стоимость до подтверждения оплаты. Средства зачисляются
          на баланс аккаунта или списываются напрямую за заказ. Все условия описаны в{" "}
          <Link to="/terms-of-service" className="text-primary hover:underline">Пользовательском соглашении</Link>{" "}
          и{" "}
          <Link to="/public-offer" className="text-primary hover:underline">Договоре оферты</Link>.
        </p>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link to="/order" className="btn-primary text-sm">Оформить заказ</Link>
        <Link to="/" className="rounded-full border border-border px-5 py-2.5 text-sm hover:border-primary">
          На главную
        </Link>
      </div>
    </article>
  );
}
