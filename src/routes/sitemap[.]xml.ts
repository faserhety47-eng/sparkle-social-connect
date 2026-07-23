import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { LANDING_TYPES, LANDING_PLATFORMS } from "@/data/landing-matrix";

const BASE_URL = "https://smm-cat.site";

interface SitemapEntry {
  path: string;
  changefreq?: "weekly" | "monthly" | "daily";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/services", changefreq: "weekly", priority: "0.9" },
          { path: "/order", changefreq: "weekly", priority: "0.9" },
          { path: "/nakrutka", changefreq: "weekly", priority: "0.9" },
          { path: "/tariffs", changefreq: "weekly", priority: "0.7" },
          { path: "/about", changefreq: "monthly", priority: "0.6" },
          { path: "/faq", changefreq: "monthly", priority: "0.6" },
          { path: "/support", changefreq: "monthly", priority: "0.5" },
          { path: "/api", changefreq: "monthly", priority: "0.5" },
          { path: "/privacy-policy", changefreq: "monthly", priority: "0.3" },
          { path: "/terms-of-service", changefreq: "monthly", priority: "0.3" },
          { path: "/public-offer", changefreq: "monthly", priority: "0.3" },
          { path: "/login", changefreq: "monthly", priority: "0.4" },
          { path: "/register", changefreq: "monthly", priority: "0.4" },
        ];

        for (const t of LANDING_TYPES) {
          for (const p of LANDING_PLATFORMS) {
            entries.push({
              path: `/nakrutka/${t.slug}/${p.slug}`,
              changefreq: "weekly",
              priority: "0.8",
            });
          }
        }

        const urls = entries.map((e) => `  <url>
    <loc>${BASE_URL}${e.path}</loc>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
