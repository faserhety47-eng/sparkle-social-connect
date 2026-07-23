import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SERVICES } from "@/data/services";

export const Route = createFileRoute("/tariffs")({
  head: () => ({
    meta: [
      { title: "Тарифы и цены — smm-cat.site" },
      { name: "description", content: "Актуальные тарифы smm-cat.site: минимальная стоимость подписчиков, лайков, просмотров и комментариев по всем платформам." },
      { property: "og:title", content: "Тарифы и цены — smm-cat.site" },
      { property: "og:description", content: "Прозрачные тарифы за подписчиков, лайки, просмотры и комментарии на всех поддерживаемых платформах." },
      { property: "og:url", content: "https://smm-cat.site/tariffs" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://smm-cat.site/tariffs" }],
  }),
  component: TariffsPage,
});

const TYPES = [
  { id: "followers", label: "Подписчики", re: /podpisc|druze/ },
  { id: "likes",     label: "Лайки",      re: /laik|klass|reakci/ },
  { id: "views",     label: "Просмотры",  re: /prosmotr|pokaz|oxvat/ },
  { id: "comments",  label: "Комментарии", re: /komment/ },
] as const;

function classify(category: string): string | null {
  for (const t of TYPES) if (t.re.test(category)) return t.id;
  return null;
}

function TariffsPage() {
  const [matrix, setMatrix] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("smm_services")
        .select("platform, category, price_rub");
      const m: Record<string, Record<string, number>> = {};
      for (const row of data ?? []) {
        const type = classify(row.category);
        if (!type) continue;
        const price = Number(row.price_rub);
        if (!isFinite(price) || price <= 0) continue;
        m[row.platform] ??= {};
        const cur = m[row.platform][type];
        if (cur === undefined || price < cur) m[row.platform][type] = price;
      }
      setMatrix(m);
      setLoading(false);
    })();
  }, []);

  const fmt = (n: number | undefined) => {
    if (!n || n <= 0) return "—";
    return `от ${n.toFixed(2).replace(/\.?0+$/, "")} ₽`;
  };

  return (
    <article className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">Тарифы и цены</h1>
      <p className="mt-3 text-sm text-muted-foreground">Актуально на момент просмотра страницы.</p>
      <p className="mt-4 text-muted-foreground max-w-3xl">
        В таблице указана минимальная цена за 1 единицу услуги (1 подписчик / 1 лайк / 1 просмотр / 1 комментарий)
        по каждой платформе. Внутри каждой категории доступно несколько тарифов с разной скоростью и качеством —
        полный список и точная стоимость отображаются на странице оформления заказа.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-card p-4 md:p-6 overflow-x-auto">
        {loading ? (
          <p className="text-muted-foreground">Загружаем тарифы…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="py-3 pr-4 font-semibold">Платформа</th>
                {TYPES.map((t) => (
                  <th key={t.id} className="py-3 px-3 font-semibold whitespace-nowrap">{t.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SERVICES.map((p) => (
                <tr key={p.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 pr-4 font-medium">{p.name}</td>
                  {TYPES.map((t) => (
                    <td key={t.id} className="py-3 px-3 tabular-nums whitespace-nowrap">
                      {fmt(matrix[p.id]?.[t.id])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <section className="mt-10 space-y-4 text-foreground">
        <h2 className="text-xl font-bold">Как формируется цена</h2>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>В таблице показана минимальная цена за 1 единицу — реальные тарифы внутри категории могут быть выше в зависимости от качества и скорости.</li>
          <li>Минимальный и максимальный объём заказа отображаются в форме оформления.</li>
          <li>Итоговая сумма = цена за единицу × количество единиц.</li>
          <li>Оплата принимается через доступные способы, указанные при оформлении заказа.</li>
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

