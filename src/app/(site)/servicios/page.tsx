import { getBlock } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { getServices } from "@/lib/public-data";
import { pageMetadata } from "@/lib/seo";
import { waLink } from "@/lib/whatsapp";
import { PageHeader } from "@/components/site/PageHeader";
import { Objectives, ServiceCard } from "@/components/site/sections";
import { WaLink } from "@/components/site/TrackedLinks";
import Link from "next/link";

export const revalidate = 3600;

export async function generateMetadata() {
  return pageMetadata({
    path: "/servicios",
    title: "Servicios de desarrollo de software, integraciones y consultoría",
    description:
      "Software a medida, aplicaciones web y móviles, páginas web, APIs e integraciones, CRM Kommo y GoHighLevel, gamificación y consultoría tecnológica para empresas de Latinoamérica.",
  });
}

export default async function ServicesPage() {
  const [home, settings, services] = await Promise.all([getBlock("home"), getSettings(), getServices()]);
  const { contact, cta } = settings;
  return (
    <>
      <PageHeader crumbs={[{ name: "Servicios", href: "/servicios" }]} eyebrow={home.services.eyebrow} title={home.services.title} intro={home.services.intro} />
      <section className="pb-20" aria-label="Catálogo de servicios">
        <div data-reveal-group className="container-site grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <ServiceCard key={s.id} s={s} whatsappNumber={contact.whatsappNumber} waEnabled={cta.whatsappEnabled} />
          ))}
        </div>
      </section>
      <Objectives data={home.objectives} />
      <section className="section pt-0">
        <div className="container-site">
          <div data-reveal="zoom" className="card flex flex-col gap-6 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">¿No sabes por dónde empezar?</h2>
              <p className="mt-2 max-w-2xl text-ink-muted">Cuéntanos tu reto y te orientamos sobre la solución más adecuada para tu negocio.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/contacto#formulario" className="btn-primary">Agenda una consultoría</Link>
              {cta.whatsappEnabled && (
                <WaLink href={waLink(contact.whatsappNumber, cta.whatsappGeneralText)} location="servicios_cierre">Hablemos por WhatsApp</WaLink>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
