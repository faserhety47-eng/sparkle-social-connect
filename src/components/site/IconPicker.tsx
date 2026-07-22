import { useState } from "react";
import { ICON_LIBRARY, BUILTIN_PREFIX, parseBuiltinIcon } from "@/data/icon-library";

type Props = {
  value: string | null;
  onChange: (iconUrl: string | null, suggestedColor?: string) => void;
};

export function IconPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const current = parseBuiltinIcon(value);
  const filtered = ICON_LIBRARY.filter(
    (i) =>
      !q.trim() ||
      i.label.toLowerCase().includes(q.toLowerCase()) ||
      i.key.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm text-left hover:bg-muted/40"
      >
        {current ? (
          <>
            <span
              className="h-7 w-7 rounded-md flex items-center justify-center shrink-0 overflow-hidden"
              style={{ backgroundColor: current.color }}
            >
              {current.imageUrl ? (
                <img src={current.imageUrl} alt="" className="h-5 w-5 object-contain" />
              ) : current.Icon ? (
                <current.Icon width={16} height={16} color="#ffffff" />
              ) : null}
            </span>
            <span className="flex-1 truncate">{current.label}</span>
            <span
              className="text-xs text-muted-foreground hover:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            >
              очистить
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">Выбрать иконку из библиотеки…</span>
        )}
      </button>
      {open && (
        <div className="mt-2 rounded-xl border border-border bg-card p-3 shadow-lg">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск (telegram, tiktok…)"
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm mb-2"
          />
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
            {filtered.map((i) => {
              const active = current?.key === i.key;
              return (
                <button
                  key={i.key}
                  type="button"
                  onClick={() => {
                    onChange(`${BUILTIN_PREFIX}${i.key}`, i.color);
                    setOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1 rounded-lg p-2 text-[10px] hover:bg-muted/60 ${
                    active ? "ring-2 ring-primary" : ""
                  }`}
                  title={i.label}
                >
                  <span
                    className="h-9 w-9 rounded-md flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: i.color }}
                  >
                    {i.imageUrl ? (
                      <img src={i.imageUrl} alt="" className="h-6 w-6 object-contain" />
                    ) : i.Icon ? (
                      <i.Icon width={20} height={20} color="#ffffff" />
                    ) : null}
                  </span>
                  <span className="truncate w-full text-center">{i.label}</span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full text-xs text-muted-foreground text-center py-4">
                Ничего не найдено
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
