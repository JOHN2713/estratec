import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import type { Settings } from "@/lib/settings";
import { waLink } from "@/lib/whatsapp";
import { Logo } from "@/components/ui/Logo";
import { EmailLink, WaLink } from "./TrackedLinks";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M16.6 3c.3 2.2 1.6 3.7 3.9 3.9v3a7 7 0 0 1-3.9-1.2v6.1a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6 0 .9.1v3.1a2.8 2.8 0 1 0 2 2.7V3h2.9Z" />
    </svg>
  );
}

export function SiteFooter({
  settings,
  services,
  showTerms,
}: {
  settings: Settings;
  services: { slug: string; name: string }[];
  showTerms: boolean;
}) {
  const { contact, social, org, cta } = settings;
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-luna-50/10 bg-[#01132d]">
      <div className="container-site grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo size="md" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">{org.shortDescription}</p>
          <div className="mt-5 flex gap-2">
            {social.instagramUrl && (
              <a href={social.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost h-10 w-10 !px-0" aria-label={`Instagram ${social.instagramHandle}`}>
                <InstagramIcon />
              </a>
            )}
            {social.tiktokUrl && (
              <a href={social.tiktokUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost h-10 w-10 !px-0" aria-label={`TikTok ${social.tiktokHandle}`}>
                <TikTokIcon />
              </a>
            )}
          </div>
        </div>

        <nav aria-label="Servicios">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Servicios</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/servicios/${s.slug}`} className="text-ink-muted hover:text-white">{s.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Secciones">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Estratec</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              ["/#soluciones", "Soluciones"],
              ["/#como-trabajamos", "Cómo trabajamos"],
              ["/proyectos", "Proyectos"],
              ["/#nosotros", "Nosotros"],
              ["/recursos", "Recursos"],
              ["/contacto", "Contacto"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-ink-muted hover:text-white">{label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Contacto</h2>
          <ul className="mt-4 space-y-3 text-sm text-ink-muted">
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-luna-300" aria-hidden="true" />
              {cta.whatsappEnabled ? (
                <WaLink href={waLink(contact.whatsappNumber, cta.whatsappGeneralText)} location="footer" className="hover:text-white" icon={false}>
                  {contact.whatsappDisplay}
                </WaLink>
              ) : (
                <a href={`tel:+${contact.whatsappNumber}`} className="hover:text-white">{contact.whatsappDisplay}</a>
              )}
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-luna-300" aria-hidden="true" />
              <EmailLink email={contact.email} location="footer" className="break-all hover:text-white" />
            </li>
            {contact.businessHours && <li className="pl-6.5 text-ink-dim">{contact.businessHours}</li>}
          </ul>
          <Link href="/contacto#formulario" className="btn-primary btn-sm mt-5">Agendar consultoría</Link>
        </div>
      </div>
      <div className="border-t border-luna-50/10">
        <div className="container-site flex flex-col gap-3 py-6 text-xs text-ink-dim sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {org.legalName || "Estratec"}. Todos los derechos reservados.
          </p>
          <ul className="flex gap-5">
            <li><Link href="/politica-de-privacidad" className="hover:text-white">Política de privacidad</Link></li>
            {showTerms && <li><Link href="/terminos" className="hover:text-white">Términos de uso</Link></li>}
          </ul>
        </div>
      </div>
    </footer>
  );
}
