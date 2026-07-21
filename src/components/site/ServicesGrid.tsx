import { SERVICES, type ServiceCategory } from "@/data/services";
import { Link } from "@tanstack/react-router";

function Tile({ svc }: { svc: ServiceCategory }) {
  return (
    <Link
      to="/order"
      search={{ platform: svc.id } as never}
      className="service-tile group"
      aria-label={svc.name}
    >
      <div
        className="h-14 w-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md"
        style={{ backgroundColor: svc.color }}
      >
        {svc.emoji ?? svc.letter}
      </div>
      <div className="text-sm font-semibold text-center text-foreground leading-tight mt-1">
        {svc.name}
      </div>
      <div className="text-[11px] text-muted-foreground text-center leading-snug px-1">
        {svc.description ?? "Продвижение"}
      </div>
    </Link>
  );
}

export function ServicesGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-3">
      {SERVICES.map((s) => (
        <Tile key={s.id} svc={s} />
      ))}
    </div>
  );
}
