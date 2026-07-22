import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Page = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content_md: string;
  published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
};

const EMPTY: Omit<Page, "id" | "updated_at"> = {
  slug: "", title: "", description: "", content_md: "", published: true, seo_title: "", seo_description: "",
};

export function PagesManager() {
  const [pages, setPages] = useState<Page[]>([]);
  const [editing, setEditing] = useState<Page | (typeof EMPTY & { id?: string }) | null>(null);
  const [preview, setPreview] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("site_pages").select("*").order("updated_at", { ascending: false });
    setPages((data ?? []) as Page[]);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const slug = editing.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!slug || !editing.title.trim()) { toast.error("Заполните URL и заголовок"); return; }
    const payload = { ...editing, slug };
    if ("id" in editing && editing.id) {
      const { error } = await supabase.from("site_pages").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("site_pages").insert(payload);
      if (error) return toast.error(error.message);
    }
    toast.success("Сохранено");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Удалить страницу?")) return;
    const { error } = await supabase.from("site_pages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Удалено");
    load();
  };

  if (editing) {
    return (
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold">{("id" in editing && editing.id) ? "Редактирование" : "Новая страница"}</h2>
          <div className="flex gap-2">
            <button className="btn-ghost text-sm" onClick={() => setPreview((p) => !p)}>{preview ? "Редактор" : "Предпросмотр"}</button>
            <button className="btn-ghost text-sm" onClick={() => setEditing(null)}>Отмена</button>
            <button className="btn-primary text-sm" onClick={save}>Сохранить</button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="text-muted-foreground">URL (после /p/)</span>
            <input className="input mt-1 w-full" placeholder="about-us" value={editing.slug}
              onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Заголовок</span>
            <input className="input mt-1 w-full" value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          </label>
          <label className="text-sm md:col-span-2">
            <span className="text-muted-foreground">Краткое описание (под заголовком)</span>
            <input className="input mt-1 w-full" value={editing.description ?? ""}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">SEO title</span>
            <input className="input mt-1 w-full" value={editing.seo_title ?? ""}
              onChange={(e) => setEditing({ ...editing, seo_title: e.target.value })} />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">SEO description</span>
            <input className="input mt-1 w-full" value={editing.seo_description ?? ""}
              onChange={(e) => setEditing({ ...editing, seo_description: e.target.value })} />
          </label>
          <label className="text-sm flex items-center gap-2 md:col-span-2">
            <input type="checkbox" checked={editing.published}
              onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
            Опубликована
          </label>
        </div>

        {preview ? (
          <div className="rounded-2xl border border-border p-4 min-h-[300px] prose prose-invert max-w-none [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-xl [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:text-primary [&_img]:rounded-xl [&_img]:my-3">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{editing.content_md || "*Пусто*"}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            className="input w-full font-mono text-sm min-h-[400px]"
            placeholder={"# Заголовок\n\nТекст абзаца.\n\n![alt](URL картинки из вкладки Изображения)\n\n- пункт списка\n- ещё пункт\n\n[Ссылка](https://example.com)"}
            value={editing.content_md}
            onChange={(e) => setEditing({ ...editing, content_md: e.target.value })}
          />
        )}
        <p className="text-xs text-muted-foreground">
          Поддерживается Markdown: <code>#</code> заголовки, <code>**жирный**</code>, <code>*курсив*</code>, списки, ссылки <code>[текст](url)</code>, картинки <code>![alt](url)</code>. Ссылки на картинки берите из вкладки «Изображения».
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Страницы доступны по адресу <code>/p/URL</code>. Добавьте ссылку в меню на вкладке «Меню».</p>
        <button className="btn-primary text-sm" onClick={() => setEditing({ ...EMPTY })}>+ Новая страница</button>
      </div>
      <div className="mt-4 space-y-2">
        {pages.length === 0 && <p className="text-sm text-muted-foreground">Пока нет страниц.</p>}
        {pages.map((p) => (
          <div key={p.id} className="rounded-xl border border-border p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold truncate">{p.title} <span className={`ml-2 text-xs ${p.published ? "text-emerald-500" : "text-amber-500"}`}>{p.published ? "опубликована" : "черновик"}</span></div>
              <div className="text-xs text-muted-foreground truncate">/p/{p.slug}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" className="btn-ghost text-xs">Открыть</a>
              <button className="btn-ghost text-xs" onClick={() => setEditing(p)}>Редактировать</button>
              <button className="btn-ghost text-xs text-red-500" onClick={() => remove(p.id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
