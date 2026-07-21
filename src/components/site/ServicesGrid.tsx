import { Link } from "@tanstack/react-router";
import { BRAND_ICONS } from "@/data/service-icons";
import { parseBuiltinIcon } from "@/data/icon-library";
import { usePlatforms, type Platform } from "@/hooks/usePlatforms";

function Tile({ svc }: { svc: Platform }) {
  const builtin = parseBuiltinIcon(svc.icon_url);
  const Icon = BRAND_ICONS[svc.id];
  const hasImg = !builtin && !!svc.icon_url;
  return (
    <Link
      to="/order"
      search={{ platform: svc.id } as never}
      className="service-tile group"
      aria-label={svc.name}
    >
      <div
        className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-md ring-1 ring-white/5 overflow-hidden"
        style={{ backgroundColor: svc.color || "#7B4FFF" }}
      >
        {builtin ? (
          <builtin.Icon width={28} height={28} color="#ffffff" />
        ) : hasImg ? (
          <img src={svc.icon_url!} alt="" className="h-8 w-8 object-contain" />
        ) : svc.icon_emoji ? (
          <span className="text-2xl">{svc.icon_emoji}</span>
        ) : Icon ? (
          <Icon width={28} height={28} color="#ffffff" />
        ) : (
          <span className="text-white font-bold text-xl">{svc.letter ?? svc.name.slice(0, 1)}</span>
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
  const { platforms, loading } = usePlatforms({ onlyActive: true });
  if (loading) {
    return <div className="text-center text-muted-foreground py-10">Загрузка…</div>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {platforms.map((s) => (
        <Tile key={s.id} svc={s} />
      ))}
    </div>
  );
}
