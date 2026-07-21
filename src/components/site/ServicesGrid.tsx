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
        className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md"
        style={{ backgroundColor: svc.color }}
      >
        {svc.emoji ?? svc.letter}
      </div>
      <div className="text-xs font-medium text-center text-foreground/80 leading-tight">
        {svc.name}
      </div>
    </Link>
  );
}

export function ServicesGrid() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-11 gap-3">
      {SERVICES.map((s) => (
        <Tile key={s.id} svc={s} />
      ))}
    </div>
  );
}
