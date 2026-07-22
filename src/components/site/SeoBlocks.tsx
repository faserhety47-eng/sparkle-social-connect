import { Sparkles, RefreshCcw, ShieldCheck, Users, CreditCard, HeadphonesIcon } from "lucide-react";

const BLOCKS = [
  {
    id: "why",
    icon: Sparkles,
    title: "Почему выбирают smm-cat.site",
    points: [
      "SMM-сервис для быстрой и безопасной накрутки в соцсетях.",
      "Не запрашиваем пароль от аккаунта — работаем только по ссылке.",
      "Заказ запускается в течение 1–5 минут после оплаты.",
      "Подписчики, лайки и просмотры в TikTok, Instagram, Telegram, YouTube, VK, ОК, RuTube и Max.",
      "Оплата через СБП, карты РФ и внутренний баланс.",
      "Промокоды, скидки и личный кабинет с историей заказов.",
    ],
  },
  {
    id: "what",
    icon: RefreshCcw,
    title: "Накрутка в социальных сетях — что это и зачем",
    points: [
      "Ускоренный набор подписчиков, лайков, просмотров и реакций.",
      "Помогает новому аккаунту пройти «холодный старт».",
      "Усиливает социальные сигналы для алгоритмов лент и рекомендаций.",
      "Аккаунт с активной аудиторией вызывает больше доверия.",
      "Подходит блогерам, бизнесу, магазинам, музыкантам и агентствам.",
    ],
  },
  {
    id: "how",
    icon: Users,
    title: "Как это работает",
    points: [
      "Выберите социальную сеть и тип услуги.",
      "Укажите ссылку на профиль, пост или видео — пароль не нужен.",
      "Задайте количество и оформите заказ.",
      "Оплатите картой, СБП или с внутреннего баланса.",
      "Запуск в течение 1–15 минут, прогресс виден в личном кабинете.",
    ],
  },
  {
    id: "safe",
    icon: ShieldCheck,
    title: "Безопасность и качество",
    points: [
      "Контролируем скорость доставки для естественного прироста.",
      "Используем аккаунты с аватарами и историей активности.",
      "Отдельные пулы исполнителей для каждой площадки.",
      "Гарантия сохранности: бесплатно восполняем списания.",
      "Возврат на внутренний баланс при неполном выполнении.",
    ],
  },
  {
    id: "who",
    icon: Users,
    title: "Кому подойдёт продвижение smm-cat.site",
    points: [
      "Блогерам и экспертам — старт профиля и охваты Reels/Shorts.",
      "Малому и локальному бизнесу — рост доверия к странице.",
      "Интернет-магазинам — убедительные карточки товаров.",
      "Музыкантам и артистам — просмотры клипов на YouTube и RuTube.",
      "Владельцам каналов Telegram и Max — реакции и подписчики.",
      "SMM-агентствам — оптовые цены и стабильные сроки.",
    ],
  },
  {
    id: "pay",
    icon: CreditCard,
    title: "Оплата и цены",
    points: [
      "Цены ниже рынка за счёт прямой работы с исполнителями.",
      "Тарифы обновляются под текущий курс и загрузку.",
      "Пополнение баланса картой РФ, СБП или переводом.",
      "Комиссии платёжных систем берём на себя.",
      "Накопительные скидки и промокоды для постоянных клиентов.",
    ],
  },
  {
    id: "support",
    icon: HeadphonesIcon,
    title: "Поддержка 24/7",
    points: [
      "Круглосуточная поддержка в чате сайта и Telegram.",
      "Поможем выбрать услугу и оптимальную скорость накрутки.",
      "Решим любой вопрос по заказу в кратчайшие сроки.",
      "Более 8 лет в рунете и свыше 11 миллионов выполненных заказов.",
    ],
  },
];

export function SeoBlocks() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-extrabold">Всё о продвижении в smm-cat.site</h2>
        <p className="mt-2 text-muted-foreground">Коротко о главном: почему, как и для кого работает наш сервис.</p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {BLOCKS.map((b) => (
          <article
            key={b.id}
            className="group rounded-2xl border border-border/60 bg-card/70 p-5 hover:border-primary/40 transition shadow-tile hover:shadow-tile-hover"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-brand/15 to-brand-2/15 flex items-center justify-center">
                <b.icon className="h-5 w-5 text-brand" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold leading-snug text-sm">{b.title}</h3>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {b.points.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-2" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
