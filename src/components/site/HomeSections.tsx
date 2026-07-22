import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Search, Link2, CreditCard, Rocket, ShieldCheck, KeyRound, RefreshCcw,
  MessageCircle, Send, Play, Star, Check, X, BookOpen,
} from "lucide-react";

/* ============ How it works ============ */
export function HowItWorks() {
  const steps = [
    { icon: Search, title: "Выберите услугу", text: "Соцсеть и тип: подписчики, лайки, просмотры." },
    { icon: Link2, title: "Укажите ссылку", text: "На профиль, пост или видео. Пароль не нужен." },
    { icon: CreditCard, title: "Оплатите заказ", text: "Карта РФ, СБП или внутренний баланс." },
    { icon: Rocket, title: "Запуск за минуты", text: "Стартуем через 1–15 минут, прогресс в кабинете." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-extrabold">Как это работает</h2>
        <p className="mt-2 text-muted-foreground">Всего 4 простых шага от выбора до результата.</p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <div key={i} className="relative rounded-2xl border border-border/60 bg-card/70 p-6 hover:border-primary/60 transition">
            <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-brand text-brand-foreground text-sm font-bold flex items-center justify-center shadow">
              {i + 1}
            </div>
            <s.icon className="h-8 w-8 text-brand" />
            <h3 className="mt-4 font-bold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============ Reviews ============ */
const REVIEWS = [
  { name: "Анна К.", role: "Блогер, Instagram", text: "Заказала 5000 подписчиков — пришли за сутки, без списаний. Очень довольна!", rating: 5 },
  { name: "Максим В.", role: "Владелец кафе", text: "Накрутили лайки на посты в VK, охваты выросли в 3 раза. Теперь заказываю регулярно.", rating: 5 },
  { name: "Ирина С.", role: "Магазин одежды", text: "Быстро, недорого, поддержка отвечает моментально. Рекомендую!", rating: 5 },
  { name: "Дмитрий П.", role: "YouTube-канал", text: "Просмотры на новое видео зашли ровно, без всплесков. Алгоритмы YouTube довольны.", rating: 5 },
  { name: "Елена М.", role: "Telegram-канал", text: "Подписчики живые, часть даже комментирует. Спасибо, продолжаем работу.", rating: 5 },
  { name: "Артём Л.", role: "TikTok-креатор", text: "Заказал просмотры и лайки — ролик залетел в реки. Цены адекватные.", rating: 5 },
];
export function Reviews() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-extrabold">Отзывы клиентов</h2>
        <p className="mt-2 text-muted-foreground">Более 11 миллионов выполненных заказов и тысячи благодарностей.</p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REVIEWS.map((r, i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-card/70 p-6">
            <div className="flex gap-0.5 text-brand">
              {Array.from({ length: r.rating }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-3 text-sm text-foreground/90">«{r.text}»</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand/20 text-brand font-bold flex items-center justify-center">
                {r.name[0]}
              </div>
              <div>
                <div className="text-sm font-semibold">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============ Guarantees ============ */
export function Guarantees() {
  const items = [
    { icon: KeyRound, title: "Без пароля", text: "Работаем только по ссылке. Ваш аккаунт в безопасности." },
    { icon: ShieldCheck, title: "Гарантия сохранности", text: "Восполняем списания в течение гарантийного срока." },
    { icon: RefreshCcw, title: "Возврат на баланс", text: "Если что-то пошло не так — вернём средства на внутренний баланс." },
    { icon: MessageCircle, title: "Поддержка 24/7", text: "Отвечаем в чате и Telegram круглосуточно." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="rounded-3xl bg-gradient-to-br from-brand/10 via-card/70 to-brand-2/10 border border-border/60 p-6 md:p-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold">Гарантии и безопасность</h2>
          <p className="mt-2 text-muted-foreground">Мы дорожим репутацией и работаем прозрачно.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <div key={i} className="rounded-2xl bg-background/60 border border-border/60 p-5">
              <it.icon className="h-8 w-8 text-brand" />
              <h3 className="mt-3 font-bold text-sm">{it.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ Live orders feed ============ */
const LIVE_TEMPLATES = [
  { platform: "TikTok", service: "подписчики", qty: [500, 1000, 2000, 5000] },
  { platform: "Instagram", service: "лайки", qty: [100, 300, 500, 1000] },
  { platform: "Telegram", service: "подписчики канала", qty: [200, 500, 1000] },
  { platform: "YouTube", service: "просмотры", qty: [1000, 5000, 10000] },
  { platform: "ВКонтакте", service: "участники группы", qty: [500, 1000, 3000] },
  { platform: "Одноклассники", service: "классы", qty: [100, 500, 1000] },
  { platform: "RuTube", service: "просмотры", qty: [1000, 3000] },
  { platform: "Max", service: "подписчики", qty: [200, 500, 1000] },
];
const NAMES = ["Александр", "Мария", "Дмитрий", "Ольга", "Иван", "Екатерина", "Сергей", "Анна", "Павел", "Наталья"];
function randOrder() {
  const t = LIVE_TEMPLATES[Math.floor(Math.random() * LIVE_TEMPLATES.length)];
  const qty = t.qty[Math.floor(Math.random() * t.qty.length)];
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const mins = Math.floor(Math.random() * 9) + 1;
  return { id: Math.random(), name, platform: t.platform, service: t.service, qty, mins };
}
export function LiveOrdersFeed() {
  const [orders, setOrders] = useState(() => Array.from({ length: 5 }, randOrder));
  useEffect(() => {
    const t = setInterval(() => {
      setOrders((prev) => [randOrder(), ...prev].slice(0, 5));
    }, 8000);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-extrabold">Живая лента заказов</h2>
        <p className="mt-2 text-muted-foreground">Только что оформленные заказы наших клиентов.</p>
      </div>
      <div className="mt-8 max-w-2xl mx-auto space-y-2">
        {orders.map((o) => (
          <div
            key={o.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/70 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-500"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <div className="min-w-0 text-sm truncate">
                <span className="font-semibold">{o.name}</span>{" "}
                <span className="text-muted-foreground">заказал(а)</span>{" "}
                <span className="font-medium">{o.platform} · {o.service}</span>{" "}
                <span className="text-muted-foreground">— {o.qty.toLocaleString("ru-RU")} шт.</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">{o.mins} мин назад</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============ Video demo ============ */
export function VideoDemo() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold">Оформите заказ за 1 минуту</h2>
          <p className="mt-3 text-muted-foreground">
            Посмотрите, как быстро и просто запустить продвижение на smm-cat.site — от выбора услуги до старта выполнения.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><Check className="h-4 w-4 text-brand mt-0.5" /> Не нужен пароль от аккаунта</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-brand mt-0.5" /> Оплата в один клик</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-brand mt-0.5" /> Прогресс виден в личном кабинете</li>
          </ul>
          <div className="mt-6">
            <Link to="/order" className="btn-primary text-sm">Оформить заказ</Link>
          </div>
        </div>
        <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/60 bg-gradient-to-br from-brand/20 to-brand-2/20 flex items-center justify-center group cursor-pointer">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]" />
          <div className="relative h-20 w-20 rounded-full bg-background/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition">
            <Play className="h-8 w-8 text-brand fill-current ml-1" />
          </div>
          <span className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/70 px-2 py-1 rounded">
            Демо · 1:12
          </span>
        </div>
      </div>
    </section>
  );
}

/* ============ Blog preview ============ */
const POSTS = [
  { slug: "kak-nakrutit-podpischikov-tiktok", title: "Как накрутить подписчиков в TikTok в 2026 году", excerpt: "Разбираем безопасные методы набора аудитории и работу алгоритмов." },
  { slug: "prodvizhenie-instagram-2026", title: "Продвижение Instagram: что работает сейчас", excerpt: "Reels, охваты, накрутка лайков и подписчиков — свежие тренды." },
  { slug: "telegram-kanal-s-nulya", title: "Как раскрутить Telegram-канал с нуля", excerpt: "Стратегия первых 1000 подписчиков и рост через рекомендации." },
];
export function BlogPreview() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold">Полезные статьи</h2>
          <p className="mt-2 text-muted-foreground">Гайды и советы по продвижению в соцсетях.</p>
        </div>
        <Link to="/nakrutka" className="text-sm text-brand hover:underline">Все материалы →</Link>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {POSTS.map((p) => (
          <article key={p.slug} className="rounded-2xl border border-border/60 bg-card/70 p-6 hover:border-primary/60 transition">
            <BookOpen className="h-6 w-6 text-brand" />
            <h3 className="mt-3 font-bold leading-snug">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
            <span className="mt-4 inline-block text-sm text-brand">Читать →</span>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ============ Comparison ============ */
export function Comparison() {
  const rows = [
    { label: "Запуск заказа за 1–15 минут", us: true, others: false },
    { label: "Работа без пароля от аккаунта", us: true, others: true },
    { label: "Гарантия сохранности подписчиков", us: true, others: false },
    { label: "Поддержка 24/7 на русском", us: true, others: false },
    { label: "Возврат на внутренний баланс", us: true, others: false },
    { label: "Оплата картой РФ и СБП", us: true, others: false },
    { label: "Промокоды и скидки постоянным", us: true, others: false },
  ];
  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-extrabold">Почему smm-cat.site лучше</h2>
        <p className="mt-2 text-muted-foreground">Сравнение с типичными сервисами накрутки.</p>
      </div>
      <div className="mt-8 overflow-hidden rounded-2xl border border-border/60 bg-card/70">
        <div className="grid grid-cols-[1fr_auto_auto] text-sm">
          <div className="px-4 py-3 font-semibold border-b border-border/60">Возможность</div>
          <div className="px-4 py-3 font-semibold text-center border-b border-border/60 text-brand">smm-cat.site</div>
          <div className="px-4 py-3 font-semibold text-center border-b border-border/60 text-muted-foreground">Другие</div>
          {rows.map((r, i) => (
            <div key={i} className="contents">
              <div className="px-4 py-3 border-t border-border/40">{r.label}</div>
              <div className="px-4 py-3 border-t border-border/40 text-center">
                {r.us ? <Check className="inline h-5 w-5 text-emerald-500" /> : <X className="inline h-5 w-5 text-muted-foreground" />}
              </div>
              <div className="px-4 py-3 border-t border-border/40 text-center">
                {r.others ? <Check className="inline h-5 w-5 text-muted-foreground" /> : <X className="inline h-5 w-5 text-muted-foreground/60" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ Support block ============ */
export function SupportBlock() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="rounded-3xl bg-gradient-to-br from-brand to-brand-2 p-8 md:p-12 text-center text-white">
        <MessageCircle className="mx-auto h-12 w-12 opacity-90" />
        <h2 className="mt-4 text-2xl md:text-3xl font-extrabold">Остались вопросы? Мы на связи 24/7</h2>
        <p className="mt-3 max-w-xl mx-auto text-white/90">
          Поможем выбрать услугу, подскажем скорость накрутки и решим любой вопрос по заказу.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white text-brand px-5 py-2.5 font-semibold hover:bg-white/90 transition">
            <Send className="h-4 w-4" /> Telegram
          </a>
          <a href="mailto:support@smm-cat.site" className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/30 text-white px-5 py-2.5 font-semibold hover:bg-white/25 transition">
            <MessageCircle className="h-4 w-4" /> Написать в чат
          </a>
        </div>
      </div>
    </section>
  );
}
