import type { FieldSpec } from "./editor-specs";

export type Kind = "service" | "faq" | "project" | "article" | "redirect";

const STATUS: FieldSpec = {
  key: "status",
  label: "Estado",
  type: "select",
  options: [
    { value: "DRAFT", label: "Borrador (no visible)" },
    { value: "PUBLISHED", label: "Publicado" },
  ],
  hint: "Los borradores se pueden revisar con “Vista previa”.",
};
const SLUG = (hint: string): FieldSpec => ({ key: "slug", label: "Slug (URL)", type: "text", max: 120, hint });
const IMG: FieldSpec[] = [
  { key: "image", label: "Imagen (ruta o URL https)", type: "text", max: 500, hint: "Se sirve automáticamente en AVIF/WebP con tamaños responsive." },
  { key: "imageAlt", label: "Texto alternativo de la imagen", type: "text", max: 200, hint: "Describe la imagen para lectores de pantalla y buscadores." },
];

export function serviceSpec(icons: string[]): FieldSpec[] {
  return [
    STATUS,
    { key: "name", label: "Nombre del servicio", type: "text", max: 120 },
    { key: "shortName", label: "Nombre corto (menús y etiquetas)", type: "text", max: 60 },
    SLUG("Ej.: software-a-medida. Si cambias el slug de un servicio publicado se crea una redirección 301."),
    { key: "icon", label: "Ícono", type: "select", options: icons.map((i) => ({ value: i, label: i })) },
    { key: "order", label: "Orden", type: "number", min: 0, max: 999 },
    { key: "summary", label: "Resumen (tarjeta)", type: "textarea", max: 400, rows: 2 },
    { key: "h1", label: "Encabezado H1 de la página", type: "text", max: 160 },
    { key: "intro", label: "Introducción: qué es", type: "textarea", max: 1200, rows: 3 },
    { key: "problem", label: "Problema que resuelve", type: "textarea", max: 3000, rows: 4 },
    { key: "includes", label: "Qué incluye", type: "lines", hint: "Un punto por línea." },
    { key: "solutions", label: "Posibles soluciones", type: "lines", hint: "Una por línea." },
    { key: "deliverables", label: "Entregables", type: "lines", hint: "Uno por línea." },
    { key: "forWho", label: "Para quién es", type: "textarea", max: 1500, rows: 2 },
    { key: "ctaLabel", label: "Texto del CTA", type: "text", max: 100 },
    { key: "whatsappText", label: "Mensaje prellenado de WhatsApp", type: "textarea", max: 500, rows: 2 },
    ...IMG,
    { key: "seo", label: "SEO", type: "seo", basePath: "/servicios", slugKey: "slug", titleKey: "h1", descKey: "summary" },
  ];
}

export function faqSpec(services: { id: string; name: string }[]): FieldSpec[] {
  return [
    STATUS,
    { key: "question", label: "Pregunta", type: "text", max: 300, hint: "Redáctala como la formularía un potencial cliente." },
    { key: "answer", label: "Respuesta", type: "textarea", max: 3000, rows: 5, hint: "Empieza con la respuesta directa y luego amplía. Evita precios, plazos o garantías generales." },
    {
      key: "serviceId",
      label: "Servicio relacionado",
      type: "select",
      options: [{ value: "", label: "General (sin servicio)" }, ...services.map((s) => ({ value: s.id, label: s.name }))],
      hint: "Se muestra también en la página del servicio.",
    },
    { key: "showOnHome", label: "Mostrar en la página de inicio", type: "bool" },
    { key: "order", label: "Orden", type: "number", min: 0, max: 999 },
  ];
}

export const PROJECT_SPEC: FieldSpec[] = [
  STATUS,
  { key: "title", label: "Nombre del proyecto", type: "text", max: 160 },
  SLUG("Ej.: plataforma-reservas-clinica"),
  { key: "client", label: "Cliente", type: "text", max: 160, hint: "Solo si existe autorización para publicarlo." },
  { key: "sector", label: "Sector o tipo de organización", type: "text", max: 120 },
  { key: "summary", label: "Resumen (tarjeta)", type: "textarea", max: 400, rows: 2 },
  { key: "challenge", label: "Reto o necesidad (Markdown)", type: "markdown", max: 3000, rows: 5 },
  { key: "solution", label: "Solución implementada (Markdown)", type: "markdown", max: 3000, rows: 5 },
  { key: "tech", label: "Tecnologías o integraciones", type: "lines", hint: "Una por línea." },
  { key: "results", label: "Resultados (Markdown)", type: "markdown", max: 2000, rows: 4, hint: "Solo resultados documentados y autorizados." },
  ...IMG,
  { key: "videoUrl", label: "Video (YouTube o Vimeo)", type: "text", max: 500 },
  { key: "repoUrl", label: "Repositorio público (GitHub)", type: "text", max: 500 },
  { key: "order", label: "Orden", type: "number", min: 0, max: 999 },
  { key: "seo", label: "SEO", type: "seo", basePath: "/proyectos", slugKey: "slug", titleKey: "title", descKey: "summary" },
];

export const ARTICLE_SPEC: FieldSpec[] = [
  STATUS,
  { key: "title", label: "Título (H1)", type: "text", max: 180 },
  SLUG("Ej.: como-elegir-un-crm"),
  { key: "excerpt", label: "Extracto", type: "textarea", max: 400, rows: 2 },
  { key: "author", label: "Autor", type: "text", max: 120, hint: "Opcional. Usa perfiles reales y aprobados." },
  { key: "body", label: "Contenido (Markdown)", type: "markdown", rows: 22, hint: "Usa ## y ### para la estructura. Responde primero de forma directa (AEO)." },
  ...IMG,
  { key: "seo", label: "SEO", type: "seo", basePath: "/recursos", slugKey: "slug", titleKey: "title", descKey: "excerpt" },
];

export const REDIRECT_SPEC: FieldSpec[] = [
  { key: "from", label: "Desde (ruta antigua)", type: "text", max: 300, hint: "Ej.: /servicios/crm" },
  { key: "to", label: "Hacia (ruta nueva o URL https)", type: "text", max: 500, hint: "Ej.: /servicios/implementacion-crm-kommo-gohighlevel" },
  { key: "permanent", label: "Permanente (301)", type: "bool", hint: "Desmárcalo solo para redirecciones temporales (302)." },
];

export const KIND_META: Record<Kind, { label: string; plural: string; base: string; publicBase?: string }> = {
  service: { label: "servicio", plural: "Servicios", base: "/admin/servicios", publicBase: "/servicios" },
  faq: { label: "pregunta", plural: "Preguntas frecuentes", base: "/admin/faqs" },
  project: { label: "proyecto", plural: "Proyectos", base: "/admin/proyectos", publicBase: "/proyectos" },
  article: { label: "artículo", plural: "Recursos", base: "/admin/recursos", publicBase: "/recursos" },
  redirect: { label: "redirección", plural: "Redirecciones", base: "/admin/redirecciones" },
};
