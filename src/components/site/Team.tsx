const TEAM = [
  { name: "Владислав Медведев", role: "Директор компании", desc: "Стратегия и ключевые решения по продвижению и развитию платформы.", initials: "ВМ", color: "#6366F1" },
  { name: "Алексей Танаев", role: "Старший маркетолог", desc: "Разработка процессов продвижения, улучшение алгоритмов и поведенческих факторов.", initials: "АТ", color: "#EC4899" },
  { name: "Дарья Донская", role: "Клиент-менеджер", desc: "Оптимизация работы с клиентами и взаимодействия с поставщиками услуг.", initials: "ДД", color: "#10B981" },
  { name: "Андрей Устаев", role: "Технический специалист", desc: "Разработка программных решений и безопасность накрутки на платформе.", initials: "АУ", color: "#F59E0B" },
];

export function Team() {
  return (
    <section className="mt-24">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold">Наша команда</h2>
        <p className="mt-3 text-muted-foreground">Руководители подразделений smm-cat.site</p>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TEAM.map((m) => (
          <div key={m.name} className="rounded-3xl bg-card p-6 shadow-tile text-center">
            <div
              className="mx-auto h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-extrabold shadow-cta"
              style={{ background: `linear-gradient(135deg, ${m.color}, #7c3aed)` }}
            >
              {m.initials}
            </div>
            <div className="mt-4 font-bold">{m.name}</div>
            <div className="text-xs uppercase tracking-wider text-primary font-semibold mt-1">{m.role}</div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
