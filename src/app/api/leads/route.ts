import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashIp, hmac, safeEqual } from "@/lib/crypto";
import { clientIp, isSameOrigin } from "@/lib/request";
import { rateLimit } from "@/lib/ratelimit";
import { NOT_SURE, leadFormSchema, leadMetaSchema } from "@/lib/leads";
import { getSettings } from "@/lib/settings";
import { waLink } from "@/lib/whatsapp";
import { sendLeadEmails } from "@/lib/server/leads-service";

export const dynamic = "force-dynamic";

const MIN_FILL_MS = 3000;
const MAX_TOKEN_AGE_MS = 6 * 60 * 60 * 1000;

const bodySchema = z.object({ form: z.unknown(), meta: leadMetaSchema }).strict();

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function validToken(token: string): boolean {
  const [t, sig] = token.split(".");
  if (!t || !sig) return false;
  if (!safeEqual(sig, hmac(`lead:${t}`))) return false;
  const age = Date.now() - parseInt(t, 36);
  return age >= MIN_FILL_MS && age <= MAX_TOKEN_AGE_MS;
}

/** URL de origen: solo se guarda si pertenece al propio sitio. */
function sameSiteUrl(raw: string | undefined, host: string | null): string | undefined {
  if (!raw) return undefined;
  try {
    const u = new URL(raw);
    if (!/^https?:$/.test(u.protocol) || (host && u.host !== host)) return undefined;
    return `${u.origin}${u.pathname}${u.search}`.slice(0, 500);
  } catch {
    return undefined;
  }
}

export async function POST(req: Request) {
  if (!(await isSameOrigin())) return json(403, { ok: false, error: "Origen no permitido." });
  const len = Number(req.headers.get("content-length") || 0);
  if (len > 20_000) return json(413, { ok: false, error: "Solicitud demasiado grande." });

  const settings = await getSettings();
  if (!settings.cta.formEnabled) return json(503, { ok: false, error: settings.cta.formDisabledText });

  const ipKey = hashIp(await clientIp());
  const [burst, daily] = await Promise.all([
    rateLimit(`lead:10m:${ipKey}`, 5, 600),
    rateLimit(`lead:1d:${ipKey}`, 20, 86400),
  ]);
  if (!burst || !daily) {
    return json(429, { ok: false, error: "Recibimos varias solicitudes seguidas. Espera unos minutos o escríbenos por WhatsApp." });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json(400, { ok: false, error: "Formato inválido." });
  }
  const body = bodySchema.safeParse(raw);
  if (!body.success) return json(400, { ok: false, error: "Solicitud inválida." });
  const { meta } = body.data;

  const waGeneral = waLink(settings.contact.whatsappNumber, settings.cta.whatsappGeneralText);

  // Honeypot o token inválido: respuesta genérica de éxito para no dar pistas al bot.
  if (meta.website || !validToken(meta.token)) {
    console.warn("[leads] envío descartado por anti-spam");
    return json(200, { ok: true, whatsapp: waGeneral });
  }

  const parsed = leadFormSchema.safeParse(body.data.form);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[String(i.path[0])] ??= i.message;
    return json(422, { ok: false, error: "Revisa los campos marcados.", fields });
  }
  const f = parsed.data;

  let serviceSlug: string | null = null;
  let serviceName = "No estoy seguro/a";
  let waText = settings.cta.whatsappGeneralText;
  if (f.service !== NOT_SURE) {
    const svc = await db.service.findFirst({
      where: { slug: f.service, status: "PUBLISHED" },
      select: { slug: true, name: true, whatsappText: true },
    });
    if (!svc) return json(422, { ok: false, error: "Revisa los campos marcados.", fields: { service: "Selecciona un servicio válido" } });
    serviceSlug = svc.slug;
    serviceName = svc.name;
    waText = svc.whatsappText;
  }

  const privacy = await db.contentBlock.findUnique({ where: { key: "privacy" }, select: { data: true } });
  const privacyVersion = (privacy?.data as { version?: string } | null)?.version || "borrador-1";

  try {
    const lead = await db.lead.create({
      data: {
        name: f.name,
        email: f.email,
        phone: f.phone,
        company: f.company ?? null,
        serviceSlug,
        serviceName,
        message: f.message,
        contactPref: f.contactPref,
        preferredDate: f.preferredDate ? new Date(`${f.preferredDate}T00:00:00Z`) : null,
        preferredSlot: f.preferredSlot || null,
        country: f.country ?? null,
        timezone: f.timezone ?? null,
        status: "NUEVA",
        source: "FORMULARIO_WEB",
        originUrl: sameSiteUrl(meta.originUrl, req.headers.get("host")),
        utmSource: meta.utm?.source,
        utmMedium: meta.utm?.medium,
        utmCampaign: meta.utm?.campaign,
        utmTerm: meta.utm?.term,
        utmContent: meta.utm?.content,
        privacyAcceptedAt: new Date(),
        privacyVersion,
        activities: {
          create: {
            type: "CREADO",
            body:
              f.preferredDate || f.preferredSlot
                ? "Solicitud recibida desde el formulario web, con horario preferido (pendiente de confirmar)."
                : "Solicitud recibida desde el formulario web.",
          },
        },
      },
    });

    const mail = await sendLeadEmails(lead);
    if (!mail.notify || !mail.confirm) {
      const fails = [!mail.notify && "la notificación interna", !mail.confirm && "la confirmación al prospecto"].filter(Boolean).join(" y ");
      await db.leadActivity.create({ data: { leadId: lead.id, type: "MENSAJE", body: `Aviso: no se pudo enviar ${fails}.` } });
    }
  } catch (e) {
    console.error("[leads] error al registrar:", (e as Error).message);
    return json(500, { ok: false, error: "No pudimos registrar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp." });
  }

  return json(200, { ok: true, whatsapp: waLink(settings.contact.whatsappNumber, waText) });
}
