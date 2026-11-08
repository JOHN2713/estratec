"use server";

import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { sendMail } from "@/lib/email";
import { rateLimit } from "@/lib/ratelimit";
import { getSettings } from "@/lib/settings";
import type { ActionState } from "./types";

/** Envía un correo de prueba al destinatario de solicitudes configurado. */
export async function sendTestEmailAction(_: ActionState, _fd: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  if (!(await rateLimit(`mailtest:${user.id}`, 5, 600))) {
    return { ok: false, message: "Has enviado varias pruebas seguidas. Espera unos minutos." };
  }
  const s = await getSettings();
  const to = s.contact.leadsRecipient;
  const res = await sendMail({
    to,
    subject: "Prueba de correo — Panel Estratec",
    text: `Hola, equipo Estratec:\n\nEste es un correo de prueba enviado desde el panel por ${user.name}.\n\nSi lo recibiste, las notificaciones de nuevas solicitudes y las confirmaciones a prospectos están funcionando.\n\n**Equipo Estratec**`,
    replyTo: s.contact.email,
  });
  await audit("settings.mail_test", { userId: user.id, meta: { ok: res.ok, provider: res.provider ?? "ninguno" } });
  return res.ok
    ? { ok: true, message: `Correo de prueba enviado a ${to} vía ${res.provider === "smtp" ? "Gmail/SMTP" : res.provider}. Revisa también la carpeta de spam.` }
    : { ok: false, message: `No se pudo enviar: ${res.error}.` };
}
