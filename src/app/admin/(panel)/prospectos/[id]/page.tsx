import { notFound } from "next/navigation";
import { CalendarClock, CalendarCheck, Mail, MessageCircle, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { slotLabel } from "@/lib/leads";
import { gmailComposeUrl, waLink } from "@/lib/whatsapp";
import { leadVars } from "@/lib/server/leads-service";
import { deleteLeadAction } from "@/app/admin/actions/leads";
import { AdminPage, Panel } from "@/components/admin/Page";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmButton } from "@/components/admin/ui";
import { AppointmentForm, AssignForm, LeadEditForm, NoteForm, StatusForm, TemplateComposer } from "@/components/admin/LeadForms";

export const metadata = { title: "Prospecto" };

const TYPE_LABEL = { CREADO: "Creación", NOTA: "Nota", ESTADO: "Estado", CITA: "Cita", ASIGNACION: "Asignación", MENSAJE: "Mensaje" } as const;

function toLocalEcuador(d: Date | null): string {
  if (!d) return "";
  const ec = new Date(d.getTime() - 5 * 60 * 60 * 1000);
  return ec.toISOString().slice(0, 16);
}

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin();
  const { id } = await params;
  if (!/^[a-z0-9]{20,40}$/i.test(id)) notFound();
  const [lead, users, services, settings] = await Promise.all([
    db.lead.findUnique({
      where: { id },
      include: { assignedTo: { select: { id: true, name: true } }, activities: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } } },
    }),
    db.user.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.service.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } }),
    getSettings(),
  ]);
  if (!lead) notFound();

  const fmt = new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Guayaquil" });
  const vars = leadVars(lead, { agente: me.name, whatsapp: settings.contact.whatsappDisplay });
  const pref = [lead.preferredDate ? new Intl.DateTimeFormat("es-EC", { dateStyle: "full", timeZone: "UTC" }).format(lead.preferredDate) : "", slotLabel(lead.preferredSlot)]
    .filter(Boolean)
    .join(" · ");
  const confirmedBy = lead.confirmedById ? users.find((u) => u.id === lead.confirmedById)?.name : null;

  return (
    <AdminPage
      title={lead.name}
      back={{ href: "/admin/prospectos", label: "Prospectos" }}
      description={
        <span className="flex flex-wrap items-center gap-2">
          <StatusBadge status={lead.status} />
          <span>{lead.serviceName}</span>
          <span className="text-ink-dim">· Recibido {fmt.format(lead.createdAt)} · {lead.source === "MANUAL" ? "Registro manual" : "Formulario web"}</span>
        </span>
      }
      actions={
        <>
          <a href={waLink(lead.phone)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp btn-sm">
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
          </a>
          <a href={gmailComposeUrl({ to: lead.email, account: settings.contact.email })} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
            <Mail className="h-4 w-4" aria-hidden="true" /> Correo
          </a>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Panel title="Datos del prospecto">
            <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              {[
                ["Correo", lead.email],
                ["Teléfono / WhatsApp", lead.phone],
                ["Empresa", lead.company || "—"],
                ["Preferencia de contacto", lead.contactPref === "EMAIL" ? "Correo" : "WhatsApp"],
                ["País", lead.country || "—"],
                ["Zona horaria", lead.timezone || "—"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-ink-dim">{k}</dt>
                  <dd className="mt-0.5 break-words text-white">{v}</dd>
                </div>
              ))}
              <div className="sm:col-span-2">
                <dt className="text-ink-dim">Mensaje</dt>
                <dd className="mt-1 whitespace-pre-wrap rounded-xl bg-luna-900/50 p-4 text-ink">{lead.message}</dd>
              </div>
            </dl>
            <details className="mt-5 text-sm">
              <summary className="cursor-pointer text-ink-muted hover:text-white">Origen y consentimiento</summary>
              <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                <div><dt className="text-ink-dim">URL de origen</dt><dd className="break-all text-ink">{lead.originUrl || "—"}</dd></div>
                <div>
                  <dt className="text-ink-dim">UTM</dt>
                  <dd className="text-ink">{[lead.utmSource, lead.utmMedium, lead.utmCampaign, lead.utmTerm, lead.utmContent].filter(Boolean).join(" / ") || "—"}</dd>
                </div>
                <div>
                  <dt className="text-ink-dim">Privacidad aceptada</dt>
                  <dd className="text-ink">{lead.privacyAcceptedAt ? `${fmt.format(lead.privacyAcceptedAt)} · versión ${lead.privacyVersion}` : "—"}</dd>
                </div>
              </dl>
            </details>
          </Panel>

          <Panel title="Responder con plantilla" description="Prepara el mensaje con los datos del prospecto. El envío siempre es una acción explícita del equipo.">
            <TemplateComposer leadId={lead.id} phone={lead.phone} email={lead.email} templates={settings.crmTemplates.templates} vars={vars} senderEmail={settings.contact.email} />
          </Panel>

          <Panel title="Seguimiento">
            <NoteForm leadId={lead.id} />
            <ol className="mt-6 space-y-4 border-l border-luna-50/15 pl-5">
              {lead.activities.map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full bg-luna-300" aria-hidden="true" />
                  <p className="text-xs text-ink-dim">
                    {TYPE_LABEL[a.type]} · {fmt.format(a.createdAt)}
                    {a.author ? ` · ${a.author.name}` : ""}
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink">{a.body}</p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel>
            <StatusForm leadId={lead.id} status={lead.status} />
            <div className="mt-6 border-t border-luna-50/10 pt-5">
              <AssignForm leadId={lead.id} current={lead.assignedTo?.id ?? null} users={users} />
            </div>
          </Panel>

          <Panel title="Cita">
            <div className="space-y-3 text-sm">
              <p className="flex gap-2">
                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
                <span>
                  <span className="block text-ink-dim">Preferencia del prospecto (no confirmada)</span>
                  <span className="text-white">{pref || "Sin preferencia indicada"}</span>
                </span>
              </p>
              <p className="flex gap-2">
                <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                <span>
                  <span className="block text-ink-dim">Horario acordado</span>
                  <span className="text-white">
                    {lead.agreedAt ? `${fmt.format(lead.agreedAt)} (hora de Ecuador)` : "Aún no confirmado"}
                  </span>
                  {lead.confirmedAt && (
                    <span className="block text-xs text-ink-dim">Confirmada el {fmt.format(lead.confirmedAt)}{confirmedBy ? ` por ${confirmedBy}` : ""}</span>
                  )}
                </span>
              </p>
            </div>
            <div className="mt-5 border-t border-luna-50/10 pt-5">
              <AppointmentForm leadId={lead.id} agreedLocal={toLocalEcuador(lead.agreedAt)} confirmed={lead.status === "CITA_CONFIRMADA"} />
            </div>
          </Panel>

          <Panel title="Contacto rápido">
            <div className="grid gap-2 text-sm">
              <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 text-ink-muted hover:text-white">
                <Phone className="h-4 w-4" aria-hidden="true" /> Llamar a {lead.phone}
              </a>
            </div>
          </Panel>

          <details className="rounded-2xl border border-luna-50/10 bg-luna-700/25 p-5">
            <summary className="cursor-pointer font-semibold">Editar datos</summary>
            <div className="mt-5">
              <LeadEditForm
                compact
                services={services}
                lead={{
                  id: lead.id, name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, serviceSlug: lead.serviceSlug,
                  message: lead.message, contactPref: lead.contactPref, country: lead.country,
                  preferredDate: lead.preferredDate?.toISOString().slice(0, 10), preferredSlot: lead.preferredSlot,
                }}
              />
            </div>
          </details>

          <form action={deleteLeadAction} className="rounded-2xl border border-rose-400/20 p-5">
            <input type="hidden" name="leadId" value={lead.id} />
            <p className="text-sm font-semibold text-rose-200">Eliminar prospecto</p>
            <p className="mt-1 text-xs text-ink-muted">Para atender solicitudes de eliminación de datos personales. Esta acción no se puede deshacer y queda registrada en auditoría.</p>
            <div className="mt-3">
              <ConfirmButton message="¿Eliminar definitivamente este prospecto y todo su historial?" className="btn-secondary btn-sm border-rose-400/40 text-rose-200">
                Eliminar definitivamente
              </ConfirmButton>
            </div>
          </form>
        </div>
      </div>
    </AdminPage>
  );
}
