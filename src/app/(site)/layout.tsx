import Link from "next/link";
import { draftMode } from "next/headers";
import { getSettings } from "@/lib/settings";
import { getServices } from "@/lib/public-data";
import { waLink } from "@/lib/whatsapp";
import { getBlock } from "@/lib/content";
import { Logo } from "@/components/ui/Logo";
import { SiteHeader, type NavItem } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { Analytics } from "@/components/site/Analytics";

const NAV: NavItem[] = [
  { href: "/servicios", label: "Servicios" },
  { href: "/#soluciones", label: "Soluciones" },
  { href: "/#como-trabajamos", label: "Cómo trabajamos" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/recursos", label: "Recursos" },
  { href: "/contacto", label: "Contacto" },
];

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, services, terms, draft] = await Promise.all([getSettings(), getServices(), getBlock("terms"), draftMode()]);
  const wa = waLink(settings.contact.whatsappNumber, settings.cta.whatsappGeneralText);

  return (
    <>
      {draft.isEnabled && (
        <div className="relative z-50 bg-amber-300 px-4 py-2 text-center text-sm font-medium text-amber-950">
          Vista previa: se muestran contenidos en borrador.{" "}
          <Link href="/api/preview/exit" prefetch={false} className="underline">Salir de la vista previa</Link>
        </div>
      )}
      <SiteHeader nav={NAV} logo={<Logo size="md" />} />
      <main id="contenido">{children}</main>
      <SiteFooter settings={settings} services={services.map((s) => ({ slug: s.slug, name: s.shortName }))} showTerms={terms.enabled && !!terms.body} />
      {settings.cta.whatsappEnabled && settings.cta.floatingWhatsapp && <WhatsAppFloat href={wa} />}
      <Analytics ga4Id={settings.analytics.ga4Id} gtmId={settings.analytics.gtmId} requireConsent={settings.analytics.requireConsent} />
    </>
  );
}
