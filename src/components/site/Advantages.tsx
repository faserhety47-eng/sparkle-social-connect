import { BadgePercent, ShieldCheck, Headphones, Wallet } from "lucide-react";

const ITEMS = [
  {
    icon: BadgePercent,
    title: "Низкие цены",
    text: "Работаем только с прямыми поставщиками — цена у нас из первых рук, без наценок посредников.",
  },
  {
    icon: ShieldCheck,
    title: "2600+ услуг",
    text: "Огромный каталог по 40+ соцсетям: подписчики, лайки, просмотры, комментарии, реакции и др.",
  },
  {
    icon: Headphones,
    title: "Поддержка 24/7",
    text: "В случае вопросов вы в любое время можете написать в поддержку — ответим в течение 24 часов.",
  },
  {
    icon: Wallet,
    title: "Нет комиссии",
    text: "Все комиссии при пополнении баланса мы взяли на себя. Оплачиваете ровно ту сумму, что видите.",
  },
];

export function Advantages() {
  return (
    <section className="mt-24">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold">Что мы предлагаем</h2>
        <p className="mt-3 text-muted-foreground">Почему пользователи выбирают OzTop Media</p>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((i) => (
          <div key={i.title} className="rounded-3xl bg-card p-6 shadow-tile">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand to-brand-2 flex items-center justify-center shadow-cta">
              <i.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-4 text-lg font-bold">{i.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{i.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
