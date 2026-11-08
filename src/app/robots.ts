import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site-url";

export const revalidate = 3600;

/** Valores seguros por defecto: /admin y /api nunca se indexan. Reglas extra administrables. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const { seo } = await getSettings();
  const isProdHost = !!process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : true;
  if (!seo.indexSite || !isProdHost) return { rules: [{ userAgent: "*", disallow: "/" }] };

  const extra: MetadataRoute.Robots["rules"] = [];
  let current: { userAgent: string; allow: string[]; disallow: string[] } | null = null;
  for (const raw of seo.robotsExtra.split("\n")) {
    const line = raw.trim();
    const m = /^(user-agent|allow|disallow)\s*:\s*(\S*)$/i.exec(line);
    if (!m) continue;
    const [, k, v] = m;
    if (k!.toLowerCase() === "user-agent") {
      current = { userAgent: v!, allow: [], disallow: [] };
      extra.push(current);
    } else if (current && v) {
      (k!.toLowerCase() === "allow" ? current.allow : current.disallow).push(v);
    }
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }, ...extra],
    sitemap: siteUrl("/sitemap.xml"),
    host: siteUrl(),
  };
}
