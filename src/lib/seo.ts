import "server-only";
import type { Metadata } from "next";
import { z } from "zod";
import { getSettings } from "./settings";
import { siteUrl } from "./site-url";

export const seoSchema = z.object({
  title: z.string().trim().max(120).optional().default(""),
  description: z.string().trim().max(320).optional().default(""),
  canonical: z
    .string()
    .trim()
    .max(500)
    .optional()
    .default("")
    .refine((v) => !v || v.startsWith("/") || /^https:\/\//.test(v), "Ruta (/…) o URL https://"),
  noindex: z.boolean().optional().default(false),
  ogTitle: z.string().trim().max(120).optional().default(""),
  ogDescription: z.string().trim().max(320).optional().default(""),
  ogImage: z.string().trim().max(500).optional().default(""),
});
export type Seo = z.infer<typeof seoSchema>;

export function parseSeo(v: unknown): Seo {
  const r = seoSchema.safeParse(v ?? {});
  return r.success ? r.data : seoSchema.parse({});
}

/** Construye metadatos de página aplicando valores por defecto globales. */
export async function pageMetadata(opts: {
  path: string;
  title?: string;
  description?: string;
  seo?: unknown;
  image?: string | null;
  type?: "website" | "article";
  absoluteTitle?: boolean;
}): Promise<Metadata> {
  const { seo: g } = await getSettings();
  const s = parseSeo(opts.seo);
  const title = s.title || opts.title || g.defaultTitle;
  const description = s.description || opts.description || g.defaultDescription;
  const canonical = s.canonical ? (s.canonical.startsWith("/") ? siteUrl(s.canonical) : s.canonical) : siteUrl(opts.path);
  const img = s.ogImage || opts.image || g.ogImage || "";
  const ogImages = img ? [{ url: img.startsWith("/") ? siteUrl(img) : img }] : undefined;
  const noindex = s.noindex || !g.indexSite;
  return {
    title: opts.absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: opts.type ?? "website",
      locale: "es_419",
      siteName: g.siteName,
      url: canonical,
      title: s.ogTitle || title,
      description: s.ogDescription || description,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: { card: ogImages ? "summary_large_image" : "summary", title: s.ogTitle || title, description: s.ogDescription || description },
  };
}
