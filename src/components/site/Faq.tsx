import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type FaqItem = { q: string; a: string };

export const DEFAULT_FAQ: FaqItem[] = [
  {
    q: "Сколько стоит накрутка подписчиков?",
    a: "Стоимость услуг вы можете посмотреть в разделе «Услуги», выбрав нужную социальную сеть и категорию — цены начинаются от 0.05 ₽ за единицу.",
  },
  {
    q: "Как купить подписчиков в нужную социальную сеть?",
    a: "В главном меню выберите нужную соцсеть, укажите категорию «Подписчики», затем выберите понравившуюся услугу и оформите заказ.",
  },
  {
    q: "Как долго происходит накрутка?",
    a: "Большинство услуг запускаются в течение 15 минут. Иногда возможны задержки при большом спросе. Максимальный срок запуска — до 7 дней.",
  },
  {
    q: "Могут ли заблокировать аккаунт за накрутку?",
    a: "Алгоритмы smm-cat.site контролируют скорость и качество накрутки, чтобы не вызывать подозрений со стороны соцсетей. Мы стараемся делать накрутку предельно безопасной.",
  },
  {
    q: "Нужна ли регистрация для заказа?",
    a: "Нет. Регистрация не требуется — вы можете оформить заказ\u00a0 сразу с главной страницы.",
  },
  {
    q: "Есть ли API для реселлеров?",
    a: "Да, у нас полноценное REST-API: получение списка услуг, создание заказов, проверка статусов и баланса. Документация — в разделе API.",
  },
];

export function Faq({ items = DEFAULT_FAQ }: { items?: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mt-24">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold">F.A.Q. — частые вопросы</h2>
        <p className="mt-3 text-muted-foreground">Ответы на вопросы, которые пользователи задают чаще всего</p>
      </div>

      <div className="mt-10 mx-auto max-w-3xl space-y-3">
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="rounded-2xl bg-card shadow-tile overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-semibold">{it.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180 text-primary" : ""}`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{it.a}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
