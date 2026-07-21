import { SERVICES, type ServiceCategory } from "@/data/services";
import { BRAND_ICONS } from "@/data/service-icons";
import { Link } from "@tanstack/react-router";

function Tile({ svc }: { svc: ServiceCategory }) {
  const Icon = BRAND_ICONS[svc.id];
  return (
    <Link
      to="/order"
      search={{ platform: svc.id } as never}
      className="service-tile group"
      aria-label={svc.name}
    >
      <div
        className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-md ring-1 ring-white/5"
        style={{ backgroundColor: svc.color }}
      >
        {Icon ? (
          <Icon width={28} height={28} color="#ffffff" />
        ) : (
          <span className="text-white font-bold text-xl">{svc.letter}</span>
        )}
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
