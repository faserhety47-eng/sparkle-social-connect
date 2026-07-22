import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Row = {
  id: string;
  location: "header" | "footer";
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
};

export function NavManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loc, setLoc] = useState<"header" | "footer">("header");
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const load = async () => {
    const { data } = await supabase.from("nav_links").select("*").order("location").order("sort_order");
    setRows((data ?? []) as Row[]);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!newLabel.trim() || !newUrl.trim()) return;
    const max = Math.max(0, ...rows.filter((r) => r.location === loc).map((r) => r.sort_order));
    const { error } = await supabase.from("nav_links").insert({
      location: loc, label: newLabel.trim(), url: newUrl.trim(), sort_order: max + 1, is_active: true,
    });
    if (error) return toast.error(error.message);
    setNewLabel(""); setNewUrl("");
    load();
  };
  const update = async (id: string, patch: Partial<Row>) => {
    const { error } = await supabase.from("nav_links").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Удалить пункт?")) return;
    await supabase.from("nav_links").delete().eq("id", id);
    load();
  };

  const filtered = rows.filter((r) => r.location === loc);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex gap-2">
        {(["header", "footer"] as const).map((l) => (
          <button key={l} onClick={() => setLoc(l)}
            className={`rounded-full px-3 py-1.5 text-sm border ${loc === l ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
            {l === "header" ? "Шапка" : "Футер"}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border p-3 flex flex-col md:flex-row gap-2">
        <input className="input flex-1" placeholder="Название" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
        <input className="input flex-1" placeholder="/order  или  /p/about" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
        <button className="btn-primary text-sm" onClick={add}>Добавить</button>
      </div>

      <div className="space-y-2">
        {filtered.map((r) => (
          <div key={r.id} className="rounded-xl border border-border p-3 grid grid-cols-1 md:grid-cols-[1fr_1fr_80px_auto_auto] gap-2 items-center">
            <input className="input" value={r.label} onChange={(e) => setRows(rows.map((x) => x.id === r.id ? { ...x, label: e.target.value } : x))}
              onBlur={(e) => update(r.id, { label: e.target.value })} />
            <input className="input" value={r.url} onChange={(e) => setRows(rows.map((x) => x.id === r.id ? { ...x, url: e.target.value } : x))}
              onBlur={(e) => update(r.id, { url: e.target.value })} />
            <input type="number" className="input" value={r.sort_order}
              onChange={(e) => setRows(rows.map((x) => x.id === r.id ? { ...x, sort_order: +e.target.value } : x))}
              onBlur={(e) => update(r.id, { sort_order: r.sort_order })} />
            <label className="text-sm flex items-center gap-1.5">
              <input type="checkbox" checked={r.is_active} onChange={(e) => update(r.id, { is_active: e.target.checked })} />
              вкл.
            </label>
            <button className="btn-ghost text-xs text-red-500" onClick={() => remove(r.id)}>Удалить</button>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">Пусто.</p>}
      </div>
    </div>
  );
}
