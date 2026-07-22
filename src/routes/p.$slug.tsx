import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/p/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — smm-cat.site` },
      { name: "description", content: "Страница сайта smm-cat.site" },
    ],
  }),
  component: PageView,
});

type Page = {
  slug: string;
  title: string;
  description: string | null;
  content_md: string;
  published: boolean;
  seo_title: string | null;
  seo_description: string | null;
};

function PageView() {
  const { slug } = Route.useParams();
  const [page, setPage] = useState<Page | null | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_pages")
        .select("slug,title,description,content_md,published,seo_title,seo_description")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      setPage(data ?? null);
      if (data?.seo_title) document.title = data.seo_title;
    })();
  }, [slug]);

  if (page === undefined) {
    return <section className="mx-auto max-w-3xl px-4 py-14 text-muted-foreground">Загрузка…</section>;
  }
  if (page === null) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Страница не найдена</h1>
        <p className="mt-3 text-muted-foreground">Возможно, она была удалена или ещё не опубликована.</p>
        <Link to="/" className="btn-primary text-sm mt-6 inline-block">На главную</Link>
      </section>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">{page.title}</h1>
      {page.description ? (
        <p className="mt-4 text-lg text-muted-foreground">{page.description}</p>
      ) : null}
      <div className="prose prose-invert max-w-none mt-8 text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:my-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-primary [&_a]:underline [&_img]:rounded-2xl [&_img]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.content_md}</ReactMarkdown>
      </div>
    </article>
  );
}
