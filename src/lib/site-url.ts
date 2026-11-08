/** URL pública del sitio, segura para usar en metadatos (servidor). */
export function siteUrl(path = ""): string {
  const base = (process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
  return path ? `${base}${path.startsWith("/") ? path : `/${path}`}` : base;
}
