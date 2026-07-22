import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Политика конфиденциальности — smm-cat.site" },
      { name: "description", content: "Политика обработки персональных данных пользователей smm-cat.site." },
      { property: "og:title", content: "Политика конфиденциальности — smm-cat.site" },
      { property: "og:description", content: "Политика обработки персональных данных пользователей smm-cat.site." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">Политика конфиденциальности</h1>
      <p className="mt-4 text-muted-foreground">
        Настоящая Политика конфиденциальности описывает, как сайт smm-cat.site собирает, использует и защищает
        информацию пользователей. Пожалуйста, внимательно прочитайте этот документ перед использованием сервиса.
      </p>

      <section className="mt-10 space-y-6 text-foreground">
        <div>
          <h2 className="text-xl font-bold mb-2">1. Общие положения</h2>
          <p>
            Оператор сайта smm-cat.site (ИНН владельца: 245712479721) обязуется соблюдать конфиденциальность
            персональных данных пользователей. Используя сайт, вы даёте согласие на обработку данных в соответствии
            с настоящей Политикой.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">2. Какие данные мы собираем</h2>
          <p>Мы можем собирать следующие данные:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>адрес электронной почты;</li>
            <li>данные профиля в социальных сетях (ссылки на страницы, никнеймы);</li>
            <li>информация о заказах и платежах;</li>
            <li>технические данные (IP-адрес, cookies, тип браузера);</li>
            <li>переписка со службой поддержки.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">3. Цели обработки данных</h2>
          <p>Данные используются для:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>обработки и выполнения заказов;</li>
            <li>пополнения баланса и учёта платежей;</li>
            <li>связи с пользователем по вопросам обслуживания;</li>
            <li>улучшения качества работы сайта и персонализации;</li>
            <li>выполнения требований законодательства.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">4. Хранение и защита данных</h2>
          <p>
            Мы принимаем разумные меры для защиты информации от несанкционированного доступа, изменения или удаления.
            Доступ к персональным данным имеют только лица, которым он необходим для выполнения своих обязанностей.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">5. Передача данных третьим лицам</h2>
          <p>
            Мы не передаём персональные данные пользователей третьим лицам, за исключением случаев, когда это необходимо
            для выполнения заказа (например, поставщики услуг), а также когда требуется по закону.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">6. Cookies и аналитика</h2>
          <p>
            Сайт использует cookies и аналитические инструменты (например, Яндекс.Метрика) для улучшения работы и сбора
            статистики. Пользователь может отключить cookies в настройках браузера.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">7. Права пользователя</h2>
          <p>Пользователь вправе:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>запросить информацию о своих данных;</li>
            <li>потребовать исправления или удаления данных;</li>
            <li>отозвать согласие на обработку данных;</li>
            <li>обжаловать действия Оператора в уполномоченных органах.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">8. Контакты</h2>
          <p>
            По вопросам, связанным с обработкой персональных данных, обращайтесь через Telegram:{" "}
            <a href="https://t.me/serh465" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              @serh465
            </a>
          </p>
        </div>
      </section>

      <div className="mt-12">
        <Link to="/" className="btn-primary text-sm">На главную</Link>
      </div>
    </article>
  );
}
