import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api")({
  head: () => ({
    meta: [
      { title: "API OzTop Media — документация для реселлеров" },
      { name: "description", content: "Документация REST API OzTop Media: список услуг, создание заказа, статус, баланс." },
      { property: "og:title", content: "API OzTop Media" },
      { property: "og:description", content: "REST API для реселлеров: создание заказов, статусы, баланс." },
    ],
  }),
  component: ApiDocs,
});

const BASE = "https://oztop.media/api/reseller";

const endpoints = [
  {
    id: "services",
    title: "Список услуг",
    method: "POST",
    url: `${BASE}/services`,
    params: [{ name: "api_token", required: true, desc: "Ваш API ключ" }],
    response: `{
  "services": {
    "instagram": {
      "podpisciki": {
        "136": { "service_id": 136, "price": 0.05, "min": 20, "max": 5000, "name": "Мир (Боты) | Аватарка + Посты" }
      }
    }
  },
  "status": 200
}`,
  },
  {
    id: "create",
    title: "Создание заказа",
    method: "POST",
    url: `${BASE}/create_order`,
    params: [
      { name: "api_token", required: true, desc: "Ваш API ключ" },
      { name: "service_id", required: true, desc: "ID заказываемой услуги" },
      { name: "count", required: true, desc: "Количество" },
      { name: "link", required: true, desc: "Ссылка на объект накрутки" },
    ],
    response: `{ "order_id": 105987, "status": 200 }`,
  },
  {
    id: "status",
    title: "Статус заказа",
    method: "POST",
    url: `${BASE}/order_status`,
    params: [
      { name: "api_token", required: true, desc: "Ваш API ключ" },
      { name: "order_id", required: true, desc: "ID заказа" },
    ],
    response: `{
  "order": { "id": 91847, "service_id": 207, "link": "...", "count": 945, "price": 457.37, "status_id": 3, "status_name": "Выполнено" },
  "status": 200
}`,
  },
  {
    id: "statuses",
    title: "Статусы заказов (массово)",
    method: "POST",
    url: `${BASE}/orders_statuses`,
    params: [
      { name: "api_token", required: true, desc: "Ваш API ключ" },
      { name: "order_ids", required: true, desc: "Список ID через запятую, до 1000" },
    ],
    response: `{ "orders": { "91873": { "id": 91873, "status_id": 3, "status_name": "Выполнено" } }, "status": 200 }`,
  },
  {
    id: "balance",
    title: "Баланс аккаунта",
    method: "POST",
    url: `${BASE}/balance`,
    params: [{ name: "api_token", required: true, desc: "Ваш API ключ" }],
    response: `{ "balance": 1537.84, "status": 200 }`,
  },
  {
    id: "order-statuses",
    title: "Возможные статусы заказа",
    method: "POST",
    url: `${BASE}/statuses`,
    params: [{ name: "api_token", required: true, desc: "Ваш API ключ" }],
    response: `{
  "order_statuses": {
    "1": "В обработке", "2": "Не оплачено", "3": "Выполнено", "4": "Частично выполнено",
    "5": "Отменено", "6": "Ошибка", "7": "Выполняется", "8": "Возврат платежа",
    "9": "Неизвестно", "10": "В очереди"
  },
  "status": 200
}`,
  },
];

function ApiDocs() {
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl md:text-4xl font-extrabold">API документация</h1>
      <p className="mt-3 text-muted-foreground max-w-2xl">
        REST-API для реселлеров. Все запросы отправляются методом POST, ответы возвращаются в формате JSON.
        Ниже — краткое описание всех доступных методов.
      </p>

      <nav className="mt-8 rounded-2xl bg-card p-5 shadow-tile">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Оглавление</h2>
        <ul className="mt-3 grid gap-1 sm:grid-cols-2 text-sm">
          {endpoints.map((e) => (
            <li key={e.id}>
              <a href={`#${e.id}`} className="text-primary hover:underline">— {e.title}</a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-10 space-y-10">
        {endpoints.map((e) => (
          <article key={e.id} id={e.id} className="rounded-3xl bg-card p-6 md:p-8 shadow-tile">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-primary/10 text-primary text-xs font-bold px-2 py-1">
                {e.method}
              </span>
              <h2 className="text-xl md:text-2xl font-bold">{e.title}</h2>
            </div>
            <code className="mt-3 block text-sm text-muted-foreground break-all">{e.url}</code>

            <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Параметры</h3>
            <ul className="mt-2 space-y-1.5 text-sm">
              {e.params.map((p) => (
                <li key={p.name} className="flex flex-wrap gap-2">
                  <code className="font-mono text-primary font-semibold">{p.name}</code>
                  {p.required && <span className="text-xs text-destructive">обязательный</span>}
                  <span className="text-muted-foreground">— {p.desc}</span>
                </li>
              ))}
            </ul>

            <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Пример ответа</h3>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-foreground/95 text-background p-4 text-xs leading-relaxed">
              <code>{e.response}</code>
            </pre>
          </article>
        ))}
      </div>
    </section>
  );
}
