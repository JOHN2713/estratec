import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { Resend } from "resend";
import { env } from "./env";
import { stripBold, textToSafeHtml } from "./templates";

type Mail = { to: string; subject: string; text: string; replyTo?: string };
export type MailResult = { ok: boolean; error?: string; provider?: Provider };
type Provider = "smtp" | "resend" | "consola";

/**
 * Proveedor según variables de entorno (prioridad):
 *  1. SMTP_HOST/SMTP_USER/SMTP_PASS → SMTP (p. ej. Gmail con contraseña de aplicación)
 *  2. RESEND_API_KEY               → Resend (requiere dominio verificado)
 *  3. ninguno                      → consola (solo desarrollo)
 * Cambiar de Gmail a Resend es solo cuestión de variables: el código no cambia.
 */
export function mailProvider(): Provider | null {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return "smtp";
  if (env.resendKey) return "resend";
  return env.isProd ? null : "consola";
}

let smtp: Transporter | null = null;
function smtpTransport(): Transporter {
  if (smtp) return smtp;
  const port = Number(process.env.SMTP_PORT || 465);
  smtp = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // 465 = TLS directo; 587 = STARTTLS
    requireTLS: port !== 465,
    auth: { user: process.env.SMTP_USER, pass: (process.env.SMTP_PASS ?? "").replace(/\s+/g, "") },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    // Endurecimiento: los mensajes nunca leen archivos ni URLs
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  return smtp;
}

/** Sin saltos de línea ni separadores: evita inyección de cabeceras y destinatarios múltiples. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();
const oneAddress = (s: string) => s.replace(/[\r\n,;]+/g, "").trim();

/** Envía correo desde el backend. Destinatarios y plantillas vienen de configuración, nunca del visitante. */
export async function sendMail({ to, subject, text, replyTo }: Mail): Promise<MailResult> {
  const provider = mailProvider();
  const cleanSubject = oneLine(subject).slice(0, 200);
  const cleanTo = oneAddress(to);
  const cleanReply = replyTo ? oneAddress(replyTo) : undefined;
  const plain = stripBold(text);
  const html = textToSafeHtml(text);

  if (!provider) return { ok: false, error: "No hay proveedor de correo configurado (SMTP o Resend)" };

  if (provider === "consola") {
    console.info(`\n[correo:dev] Para: ${cleanTo}\nAsunto: ${cleanSubject}\n${plain}\n`);
    return { ok: true, provider };
  }

  try {
    if (provider === "smtp") {
      await smtpTransport().sendMail({
        from: env.mailFrom,
        to: cleanTo,
        subject: cleanSubject,
        text: plain,
        html,
        ...(cleanReply ? { replyTo: cleanReply } : {}),
      });
      return { ok: true, provider };
    }
    const { error } = await new Resend(env.resendKey).emails.send({
      from: env.mailFrom,
      to: [cleanTo],
      subject: cleanSubject,
      text: plain,
      html,
      ...(cleanReply ? { replyTo: cleanReply } : {}),
    });
    if (error) {
      console.error("[correo] Resend:", error.name, error.message);
      return { ok: false, error: error.message, provider };
    }
    return { ok: true, provider };
  } catch (e) {
    // No registrar credenciales ni contenido del mensaje
    const msg = (e as { code?: string; responseCode?: number; message?: string });
    console.error("[correo] fallo de envío:", provider, msg.code ?? "", msg.responseCode ?? "", (msg.message ?? "").split("\n")[0]);
    return { ok: false, error: msg.code === "EAUTH" ? "Credenciales SMTP rechazadas" : "Fallo de envío", provider };
  }
}
