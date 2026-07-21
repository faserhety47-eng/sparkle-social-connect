const stats = [
  { value: "8 лет", label: "Непрерывной работы" },
  { value: "34", label: "Профессионала в команде" },
  { value: "11.8 млн", label: "Заказов успешно выполнено" },
  { value: "115 тыс.", label: "Постоянных клиентов" },
];

export function Stats() {
  return (
    <section className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-3xl bg-card shadow-tile px-6 py-8 text-center"
        >
          <div className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
            {s.value}
          </div>
          <div className="mt-2 text-sm text-muted-foreground font-medium">{s.label}</div>
        </div>
      ))}
    </section>
  );
}
