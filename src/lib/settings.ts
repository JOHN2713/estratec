import "server-only";
import { cache } from "react";
import { z } from "zod";
import { db } from "./db";

const str = (max: number) => z.string().trim().max(max);
const url = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https:\/\/[^\s]+$/i.test(v), "Debe ser una URL https:// válida");

// ───────────────────────────── Esquemas ─────────────────────────────

export const settingSchemas = {
  contact: z.object({
    whatsappNumber: z
      .string()
      .trim()
      .transform((v) => v.replace(/\D/g, ""))
      .pipe(z.string().min(8, "Número inválido").max(15, "Número inválido")),
    whatsappDisplay: str(40),
    email: z.email("Correo inválido").max(160),
    leadsRecipient: z.email("Correo inválido").max(160),
    businessHours: str(200),
    hoursNote: str(300),
  }),
  social: z.object({
    instagramHandle: str(60),
    instagramUrl: url,
    tiktokHandle: str(60),
    tiktokUrl: url,
  }),
  cta: z.object({
    whatsappGeneralText: str(500).min(1),
    whatsappEnabled: z.boolean(),
    floatingWhatsapp: z.boolean(),
    formEnabled: z.boolean(),
    formDisabledText: str(300),
  }),
  emails: z.object({
    notifySubject: str(200).min(1),
    notifyBody: str(4000).min(1),
    confirmEnabled: z.boolean(),
    confirmSubject: str(200).min(1),
    confirmBody: str(4000).min(1),
  }),
  crmTemplates: z.object({
    templates: z
      .array(
        z.object({
          id: z.string().trim().regex(/^[a-z0-9-]{1,40}$/, "Id: minúsculas, números y guiones"),
          name: str(80).min(1),
          subject: str(200),
          body: str(4000).min(1),
        }),
      )
      .max(30),
  }),
  analytics: z.object({
    ga4Id: z
      .string()
      .trim()
      .refine((v) => v === "" || /^G-[A-Z0-9]{4,16}$/.test(v), "Formato G-XXXXXXX"),
    gtmId: z
      .string()
      .trim()
      .refine((v) => v === "" || /^GTM-[A-Z0-9]{4,12}$/.test(v), "Formato GTM-XXXXXX"),
    gscVerification: z
      .string()
      .trim()
      .max(120)
      .refine((v) => v === "" || /^[A-Za-z0-9_-]+$/.test(v), "Solo el código de verificación (content)"),
    requireConsent: z.boolean(),
  }),
  seo: z.object({
    siteName: str(80).min(1),
    titleTemplate: str(80).refine((v) => v.includes("%s"), "Debe incluir %s"),
    defaultTitle: str(120).min(1),
    defaultDescription: str(300).min(1),
    ogImage: z.string().trim().max(500),
    indexSite: z.boolean(),
    market: str(120),
    regionalTerms: z.array(str(80)).max(40),
    robotsExtra: str(2000),
    llmsEnabled: z.boolean(),
  }),
  org: z.object({
    legalName: str(160),
    shortDescription: str(400).min(1),
    longDescription: str(1500),
    areaServed: str(120),
  }),
} as const;

export type SettingKey = keyof typeof settingSchemas;
export type Settings = { [K in SettingKey]: z.infer<(typeof settingSchemas)[K]> };

// ───────────────────────────── Valores por defecto ─────────────────────────────

export const settingDefaults: Settings = {
  contact: {
    whatsappNumber: "593999774777",
    whatsappDisplay: "+593 99 977 4777",
    email: "estratecorg2025@gmail.com",
    leadsRecipient: "estratecorg2025@gmail.com",
    businessHours: "",
    hoursNote: "",
  },
  social: {
    instagramHandle: "@estratekia.ec",
    instagramUrl: "https://www.instagram.com/estratekia.ec/",
    tiktokHandle: "@estratekia",
    tiktokUrl: "https://www.tiktok.com/@estratekia",
  },
  cta: {
    whatsappGeneralText: "Hola, Estratec. Quisiera conversar sobre un reto tecnológico de mi negocio.",
    whatsappEnabled: true,
    floatingWhatsapp: true,
    formEnabled: true,
    formDisabledText: "El formulario no está disponible en este momento. Escríbenos por WhatsApp o correo.",
  },
  emails: {
    notifySubject: "Nueva solicitud de asesoría web — {servicio}",
    notifyBody: `Hola, equipo Estratec:

Se ha recibido una nueva solicitud desde el sitio web.

- Nombre: {nombre}
- Correo: {correo}
- Teléfono: {telefono}
- Empresa: {empresa}
- Servicio de interés: {servicio}
- Preferencia de contacto: {preferencia}
- País / zona horaria: {pais}
- Horario preferido: {horario}
- Mensaje: {mensaje}
- Página de origen: {url_origen}
- Fecha de envío: {fecha}

Revisar la solicitud y contactar al prospecto.`,
    confirmEnabled: true,
    confirmSubject: "Recibimos tu solicitud de asesoría — Estratec",
    confirmBody: `Hola, {nombre}:

Gracias por contactar a Estratec y compartir tu proyecto. Hemos recibido tu solicitud sobre **{servicio}**.

Nuestro equipo revisará la información y se pondrá en contacto contigo por el medio indicado para conversar sobre tus necesidades y coordinar una fecha y hora.

La fecha y franja horaria que hayas indicado son una preferencia y **no representan una cita confirmada**. La cita quedará confirmada únicamente cuando una persona del equipo Estratec valide y acuerde el horario contigo.

Mientras tanto, también puedes escribirnos por WhatsApp al {whatsapp}.

Saludos,
**Equipo Estratec**`,
  },
  crmTemplates: {
    templates: [
      {
        id: "respuesta-inicial",
        name: "Respuesta inicial",
        subject: "Tu solicitud sobre {servicio} — Estratec",
        body: `Hola, {nombre}. Te saluda {agente} de Estratec.

Recibimos tu solicitud sobre {servicio} y nos gustaría conocer un poco más de tu proyecto para orientarte de la mejor manera.

¿Tienes disponibilidad para una breve llamada o videollamada? Indicaste como preferencia: {horario}.

Quedamos atentos.`,
      },
      {
        id: "informacion-adicional",
        name: "Solicitud de información adicional",
        subject: "Información adicional para tu proyecto — Estratec",
        body: `Hola, {nombre}. Gracias por tu interés en {servicio}.

Para preparar la conversación y entender mejor el alcance, ¿podrías compartirnos?
- Objetivo principal del proyecto.
- Herramientas o sistemas que utilizan actualmente.
- Fecha estimada en la que te gustaría comenzar.

Con esa información coordinamos una consultoría.`,
      },
      {
        id: "confirmacion-cita",
        name: "Confirmación manual de cita",
        subject: "Cita confirmada — Estratec",
        body: `Hola, {nombre}. Confirmamos nuestra consultoría sobre {servicio}:

Fecha y hora acordadas: {cita}

Te compartiremos el enlace o los datos de conexión antes de la reunión. Si necesitas reprogramar, respóndenos a este mensaje.

Saludos,
{agente} — Equipo Estratec`,
      },
    ],
  },
  analytics: { ga4Id: "", gtmId: "", gscVerification: "", requireConsent: true },
  seo: {
    siteName: "Estratec",
    titleTemplate: "%s | Estratec",
    defaultTitle: "Estratec | Consultoría tecnológica y desarrollo de software en Latinoamérica",
    defaultDescription:
      "Consultoría estratégica con capacidad real de ejecución: software a medida, aplicaciones web y móviles, páginas web, APIs e integraciones, CRM Kommo y GoHighLevel, y gamificación para empresas de Latinoamérica.",
    ogImage: "",
    indexSite: true,
    market: "Latinoamérica",
    regionalTerms: [],
    robotsExtra: "",
    llmsEnabled: true,
  },
  org: {
    legalName: "",
    shortDescription:
      "Aliado tecnológico para empresas y organizaciones de Latinoamérica: de la estrategia a la implementación de software, integraciones, CRM y experiencias digitales.",
    longDescription:
      "Estratec combina consultoría estratégica para entender el negocio, identificar oportunidades y definir el camino adecuado, con capacidad de ejecutar el trabajo mediante diseño, desarrollo, implementación e integración de soluciones tecnológicas.",
    areaServed: "Latinoamérica",
  },
};

// ───────────────────────────── Acceso ─────────────────────────────

/** Mezcla superficial para tolerar campos nuevos añadidos después de guardar. */
function merge<K extends SettingKey>(key: K, stored: unknown): Settings[K] {
  const base = settingDefaults[key];
  if (!stored || typeof stored !== "object") return base;
  const parsed = settingSchemas[key].safeParse({ ...base, ...(stored as object) });
  return parsed.success ? (parsed.data as Settings[K]) : base;
}

export const getSettings = cache(async (): Promise<Settings> => {
  let rows: { key: string; value: unknown }[] = [];
  try {
    rows = await db.setting.findMany();
  } catch (e) {
    console.error("[settings] BD no disponible", (e as Error).message);
    throw e; // sin fallback silencioso: ISR conserva la última versión válida
  }
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const out = {} as Settings;
  for (const k of Object.keys(settingDefaults) as SettingKey[]) {
    (out as Record<SettingKey, unknown>)[k] = merge(k, map.get(k));
  }
  return out;
});
