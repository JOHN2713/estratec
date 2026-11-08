import { Clock, Mail, MessageCircle } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getServices } from "@/lib/public-data";
import { pageMetadata } from "@/lib/seo";
import { waLink } from "@/lib/whatsapp";
import { PageHeader } from "@/components/site/PageHeader";
import { LeadForm } from "@/components/site/LeadForm";
import { EmailLink, WaLink } from "@/components/site/TrackedLinks";

export const revalidate = 3600;

export async function generateMetadata() {
  return pageMetadata({
    path: "/contacto",
    title: "Contacto: agenda una consultoría",
    description: "Cuéntanos tu reto tecnológico. Solicita una consultoría con Estratec por formulario, WhatsApp o correo.",
  });
}

export default async function ContactPage() {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const { contact, cta } = settings;
  const wa = waLink(contact.whatsappNumber, cta.whatsappGeneralText);
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Contacto", href: "/contacto" }]}
        eyebrow="Contacto"
        title="¿Tienes un reto tecnológico? Conversemos."
        intro="Cuéntanos qué necesitas mejorar, automatizar o desarrollar. Revisaremos tu requerimiento y te orientaremos sobre los siguientes pasos."
      />
      <section className="pb-24">
        <div className="container-site grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
          <div id="formulario" className="scroll-mt-24">
            <h2 className="sr-only">Formulario de solicitud de asesoría</h2>
            <LeadForm
              services={services.map((s) => ({ slug: s.slug, name: s.name }))}
              whatsappHref={wa}
              disabledText={cta.formEnabled ? null : cta.formDisabledText}
            />
          </div>
          <aside className="space-y-4">
            {cta.whatsappEnabled && (
              <div className="card p-6">
                <MessageCircle className="h-6 w-6 text-luna-50" aria-hidden="true" />
                <h2 className="mt-3 text-lg font-semibold">WhatsApp</h2>
                <p className="mt-1 text-sm text-ink-muted">La forma más rápida de iniciar la conversación.</p>
                <p className="mt-2 font-medium text-white">{contact.whatsappDisplay}</p>
                <WaLink href={wa} location="contacto_lateral" className="btn-whatsapp mt-4 w-full">Escribir por WhatsApp</WaLink>
              </div>
            )}
            <div className="card p-6">
              <Mail className="h-6 w-6 text-luna-50" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-semibold">Correo</h2>
              <p className="mt-2 break-all text-sm">
                <EmailLink email={contact.email} location="contacto_lateral" />
              </p>
            </div>
            {(contact.businessHours || contact.hoursNote) && (
              <div className="card p-6">
                <Clock className="h-6 w-6 text-luna-50" aria-hidden="true" />
                <h2 className="mt-3 text-lg font-semibold">Horario de atención</h2>
                {contact.businessHours && <p className="mt-2 text-sm text-ink">{contact.businessHours}</p>}
                {contact.hoursNote && <p className="mt-1 text-sm text-ink-muted">{contact.hoursNote}</p>}
              </div>
            )}
            <div className="rounded-2xl border border-dashed border-luna-50/15 p-5 text-sm text-ink-muted">
              <strong className="text-white">Sobre las citas:</strong> la fecha y hora que propongas son una preferencia. Una persona del equipo
              te contactará para confirmar el horario; la cita solo queda agendada después de esa confirmación.
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
