import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { parseSeo } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site-url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { seo } = await getSettings();
  if (!seo.indexSite) return [];
  const pub = { status: "PUBLISHED" as const };
  const [services, projects, articles] = await Promise.all([
    db.service.findMany({ where: pub, select: { slug: true, updatedAt: true, seo: true } }),
    db.project.findMany({ where: pub, select: { slug: true, updatedAt: true, seo: true } }),
    db.article.findMany({ where: pub, select: { slug: true, updatedAt: true, seo: true } }),
  ]).catch(() => [[], [], []] as const);

  const ok = (x: { seo: unknown }) => !parseSeo(x.seo).noindex;
  const entries: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: siteUrl("/servicios"), changeFrequency: "monthly", priority: 0.9 },
    { url: siteUrl("/contacto"), changeFrequency: "yearly", priority: 0.8 },
    { url: siteUrl("/politica-de-privacidad"), changeFrequency: "yearly", priority: 0.2 },
    ...services.filter(ok).map((s) => ({ url: siteUrl(`/servicios/${s.slug}`), lastModified: s.updatedAt, changeFrequency: "monthly" as const, priority: 0.9 })),
  ];
  if (projects.length) {
    entries.push({ url: siteUrl("/proyectos"), changeFrequency: "monthly", priority: 0.6 });
    entries.push(...projects.filter(ok).map((p) => ({ url: siteUrl(`/proyectos/${p.slug}`), lastModified: p.updatedAt, priority: 0.6 })));
  }
  if (articles.length) {
    entries.push({ url: siteUrl("/recursos"), changeFrequency: "weekly", priority: 0.6 });
    entries.push(...articles.filter(ok).map((a) => ({ url: siteUrl(`/recursos/${a.slug}`), lastModified: a.updatedAt, priority: 0.5 })));
  }
  return entries;
}
