import "server-only";
import { Resend } from "resend";
import { env } from "./env";
import { stripBold, textToSafeHtml } from "./templates";

type Mail = { to: string; subject: string; text: string; replyTo?: string };

/** Envía correo desde el backend. Destinatarios y plantillas vienen de configuración, nunca del visitante. */
export async function sendMail({ to, subject, text, replyTo }: Mail): Promise<{ ok: boolean; error?: string }> {
  // Evita inyección de cabeceras: sin saltos de línea en asunto/destinatario.
  const cleanSubject = subject.replace(/[\r\n]+/g, " ").slice(0, 200);
  const cleanTo = to.replace(/[\r\n,;]+/g, "").trim();
  const cleanReply = replyTo?.replace(/[\r\n,;]+/g, "").trim();

  if (!env.resendKey) {
    if (env.isProd) return { ok: false, error: "RESEND_API_KEY no configurada" };
    console.info(`\n[correo:dev] Para: ${cleanTo}\nAsunto: ${cleanSubject}\n${stripBold(text)}\n`);
    return { ok: true };
  }
  try {
    const resend = new Resend(env.resendKey);
    const { error } = await resend.emails.send({
      from: env.mailFrom,
      to: [cleanTo],
      subject: cleanSubject,
      text: stripBold(text),
      html: textToSafeHtml(text),
      ...(cleanReply ? { replyTo: cleanReply } : {}),
    });
    if (error) {
      console.error("[correo] Resend error:", error.name);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.error("[correo] fallo de envío:", (e as Error).message);
    return { ok: false, error: "fallo de envío" };
  }
}
