"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { LeadStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { sendMail } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { COUNTRIES, NOT_SURE, SLOTS, STATUS_LABEL, STATUS_ORDER } from "@/lib/leads";
import type { ActionState } from "./types";

const id = z.string().regex(/^[a-z0-9]{20,40}$/i);
const txt = (max: number) => z.string().trim().max(max);

function fail(message: string, errors?: Record<string, string>): ActionState {
  return { ok: false, message, errors };
}

/** datetime-local interpretado en hora de Ecuador (GMT-5, sin horario de verano). */
function parseLocalEcuador(v: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return null;
  const d = new Date(`${v}:00-05:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ───────────────────────── Estado ─────────────────────────
const MANUAL_STATUSES = STATUS_ORDER.filter((s) => s !== "CITA_CONFIRMADA");

export async function updateStatusAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const leadId = id.safeParse(fd.get("leadId"));
  const status = z.enum(MANUAL_STATUSES as [LeadStatus, ...LeadStatus[]]).safeParse(fd.get("status"));
  if (!leadId.success) return fail("Prospecto inválido.");
  if (!status.success) return fail("Para confirmar una cita usa la acción “Confirmar cita” e indica el horario acordado.");
  const lead = await db.lead.findUnique({ where: { id: leadId.data }, select: { status: true } });
  if (!lead) return fail("Prospecto no encontrado.");
  if (lead.status === status.data) return { ok: true, message: "Sin cambios." };

  const leavingConfirmed = lead.status === "CITA_CONFIRMADA";
  await db.lead.update({
    where: { id: leadId.data },
    data: {
      status: status.data,
      ...(leavingConfirmed ? { agreedAt: null, confirmedAt: null, confirmedById: null } : {}),
      activities: {
        create: {
          type: "ESTADO",
          authorId: user.id,
          body: `Estado: ${STATUS_LABEL[lead.status]} → ${STATUS_LABEL[status.data]}${leavingConfirmed ? " (se anuló la cita confirmada)" : ""}`,
        },
      },
    },
  });
  await audit("lead.status_changed", { userId: user.id, entity: "Lead", entityId: leadId.data, meta: { from: lead.status, to: status.data } });
  revalidatePath(`/admin/prospectos/${leadId.data}`);
  return { ok: true, message: "Estado actualizado." };
}

// ───────────────────────── Cita (confirmación manual) ─────────────────────────
export async function confirmAppointmentAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const leadId = id.safeParse(fd.get("leadId"));
  if (!leadId.success) return fail("Prospecto inválido.");
  const when = parseLocalEcuador(String(fd.get("agreedAt") ?? ""));
  if (!when) return fail("Indica la fecha y hora acordadas con el prospecto.", { agreedAt: "Fecha y hora requeridas" });
  if (fd.get("ack") !== "on") return fail("Confirma que el horario fue acordado con el prospecto.", { ack: "Requerido" });
  const lead = await db.lead.findUnique({ where: { id: leadId.data }, select: { status: true } });
  if (!lead) return fail("Prospecto no encontrado.");

  const label = new Intl.DateTimeFormat("es-EC", { dateStyle: "full", timeStyle: "short", timeZone: "America/Guayaquil" }).format(when);
  await db.lead.update({
    where: { id: leadId.data },
    data: {
      status: "CITA_CONFIRMADA",
      agreedAt: when,
      confirmedAt: new Date(),
      confirmedById: user.id,
      activities: { create: { type: "CITA", authorId: user.id, body: `Cita confirmada manualmente para ${label} (hora de Ecuador).` } },
    },
  });
  await audit("lead.appointment_confirmed", { userId: user.id, entity: "Lead", entityId: leadId.data, meta: { agreedAt: when.toISOString(), from: lead.status } });
  revalidatePath(`/admin/prospectos/${leadId.data}`);
  return { ok: true, message: "Cita confirmada. Recuerda comunicar la confirmación al prospecto (usa la plantilla “Confirmación manual de cita”)." };
}

export async function cancelAppointmentAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const leadId = id.safeParse(fd.get("leadId"));
  if (!leadId.success) return fail("Prospecto inválido.");
  await db.lead.update({
    where: { id: leadId.data },
    data: {
      status: "CITA_SOLICITADA",
      agreedAt: null,
      confirmedAt: null,
      confirmedById: null,
      activities: { create: { type: "CITA", authorId: user.id, body: "Se anuló la cita confirmada; vuelve a estado “Cita solicitada”." } },
    },
  });
  await audit("lead.appointment_cancelled", { userId: user.id, entity: "Lead", entityId: leadId.data });
  revalidatePath(`/admin/prospectos/${leadId.data}`);
  return { ok: true, message: "Cita anulada." };
}

// ───────────────────────── Notas y asignación ─────────────────────────
export async function addNoteAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const leadId = id.safeParse(fd.get("leadId"));
  const body = txt(4000).min(1, "Escribe una nota").safeParse(fd.get("body"));
  if (!leadId.success) return fail("Prospecto inválido.");
  if (!body.success) return fail(body.error.issues[0]!.message);
  await db.leadActivity.create({ data: { leadId: leadId.data, authorId: user.id, type: "NOTA", body: body.data } });
  revalidatePath(`/admin/prospectos/${leadId.data}`);
  return { ok: true, message: "Nota agregada.", ts: Date.now() };
}

export async function assignAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const leadId = id.safeParse(fd.get("leadId"));
  if (!leadId.success) return fail("Prospecto inválido.");
  const raw = String(fd.get("assignedToId") ?? "");
  let assignee: { id: string; name: string } | null = null;
  if (raw) {
    assignee = await db.user.findFirst({ where: { id: raw, active: true }, select: { id: true, name: true } });
    if (!assignee) return fail("Usuario inválido.");
  }
  await db.lead.update({
    where: { id: leadId.data },
    data: {
      assignedToId: assignee?.id ?? null,
      activities: { create: { type: "ASIGNACION", authorId: user.id, body: assignee ? `Asignado a ${assignee.name}` : "Sin responsable asignado" } },
    },
  });
  revalidatePath(`/admin/prospectos/${leadId.data}`);
  return { ok: true, message: "Responsable actualizado." };
}

// ───────────────────────── Mensajes con plantilla ─────────────────────────
export async function sendLeadEmailAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const leadId = id.safeParse(fd.get("leadId"));
  const subject = txt(200).min(1, "Asunto requerido").safeParse(fd.get("subject"));
  const body = txt(4000).min(1, "Mensaje requerido").safeParse(fd.get("body"));
  const tplName = txt(80).safeParse(fd.get("templateName") ?? "");
  if (!leadId.success) return fail("Prospecto inválido.");
  if (!subject.success || !body.success) return fail("Completa el asunto y el mensaje.");
  const lead = await db.lead.findUnique({ where: { id: leadId.data }, select: { email: true } });
  if (!lead) return fail("Prospecto no encontrado.");
  const settings = await getSettings();
  const res = await sendMail({ to: lead.email, subject: subject.data, text: body.data, replyTo: settings.contact.email });
  if (!res.ok) return fail("No se pudo enviar el correo. Revisa el proveedor de correo en Configuración › Correos automáticos.");
  await db.leadActivity.create({
    data: { leadId: leadId.data, authorId: user.id, type: "MENSAJE", body: `Correo enviado: “${subject.data}”${tplName.success && tplName.data ? ` (plantilla: ${tplName.data})` : ""}` },
  });
  await audit("lead.email_sent", { userId: user.id, entity: "Lead", entityId: leadId.data, meta: { template: tplName.success ? tplName.data : "" } });
  revalidatePath(`/admin/prospectos/${leadId.data}`);
  return { ok: true, message: "Correo enviado al prospecto." };
}

export async function logOutreachAction(leadId: string, channel: "whatsapp" | "correo", templateName: string) {
  const user = await requireAdmin();
  if (!id.safeParse(leadId).success) return;
  await db.leadActivity.create({
    data: {
      leadId,
      authorId: user.id,
      type: "MENSAJE",
      body: `Mensaje preparado por ${channel === "whatsapp" ? "WhatsApp" : "correo (cliente local)"}${templateName ? ` (plantilla: ${templateName.slice(0, 80)})` : ""}.`,
    },
  });
  revalidatePath(`/admin/prospectos/${leadId}`);
}

// ───────────────────────── Alta / edición / borrado ─────────────────────────
const leadEditSchema = z.object({
  name: txt(120).min(2, "Nombre requerido"),
  email: z.string().trim().toLowerCase().max(160).pipe(z.email("Correo inválido")),
  phone: txt(40).refine((v) => v.replace(/\D/g, "").length >= 7, "Teléfono inválido"),
  company: txt(160).optional(),
  service: txt(120).min(1, "Selecciona un servicio"),
  message: txt(3000).min(1, "Describe la necesidad"),
  contactPref: z.enum(["WHATSAPP", "EMAIL"]),
  country: z.enum(["", ...COUNTRIES] as [string, ...string[]]).optional(),
  preferredDate: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/).optional(),
  preferredSlot: z.enum(["", ...SLOTS.map((s) => s.value)] as [string, ...string[]]).optional(),
  utmSource: txt(120).optional(),
});

async function resolveService(slug: string) {
  if (slug === NOT_SURE) return { serviceSlug: null, serviceName: "No estoy seguro/a" };
  const s = await db.service.findUnique({ where: { slug }, select: { slug: true, name: true } });
  return s ? { serviceSlug: s.slug, serviceName: s.name } : null;
}

function parseEdit(fd: FormData) {
  return leadEditSchema.safeParse({
    name: fd.get("name"),
    email: fd.get("email"),
    phone: fd.get("phone"),
    company: fd.get("company") || undefined,
    service: fd.get("service"),
    message: fd.get("message"),
    contactPref: fd.get("contactPref") || "WHATSAPP",
    country: fd.get("country") || "",
    preferredDate: fd.get("preferredDate") || "",
    preferredSlot: fd.get("preferredSlot") || "",
    utmSource: fd.get("utmSource") || undefined,
  });
}

function zodErrors(e: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of e.issues) out[String(i.path[0])] ??= i.message;
  return out;
}

export async function createLeadAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const p = parseEdit(fd);
  if (!p.success) return fail("Revisa los campos marcados.", zodErrors(p.error));
  const svc = await resolveService(p.data.service);
  if (!svc) return fail("Servicio inválido.", { service: "Servicio inválido" });
  const lead = await db.lead.create({
    data: {
      name: p.data.name,
      email: p.data.email,
      phone: p.data.phone,
      company: p.data.company || null,
      ...svc,
      message: p.data.message,
      contactPref: p.data.contactPref,
      country: p.data.country || null,
      preferredDate: p.data.preferredDate ? new Date(`${p.data.preferredDate}T00:00:00Z`) : null,
      preferredSlot: p.data.preferredSlot || null,
      source: "MANUAL",
      utmSource: p.data.utmSource || null,
      assignedToId: user.id,
      activities: { create: { type: "CREADO", authorId: user.id, body: `Registro manual por ${user.name}.` } },
    },
  });
  await audit("lead.created_manual", { userId: user.id, entity: "Lead", entityId: lead.id });
  redirect(`/admin/prospectos/${lead.id}`);
}

export async function updateLeadAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const leadId = id.safeParse(fd.get("leadId"));
  if (!leadId.success) return fail("Prospecto inválido.");
  const p = parseEdit(fd);
  if (!p.success) return fail("Revisa los campos marcados.", zodErrors(p.error));
  const svc = await resolveService(p.data.service);
  if (!svc) return fail("Servicio inválido.", { service: "Servicio inválido" });
  await db.lead.update({
    where: { id: leadId.data },
    data: {
      name: p.data.name,
      email: p.data.email,
      phone: p.data.phone,
      company: p.data.company || null,
      ...svc,
      message: p.data.message,
      contactPref: p.data.contactPref,
      country: p.data.country || null,
      preferredDate: p.data.preferredDate ? new Date(`${p.data.preferredDate}T00:00:00Z`) : null,
      preferredSlot: p.data.preferredSlot || null,
      activities: { create: { type: "NOTA", authorId: user.id, body: "Datos del prospecto actualizados." } },
    },
  });
  await audit("lead.updated", { userId: user.id, entity: "Lead", entityId: leadId.data });
  revalidatePath(`/admin/prospectos/${leadId.data}`);
  return { ok: true, message: "Datos actualizados." };
}

export async function deleteLeadAction(fd: FormData) {
  const user = await requireAdmin();
  const leadId = id.safeParse(fd.get("leadId"));
  if (!leadId.success) return;
  await db.lead.delete({ where: { id: leadId.data } });
  await audit("lead.deleted", { userId: user.id, entity: "Lead", entityId: leadId.data });
  redirect("/admin/prospectos?eliminado=1");
}
