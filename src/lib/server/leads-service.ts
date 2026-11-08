import "server-only";
import type { Lead } from "@prisma/client";
import { getSettings } from "@/lib/settings";
import { sendMail } from "@/lib/email";
import { renderTemplate } from "@/lib/templates";
import { slotLabel } from "@/lib/leads";

export const BUSINESS_TZ = "America/Guayaquil";

export const fmtDateTime = (d: Date) =>
  new Intl.DateTimeFormat("es-EC", { dateStyle: "long", timeStyle: "short", timeZone: BUSINESS_TZ }).format(d);

export const fmtDate = (d: Date) => new Intl.DateTimeFormat("es-EC", { dateStyle: "long", timeZone: "UTC" }).format(d);

export function leadVars(lead: Lead, extra: Record<string, string> = {}) {
  const pref = [lead.preferredDate ? fmtDate(lead.preferredDate) : "", slotLabel(lead.preferredSlot)].filter(Boolean).join(" · ");
  return {
    nombre: lead.name,
    correo: lead.email,
    telefono: lead.phone,
    empresa: lead.company || "—",
    servicio: lead.serviceName,
    preferencia: lead.contactPref === "EMAIL" ? "Correo" : "WhatsApp",
    horario: pref || "Sin preferencia",
    pais: [lead.country, lead.timezone].filter(Boolean).join(" / ") || "—",
    mensaje: lead.message,
    url_origen: lead.originUrl || "—",
    fecha: fmtDateTime(lead.createdAt),
    cita: lead.agreedAt ? `${fmtDateTime(lead.agreedAt)} (hora de Ecuador, GMT-5)` : "por confirmar",
    ...extra,
  };
}

/** Notifica a Estratec y confirma la recepción al prospecto. Nunca confirma una cita. */
export async function sendLeadEmails(lead: Lead) {
  const s = await getSettings();
  const vars = leadVars(lead, { whatsapp: s.contact.whatsappDisplay });
  const notify = await sendMail({
    to: s.contact.leadsRecipient,
    subject: renderTemplate(s.emails.notifySubject, vars),
    text: renderTemplate(s.emails.notifyBody, vars),
    replyTo: lead.email,
  });
  let confirm: { ok: boolean } = { ok: true };
  if (s.emails.confirmEnabled) {
    confirm = await sendMail({
      to: lead.email,
      subject: renderTemplate(s.emails.confirmSubject, vars),
      text: renderTemplate(s.emails.confirmBody, vars),
      replyTo: s.contact.email,
    });
  }
  return { notify: notify.ok, confirm: confirm.ok };
}
