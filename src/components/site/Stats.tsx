import { CalendarDays, BadgeCheck, Heart, Headphones, type LucideIcon } from "lucide-react";

type Stat = {
  value: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  gradient: string;
};

const stats: Stat[] = [
  {
    value: "8+",
    label: "лет на рынке",
    hint: "с 2017 года",
    icon: CalendarDays,
    gradient: "from-sky-400 to-blue-600",
  },
  {
    value: "11.8M+",
    label: "заказов выполнено",
    hint: "успешно",
    icon: BadgeCheck,
    gradient: "from-pink-500 to-rose-600",
  },
  {
    value: "115K+",
    label: "довольных клиентов",
    hint: "рейтинг 4.8/5",
    icon: Heart,
    gradient: "from-emerald-400 to-green-600",
  },
  {
    value: "24/7",
    label: "техподдержка",
    hint: "быстрый ответ",
    icon: Headphones,
    gradient: "from-violet-400 to-purple-600",
  },
];

export function Stats() {
  return (
    <section className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="group rounded-3xl bg-card shadow-tile px-6 py-7 text-center transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div
              className={`mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${s.gradient} text-white shadow-md`}
            >
              <Icon className="h-6 w-6" strokeWidth={2.4} />
            </div>
            <div
              className={`bg-gradient-to-br ${s.gradient} bg-clip-text text-3xl md:text-4xl font-extrabold tracking-tight text-transparent`}
            >
              {s.value}
            </div>
            <div className="mt-1 text-sm font-semibold text-foreground">{s.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
          </div>
        );
      })}
    </section>
  );
}
