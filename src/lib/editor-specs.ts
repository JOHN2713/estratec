/** Especificaciones de formularios del panel (seguras para el cliente). */
export type FieldSpec =
  | { key: string; label: string; type: "text" | "textarea" | "markdown" | "email" | "url"; hint?: string; max?: number; rows?: number }
  | { key: string; label: string; type: "bool"; hint?: string }
  | { key: string; label: string; type: "lines"; hint?: string; max?: number }
  | { key: string; label: string; type: "service"; hint?: string }
  | { key: string; label: string; type: "select"; hint?: string; options: { value: string; label: string }[] }
  | { key: string; label: string; type: "number"; hint?: string; min?: number; max?: number }
  | { key: string; label: string; type: "seo"; hint?: string; basePath: string; slugKey: string; titleKey: string; descKey: string }
  | { key: string; label: string; type: "services"; hint?: string }
  | { key: string; label: string; type: "group"; hint?: string; fields: FieldSpec[] }
  | { key: string; label: string; type: "list"; hint?: string; itemLabel: string; fields: FieldSpec[]; max?: number };

const item = (extra: FieldSpec[] = []): FieldSpec[] => [
  { key: "title", label: "Título", type: "text", max: 120 },
  { key: "text", label: "Texto", type: "textarea", max: 600, rows: 2 },
  ...extra,
];

export const HOME_SPEC: FieldSpec[] = [
  {
    key: "hero", label: "Hero (primer pantallazo)", type: "group",
    fields: [
      { key: "eyebrow", label: "Etiqueta superior", type: "text", max: 120 },
      { key: "title", label: "Titular (H1)", type: "text", max: 160, hint: "Alternativa sugerida para pruebas A/B: “Tecnología que conecta ideas, optimiza procesos y acelera negocios.”" },
      { key: "subtitle", label: "Subtítulo", type: "textarea", max: 600, rows: 3 },
      { key: "ctaPrimary", label: "CTA principal", type: "text", max: 60 },
      { key: "ctaSecondary", label: "CTA secundario", type: "text", max: 60 },
      { key: "coreLabels", label: "Módulos del núcleo visual", type: "lines", hint: "Uno por línea (máx. 6, textos cortos).", max: 6 },
    ],
  },
  { key: "capabilities", label: "Franja de capacidades", type: "lines", hint: "Una capacidad por línea.", max: 10 },
  {
    key: "problems", label: "Problemas que ayudamos a resolver", type: "group",
    fields: [
      { key: "title", label: "Título", type: "text", max: 160 },
      { key: "intro", label: "Introducción", type: "textarea", max: 500, rows: 2 },
      { key: "items", label: "Situaciones", type: "list", itemLabel: "Situación", max: 10, fields: item([{ key: "serviceSlugs", label: "Servicios relacionados", type: "services" }]) },
    ],
  },
  {
    key: "services", label: "Sección de servicios", type: "group",
    fields: [
      { key: "eyebrow", label: "Etiqueta", type: "text", max: 60 },
      { key: "title", label: "Título", type: "text", max: 160 },
      { key: "intro", label: "Introducción", type: "textarea", max: 500, rows: 2 },
    ],
  },
  {
    key: "objectives", label: "Soluciones por objetivo", type: "group",
    fields: [
      { key: "eyebrow", label: "Etiqueta", type: "text", max: 60 },
      { key: "title", label: "Título", type: "text", max: 160 },
      { key: "intro", label: "Introducción", type: "textarea", max: 500, rows: 2 },
      { key: "items", label: "Objetivos", type: "list", itemLabel: "Objetivo", max: 8, fields: item([{ key: "serviceSlug", label: "Servicio al que enlaza", type: "service" }]) },
    ],
  },
  {
    key: "process", label: "Cómo trabajamos", type: "group",
    fields: [
      { key: "eyebrow", label: "Etiqueta", type: "text", max: 60 },
      { key: "title", label: "Título", type: "text", max: 160 },
      { key: "intro", label: "Introducción", type: "textarea", max: 500, rows: 2 },
      { key: "note", label: "Nota al pie", type: "text", max: 300 },
      { key: "steps", label: "Etapas", type: "list", itemLabel: "Etapa", max: 8, hint: "Con 6 etapas se muestra el ciclo visual completo.", fields: item() },
    ],
  },
  {
    key: "projects", label: "Proyectos", type: "group",
    fields: [
      { key: "eyebrow", label: "Etiqueta", type: "text", max: 60 },
      { key: "title", label: "Título (con proyectos publicados)", type: "text", max: 160 },
      { key: "intro", label: "Introducción", type: "textarea", max: 500, rows: 2 },
      { key: "emptyTitle", label: "Título sin proyectos publicados", type: "text", max: 160 },
      { key: "emptyText", label: "Texto sin proyectos publicados", type: "textarea", max: 500, rows: 2 },
    ],
  },
  {
    key: "why", label: "¿Por qué Estratec? / Nosotros", type: "group",
    fields: [
      { key: "eyebrow", label: "Etiqueta", type: "text", max: 60 },
      { key: "title", label: "Título", type: "text", max: 160 },
      { key: "intro", label: "Introducción", type: "textarea", max: 600, rows: 3 },
      { key: "items", label: "Mensajes", type: "list", itemLabel: "Mensaje", max: 8, fields: item() },
    ],
  },
  {
    key: "faq", label: "Encabezado de preguntas frecuentes", type: "group",
    hint: "Las preguntas se administran en “Preguntas frecuentes”.",
    fields: [
      { key: "eyebrow", label: "Etiqueta", type: "text", max: 60 },
      { key: "title", label: "Título", type: "text", max: 160 },
      { key: "intro", label: "Introducción", type: "textarea", max: 500, rows: 2 },
    ],
  },
  {
    key: "closing", label: "CTA de cierre", type: "group",
    fields: [
      { key: "title", label: "Titular", type: "text", max: 160 },
      { key: "text", label: "Texto", type: "textarea", max: 500, rows: 2 },
      { key: "ctaPrimary", label: "Botón principal", type: "text", max: 60 },
      { key: "ctaWhatsapp", label: "Botón WhatsApp", type: "text", max: 60 },
    ],
  },
];

export const PRIVACY_SPEC: FieldSpec[] = [
  { key: "title", label: "Título", type: "text", max: 160 },
  { key: "version", label: "Versión", type: "text", max: 20, hint: "Se registra con cada aceptación del formulario. Cámbiala al publicar una nueva versión (p. ej. 1.0)." },
  { key: "updated", label: "Fecha de actualización (texto)", type: "text", max: 40 },
  { key: "body", label: "Contenido (Markdown)", type: "markdown", rows: 22 },
];

export const TERMS_SPEC: FieldSpec[] = [
  { key: "enabled", label: "Publicar términos de uso", type: "bool", hint: "Si está activo y tiene contenido, aparece el enlace en el footer." },
  { key: "title", label: "Título", type: "text", max: 160 },
  { key: "updated", label: "Fecha de actualización (texto)", type: "text", max: 40 },
  { key: "body", label: "Contenido (Markdown)", type: "markdown", rows: 18 },
];

export const SETTING_SPECS: Record<string, { title: string; description?: string; fields: FieldSpec[] }> = {
  contact: {
    title: "Contacto",
    description: "El número se normaliza automáticamente (solo dígitos) para los enlaces wa.me.",
    fields: [
      { key: "whatsappNumber", label: "Número de WhatsApp (con código de país)", type: "text", max: 20, hint: "Ej.: 593999774777" },
      { key: "whatsappDisplay", label: "Número visible", type: "text", max: 40 },
      { key: "email", label: "Correo de contacto (público)", type: "email" },
      { key: "leadsRecipient", label: "Correo que recibe las solicitudes", type: "email" },
      { key: "businessHours", label: "Horario de atención", type: "text", max: 200, hint: "Ej.: Lunes a viernes, 9:00 – 18:00 (hora de Ecuador, GMT-5). Vacío = no se muestra." },
      { key: "hoursNote", label: "Texto informativo del horario", type: "text", max: 300 },
    ],
  },
  social: {
    title: "Redes sociales",
    fields: [
      { key: "instagramHandle", label: "Instagram (usuario)", type: "text", max: 60 },
      { key: "instagramUrl", label: "Instagram (URL)", type: "url" },
      { key: "tiktokHandle", label: "TikTok (usuario)", type: "text", max: 60 },
      { key: "tiktokUrl", label: "TikTok (URL)", type: "url" },
    ],
  },
  cta: {
    title: "CTA y formularios",
    description: "Los textos prellenados de WhatsApp por servicio se editan en cada servicio.",
    fields: [
      { key: "whatsappGeneralText", label: "Texto general de WhatsApp", type: "textarea", max: 500, rows: 2 },
      { key: "whatsappEnabled", label: "Mostrar botones de WhatsApp", type: "bool" },
      { key: "floatingWhatsapp", label: "Mostrar botón flotante de WhatsApp", type: "bool" },
      { key: "formEnabled", label: "Formulario de solicitud activo", type: "bool" },
      { key: "formDisabledText", label: "Mensaje cuando el formulario está desactivado", type: "textarea", max: 300, rows: 2 },
    ],
  },
  emails: {
    title: "Correos automáticos",
    description:
      "Variables: {nombre} {correo} {telefono} {empresa} {servicio} {preferencia} {horario} {pais} {mensaje} {url_origen} {fecha} {whatsapp}. Usa **texto** para negritas. La confirmación al prospecto solo confirma la recepción, nunca una cita.",
    fields: [
      { key: "notifySubject", label: "Notificación a Estratec — asunto", type: "text", max: 200 },
      { key: "notifyBody", label: "Notificación a Estratec — cuerpo", type: "textarea", max: 4000, rows: 14 },
      { key: "confirmEnabled", label: "Enviar correo de recepción al prospecto", type: "bool" },
      { key: "confirmSubject", label: "Recepción al prospecto — asunto", type: "text", max: 200 },
      { key: "confirmBody", label: "Recepción al prospecto — cuerpo", type: "textarea", max: 4000, rows: 14 },
    ],
  },
  crmTemplates: {
    title: "Plantillas del CRM",
    description: "Para responder solicitudes y confirmar citas manualmente. Variables: las de los correos más {agente} y {cita}.",
    fields: [
      {
        key: "templates", label: "Plantillas", type: "list", itemLabel: "Plantilla", max: 30,
        fields: [
          { key: "id", label: "Identificador", type: "text", max: 40, hint: "minúsculas-y-guiones" },
          { key: "name", label: "Nombre", type: "text", max: 80 },
          { key: "subject", label: "Asunto (correo)", type: "text", max: 200 },
          { key: "body", label: "Mensaje", type: "textarea", max: 4000, rows: 8 },
        ],
      },
    ],
  },
  org: {
    title: "Organización",
    description: "Se usa en el footer, los datos estructurados (JSON-LD) y llms.txt.",
    fields: [
      { key: "legalName", label: "Razón social", type: "text", max: 160, hint: "Pendiente de confirmar. Vacío = se muestra “Estratec”." },
      { key: "shortDescription", label: "Descripción corta", type: "textarea", max: 400, rows: 3 },
      { key: "longDescription", label: "Descripción ampliada (GEO)", type: "textarea", max: 1500, rows: 5 },
      { key: "areaServed", label: "Área atendida", type: "text", max: 120 },
    ],
  },
  seo: {
    title: "SEO global",
    fields: [
      { key: "siteName", label: "Nombre del sitio", type: "text", max: 80 },
      { key: "titleTemplate", label: "Plantilla de títulos", type: "text", max: 80, hint: "%s se reemplaza por el título de cada página." },
      { key: "defaultTitle", label: "Meta title por defecto (inicio)", type: "text", max: 120 },
      { key: "defaultDescription", label: "Meta description por defecto", type: "textarea", max: 300, rows: 3 },
      { key: "ogImage", label: "Imagen Open Graph por defecto", type: "text", max: 500, hint: "Ruta (/assets/…) o URL https:// de 1200×630 px." },
      { key: "indexSite", label: "Permitir indexación del sitio", type: "bool", hint: "Desactívalo solo en entornos de prueba." },
      { key: "market", label: "Mercado prioritario", type: "text", max: 120 },
      { key: "regionalTerms", label: "Términos de búsqueda regionales", type: "lines", hint: "Referencia para redactar contenidos. No crea páginas locales." },
      { key: "robotsExtra", label: "Reglas adicionales de robots.txt", type: "textarea", max: 2000, rows: 4, hint: "Formato: User-agent / Allow / Disallow. /admin y /api siempre están bloqueados." },
      { key: "llmsEnabled", label: "Publicar /llms.txt (experimental)", type: "bool" },
    ],
  },
  analytics: {
    title: "Analítica y verificación",
    description: "Los eventos de conversión nunca incluyen nombre, correo, teléfono ni mensajes.",
    fields: [
      { key: "ga4Id", label: "GA4 Measurement ID", type: "text", max: 20, hint: "G-XXXXXXXXXX" },
      { key: "gtmId", label: "Google Tag Manager Container ID (opcional)", type: "text", max: 20, hint: "Si se define, se carga GTM en lugar de gtag directo." },
      { key: "gscVerification", label: "Google Search Console — código de verificación", type: "text", max: 120, hint: "Solo el valor content de la etiqueta meta." },
      { key: "requireConsent", label: "Exigir consentimiento antes de cargar analítica", type: "bool" },
    ],
  },
};
