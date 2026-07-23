import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";

type Page = {
  slug: string;
  title: string;
  description: string | null;
  content_md: string;
  published: boolean;
  seo_title: string | null;
  seo_description: string | null;
};

function clampDesc(s: string): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= 160) return t;
  return t.slice(0, 157).trimEnd() + "…";
}

export const Route = createFileRoute("/p/$slug")({
  loader: async ({ params }): Promise<Page> => {
    const { data } = await supabase
      .from("site_pages")
      .select("slug,title,description,content_md,published,seo_title,seo_description")
      .eq("slug", params.slug)
      .eq("published", true)
      .maybeSingle();
    if (!data) throw notFound();
    return data as Page;
  },
  head: ({ params, loaderData }) => {
    const url = `https://smm-cat.site/p/${params.slug}`;
    const title = loaderData?.seo_title || loaderData?.title || `Страница — smm-cat.site`;
    const rawDesc =
      loaderData?.seo_description ||
      loaderData?.description ||
      (loaderData?.content_md ? loaderData.content_md.replace(/[#>*_`\[\]()!-]/g, " ") : "") ||
      "Страница сайта smm-cat.site";
    const description = clampDesc(rawDesc);
    return {
      meta: [
        { title: `${title} — smm-cat.site` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: PageView,
  notFoundComponent: () => (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">Страница не найдена</h1>
      <p className="mt-3 text-muted-foreground">Возможно, она была удалена или ещё не опубликована.</p>
      <Link to="/" className="btn-primary text-sm mt-6 inline-block">На главную</Link>
    </section>
  ),
});

function PageView() {
  const page = Route.useLoaderData();
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
