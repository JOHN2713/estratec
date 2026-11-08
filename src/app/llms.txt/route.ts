import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site-url";

export const revalidate = 3600;

/** llms.txt informativo (complemento experimental de GEO; no sustituye el SEO). */
export async function GET() {
  const s = await getSettings();
  if (!s.seo.llmsEnabled) return new Response("Not found", { status: 404 });
  const services = await db.service
    .findMany({ where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, select: { slug: true, name: true, summary: true } })
    .catch(() => []);
  const faqs = await db.faq
    .findMany({ where: { status: "PUBLISHED", showOnHome: true }, orderBy: { order: "asc" }, select: { question: true, answer: true } })
    .catch(() => []);
  const lines = [
    "# Estratec",
    "",
    `> ${s.org.shortDescription}`,
    "",
    s.org.longDescription,
    "",
    `Cobertura: ${s.org.areaServed}. Idioma: español.`,
    "",
    "## Servicios",
    ...services.map((x) => `- [${x.name}](${siteUrl(`/servicios/${x.slug}`)}): ${x.summary}`),
    "",
    "## Preguntas frecuentes",
    ...faqs.map((f) => `- ${f.question} ${f.answer}`),
    "",
    "## Contacto",
    `- Formulario: ${siteUrl("/contacto")}`,
    `- WhatsApp: +${s.contact.whatsappNumber}`,
    `- Correo: ${s.contact.email}`,
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
