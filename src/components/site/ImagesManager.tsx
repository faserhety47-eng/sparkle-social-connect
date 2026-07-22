import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Item = { name: string; url: string };
const BUCKET = "site-images";
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export function ImagesManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from(BUCKET).list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    if (error) { toast.error(error.message); setLoading(false); return; }
    const files = (data ?? []).filter((f) => f.name && !f.name.endsWith("/"));
    const signed = await Promise.all(files.map(async (f) => {
      const { data: s } = await supabase.storage.from(BUCKET).createSignedUrl(f.name, TEN_YEARS);
      return { name: f.name, url: s?.signedUrl ?? "" };
    }));
    setItems(signed.filter((s) => s.url));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const upload = async (file: File) => {
    const ext = file.name.split(".").pop() ?? "bin";
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(key, file, { contentType: file.type });
    if (error) return toast.error(error.message);
    toast.success("Загружено");
    load();
  };
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) upload(f);
    if (fileRef.current) fileRef.current.value = "";
  };
  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success("Ссылка скопирована — вставьте в редактор как ![alt](ссылка)");
  };
  const remove = async (name: string) => {
    if (!confirm("Удалить файл?")) return;
    const { error } = await supabase.storage.from(BUCKET).remove([name]);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-xl border border-border p-4 flex items-center gap-3">
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="text-sm" />
        <span className="text-xs text-muted-foreground">Загрузите картинку, скопируйте ссылку и вставьте её в редактор страниц как <code>![alt](ссылка)</code></span>
      </div>
      {loading && <p className="text-sm text-muted-foreground">Загрузка…</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((it) => (
          <div key={it.name} className="rounded-xl border border-border p-2 flex flex-col gap-2">
            <img src={it.url} alt={it.name} className="w-full h-32 object-cover rounded-lg bg-muted" />
            <div className="text-xs truncate" title={it.name}>{it.name}</div>
            <div className="flex gap-1">
              <button className="btn-ghost text-xs flex-1" onClick={() => copy(it.url)}>Ссылка</button>
              <button className="btn-ghost text-xs text-red-500" onClick={() => remove(it.name)}>×</button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && <p className="text-sm text-muted-foreground col-span-full">Пока нет изображений.</p>}
      </div>
    </div>
  );
}
