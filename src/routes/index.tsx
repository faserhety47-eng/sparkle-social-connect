import { createFileRoute, Link } from "@tanstack/react-router";
import { ServicesGrid } from "@/components/site/ServicesGrid";
import { Faq, DEFAULT_FAQ } from "@/components/site/Faq";
import { SeoBlocks } from "@/components/site/SeoBlocks";
import {
  HowItWorks, Reviews, Guarantees, LiveOrdersFeed,
  VideoDemo, BlogPreview, Comparison, SupportBlock,
} from "@/components/site/HomeSections";
const HERO_CAT = "/hero-cat-transparent.png";
import { LANDING_TYPES, LANDING_PLATFORMS } from "@/data/landing-matrix";

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: DEFAULT_FAQ.map((it) => ({
    "@type": "Question",
    name: it.q,
    acceptedAnswer: { "@type": "Answer", text: it.a },
  })),
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "smm-cat.site — Продвижение в социальных сетях" },
      { name: "description", content: "Быстрая и качественная накрутка подписчиков, лайков и просмотров в Max, VK, Telegram, Одноклассники, Instagram, RuTube и YouTube." },
      { property: "og:title", content: "smm-cat.site — Продвижение в социальных сетях" },
      { property: "og:description", content: "Быстрая и качественная накрутка подписчиков, лайков и просмотров в Max, VK, Telegram, Одноклассники, Instagram, RuTube и YouTube." },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(FAQ_JSONLD),
      },
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
                src={HERO_CAT}
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

      <HowItWorks />
      <LiveOrdersFeed />
      <Guarantees />
      <VideoDemo />
      <Reviews />
      <Comparison />
      <BlogPreview />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-3xl bg-card/70 border border-border/60 p-6 md:p-10">
          <h2 className="text-2xl md:text-3xl font-extrabold">Популярные услуги накрутки</h2>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Подписчики, лайки и просмотры на 8 площадках — выберите комбинацию, и мы всё сделаем за вас.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {LANDING_TYPES.flatMap((t) =>
              LANDING_PLATFORMS.slice(0, 6).map((p) => (
                <Link
                  key={`${t.slug}-${p.slug}`}
                  to="/nakrutka/$type/$platform"
                  params={{ type: t.slug, platform: p.slug }}
                  className="text-xs md:text-sm rounded-full border border-border/70 bg-background/40 px-3 py-1.5 hover:border-primary hover:text-primary transition"
                >
                  {t.action} {p.namePrepositional}
                </Link>
              ))
            )}
          </div>
          <div className="mt-6">
            <Link to="/nakrutka" className="btn-primary text-sm">Открыть весь каталог</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-24">
        <h2 className="text-2xl md:text-3xl font-extrabold">Почему выбирают smm-cat.site</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <p>
            smm-cat.site — это SMM-сервис для быстрой и безопасной накрутки в соцсетях. Мы не запрашиваем пароль от аккаунта, работаем только по ссылке и запускаем заказ в течение 1–5 минут после оплаты.
          </p>
          <p>
            В каталоге — самые востребованные услуги: накрутка подписчиков, лайков и просмотров в TikTok, Instagram, Telegram, YouTube, ВКонтакте, Одноклассниках, RuTube и мессенджере Max. Для каждой платформы подобрана стабильная база живых аккаунтов и оптимальная скорость доставки.
          </p>
          <p>
            Оплата принимается через СБП, банковские карты и внутренний баланс. Промокоды, скидки постоянным клиентам и понятный личный кабинет с историей заказов — всё, чтобы продвижение было прозрачным и предсказуемым.
          </p>
        </div>

        <h2 className="mt-14 text-2xl md:text-3xl font-extrabold">Накрутка в социальных сетях — что это и зачем</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <p>
            Накрутка — это ускоренный набор подписчиков, лайков, просмотров, комментариев и реакций на публикации в соцсетях. Она помогает новому аккаунту быстрее пройти «холодный старт», а действующему блогу — усилить социальные сигналы, которые алгоритмы соцсетей используют при ранжировании ленты и рекомендаций.
          </p>
          <p>
            Аккаунт с большим количеством подписчиков и активной обратной связью вызывает больше доверия у живой аудитории: люди охотнее подписываются, читают посты до конца и переходят по ссылкам. Именно поэтому продвижение через smm-cat.site используют начинающие блогеры, эксперты, интернет-магазины, локальный бизнес, музыканты и SMM-агентства.
          </p>
          <p>
            Мы работаем с накруткой подписчиков и лайков в Instagram, набором просмотров и подписчиков в TikTok, продвижением каналов и постов в Telegram, накруткой участников групп и лайков во ВКонтакте, друзей и классов в Одноклассниках, а также с просмотрами и подписчиками на YouTube и RuTube. Отдельное направление — новый мессенджер Max: подписчики, реакции и просмотры в каналах.
          </p>
        </div>

        <h2 className="mt-14 text-2xl md:text-3xl font-extrabold">Как это работает</h2>
        <ol className="mt-4 space-y-3 text-muted-foreground list-decimal pl-6">
          <li>Выберите нужную социальную сеть и тип услуги — подписчики, лайки или просмотры.</li>
          <li>Укажите ссылку на профиль, пост или видео. Пароль или доступ к аккаунту не требуются.</li>
          <li>Задайте количество и оформите заказ. Оплата — картой, СБП или с внутреннего баланса.</li>
          <li>Запуск происходит автоматически в течение 1–15 минут. Прогресс виден в личном кабинете.</li>
        </ol>

        <h2 className="mt-14 text-2xl md:text-3xl font-extrabold">Безопасность и качество</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <p>
            Мы контролируем скорость доставки и подбираем «живые» аккаунты с аватарами и историей активности, чтобы накрутка выглядела естественно и не привлекала внимания антифрод-систем соцсетей. Для каждой площадки подобраны отдельные пулы исполнителей и своя допустимая скорость прироста.
          </p>
          <p>
            На большинство услуг действует гарантия сохранности: при частичном списании подписчиков в течение гарантийного срока мы бесплатно восполняем недостающее количество. Если заказ не запустился или выполнен не полностью — оформляется возврат на внутренний баланс, откуда его можно потратить на любую другую услугу.
          </p>
        </div>

        <h2 className="mt-14 text-2xl md:text-3xl font-extrabold">Кому подойдёт продвижение smm-cat.site</h2>
        <ul className="mt-4 space-y-2 text-muted-foreground list-disc pl-6">
          <li><strong className="text-foreground">Блогерам и экспертам</strong> — быстрый старт нового профиля, усиление охватов Reels, Shorts и коротких видео в TikTok.</li>
          <li><strong className="text-foreground">Малому и локальному бизнесу</strong> — рост доверия к странице кафе, салона, магазина или сервиса за счёт живой аудитории.</li>
          <li><strong className="text-foreground">Интернет-магазинам</strong> — накрутка подписчиков и лайков в Instagram и VK, чтобы карточки товаров выглядели убедительнее.</li>
          <li><strong className="text-foreground">Музыкантам и артистам</strong> — просмотры клипов на YouTube и RuTube, прослушивания и подписчики в тематических каналах.</li>
          <li><strong className="text-foreground">Владельцам каналов Telegram и Max</strong> — набор подписчиков, реакций и просмотров публикаций для попадания в рекомендации.</li>
          <li><strong className="text-foreground">SMM-специалистам и агентствам</strong> — оптовые цены, история заказов и стабильные сроки для клиентских проектов.</li>
        </ul>

        <h2 className="mt-14 text-2xl md:text-3xl font-extrabold">Оплата и цены</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <p>
            Мы работаем напрямую с исполнителями, поэтому цены на smm-cat.site — одни из самых низких в рунете. Тарифы на подписчиков, лайки и просмотры для каждой соцсети смотрите в разделе «Услуги» — они регулярно обновляются под текущий курс и загрузку исполнителей.
          </p>
          <p>
            Пополнить баланс можно банковской картой РФ, через СБП или переводом. Все комиссии платёжных систем мы берём на себя: на баланс зачисляется ровно та сумма, которую вы указали. Для постоянных клиентов действуют накопительные скидки и промокоды.
          </p>
        </div>

        <h2 className="mt-14 text-2xl md:text-3xl font-extrabold">Поддержка 24/7</h2>
        <p className="mt-4 text-muted-foreground">
          Служба поддержки smm-cat.site отвечает круглосуточно. Напишите в чат на сайте или в Telegram — поможем выбрать услугу, подскажем оптимальную скорость накрутки и решим любой вопрос по заказу. Мы работаем в рунете более 8 лет и выполнили свыше 11 миллионов заказов — накрутка в соцсетях с smm-cat.site это надёжно, быстро и по-настоящему выгодно.
        </p>
        <div className="mt-4">
          <Faq />
        </div>
      </section>

      <SupportBlock />
    </div>
  );
}

