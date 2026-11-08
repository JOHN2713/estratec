import { z } from "zod";
import type { LeadStatus } from "@prisma/client";

export const STATUS_LABEL: Record<LeadStatus, string> = {
  NUEVA: "Nueva solicitud",
  EN_REVISION: "En revisión",
  CONTACTADO: "Contactado",
  CITA_SOLICITADA: "Cita solicitada",
  CITA_CONFIRMADA: "Cita confirmada",
  PROPUESTA_ENVIADA: "Propuesta enviada",
  GANADO: "Ganado",
  PERDIDO: "Perdido",
};

export const STATUS_ORDER: LeadStatus[] = [
  "NUEVA", "EN_REVISION", "CONTACTADO", "CITA_SOLICITADA", "CITA_CONFIRMADA", "PROPUESTA_ENVIADA", "GANADO", "PERDIDO",
];

/** Agrupación para el dashboard. */
export const STATUS_GROUP: Record<LeadStatus, "nuevas" | "gestion" | "contactadas" | "cerradas"> = {
  NUEVA: "nuevas",
  EN_REVISION: "gestion",
  CITA_SOLICITADA: "gestion",
  CONTACTADO: "contactadas",
  CITA_CONFIRMADA: "contactadas",
  PROPUESTA_ENVIADA: "contactadas",
  GANADO: "cerradas",
  PERDIDO: "cerradas",
};

export const SLOTS = [
  { value: "manana", label: "Mañana (8:00 – 12:00)" },
  { value: "mediodia", label: "Mediodía (12:00 – 14:00)" },
  { value: "tarde", label: "Tarde (14:00 – 18:00)" },
  { value: "noche", label: "Noche (18:00 – 20:00)" },
] as const;
export const slotLabel = (v?: string | null) => SLOTS.find((s) => s.value === v)?.label ?? v ?? "";

export const COUNTRIES = [
  "Argentina", "Bolivia", "Chile", "Colombia", "Costa Rica", "Cuba", "Ecuador", "El Salvador", "Guatemala",
  "Honduras", "México", "Nicaragua", "Panamá", "Paraguay", "Perú", "Puerto Rico", "República Dominicana",
  "Uruguay", "Venezuela", "Otro",
] as const;

export const NOT_SURE = "no-estoy-seguro";

const clean = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    // elimina caracteres de control (excepto saltos de línea y tabulación)
    .transform((v) => v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ""));

const optional = (max: number) => clean(max).optional().transform((v) => (v ? v : undefined));

/** Esquema compartido cliente/servidor del formulario público. */
export const leadFormSchema = z
  .object({
    name: clean(120).pipe(z.string().min(3, "Escribe tu nombre y apellido")),
    email: z.string().trim().toLowerCase().max(160).pipe(z.email("Correo electrónico inválido")),
    phone: clean(40).refine((v) => v.replace(/\D/g, "").length >= 7, "Teléfono inválido").refine((v) => /^[+\d\s().-]+$/.test(v), "Teléfono inválido"),
    company: optional(160),
    service: clean(120).pipe(z.string().min(1, "Selecciona un servicio")),
    message: clean(3000).pipe(z.string().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)")),
    contactPref: z.enum(["WHATSAPP", "EMAIL"]),
    preferredDate: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Fecha inválida"),
    preferredSlot: z.enum(["", ...SLOTS.map((s) => s.value)] as [string, ...string[]]).optional(),
    country: optional(80),
    timezone: optional(80),
    privacy: z.literal(true, { error: "Debes aceptar la política de privacidad" }),
  })
  .strict();

export type LeadFormInput = z.input<typeof leadFormSchema>;

/** Metadatos técnicos (no visibles) del envío. */
export const leadMetaSchema = z.object({
  originUrl: z.string().max(500).optional(),
  utm: z
    .object({
      source: z.string().max(120).optional(),
      medium: z.string().max(120).optional(),
      campaign: z.string().max(120).optional(),
      term: z.string().max(120).optional(),
      content: z.string().max(120).optional(),
    })
    .partial()
    .optional(),
  token: z.string().max(200),
  website: z.string().max(200).optional(), // honeypot
});
