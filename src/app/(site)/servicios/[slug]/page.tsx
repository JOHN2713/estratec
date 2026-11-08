import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { db } from "@/lib/db";
import { getBlock } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { getService, getServices } from "@/lib/public-data";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site-url";
import { waLink } from "@/lib/whatsapp";
import { JsonLd } from "@/components/ui/JsonLd";
import { ServiceIcon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/site/PageHeader";
import { FaqList, ServiceCard } from "@/components/site/sections";
import { ServiceViewTracker, WaLink } from "@/components/site/TrackedLinks";
import { LeadForm } from "@/components/site/LeadForm";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const rows = await db.service.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
    return rows.map((r) => ({ slug: r.slug }));
  } catch {
    return [];
  }
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return {};
  return pageMetadata({ path: `/servicios/${s.slug}`, title: s.h1, description: s.summary, seo: s.seo, image: s.image });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const [s, settings, all, home] = await Promise.all([getService(slug), getSettings(), getServices(), getBlock("home")]);
  if (!s) notFound();
  const { contact, cta } = settings;
  const wa = waLink(contact.whatsappNumber, s.whatsappText);
  const related = all.filter((x) => x.slug !== s.slug).slice(0, 3);

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    serviceType: s.shortName,
    description: s.intro,
    url: siteUrl(`/servicios/${s.slug}`),
    areaServed: { "@type": "Place", name: settings.org.areaServed || "Latinoamérica" },
    provider: { "@type": "Organization", "@id": `${siteUrl()}/#organization`, name: "Estratec", url: siteUrl() },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Soluciones de ${s.shortName}`,
      itemListElement: s.solutions.map((x) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: x } })),
    },
  };
  const faqLd = s.faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: s.faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
      }
    : null;

  return (
    <>
      <JsonLd data={serviceLd} />
      {faqLd && <JsonLd data={faqLd} />}
      <ServiceViewTracker slug={s.slug} />
      <PageHeader crumbs={[{ name: "Servicios", href: "/servicios" }, { name: s.shortName, href: `/servicios/${s.slug}` }]} title={s.h1} intro={s.intro}>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#formulario" className="btn-primary">
            {s.ctaLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          {cta.whatsappEnabled && <WaLink href={wa} service={s.slug} location="servicio_hero">Hablemos por WhatsApp</WaLink>}
        </div>
      </PageHeader>

      <div className="container-site grid gap-12 pb-20 lg:grid-cols-[1fr_340px]">
        <div className="space-y-14">
          {s.image && (
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-luna-50/10">
              <Image src={s.image} alt={s.imageAlt ?? ""} fill priority sizes="(min-width:1024px) 760px, 100vw" className="object-cover" />
            </div>
          )}

          <section aria-labelledby="problema">
            <h2 id="problema" className="text-2xl font-bold sm:text-3xl">¿Qué problema resuelve?</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-muted">{s.problem}</p>
          </section>

          {s.includes.length > 0 && (
            <section aria-labelledby="incluye">
              <h2 id="incluye" className="text-2xl font-bold sm:text-3xl">¿Qué incluye?</h2>
              <ul className="mt-5 grid gap-3">
                {s.includes.map((x) => (
                  <li key={x} className="flex gap-3 text-ink-muted">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-luna-50" aria-hidden="true" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {s.solutions.length > 0 && (
            <section aria-labelledby="soluciones-servicio">
              <h2 id="soluciones-servicio" className="text-2xl font-bold sm:text-3xl">Posibles soluciones</h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {s.solutions.map((x) => (
                  <li key={x} className="rounded-full border border-luna-50/15 bg-luna-700/40 px-4 py-2 text-sm text-ink">{x}</li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="proceso">
            <h2 id="proceso" className="text-2xl font-bold sm:text-3xl">¿Cómo funciona?</h2>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2">
              {home.process.steps.map((st, i) => (
                <li key={st.title} className="card p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-luna-300">Paso {i + 1}</p>
                  <h3 className="mt-1 text-base font-semibold">{st.title}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{st.text}</p>
                </li>
              ))}
            </ol>
            {home.process.note && <p className="mt-4 text-sm text-ink-dim">{home.process.note}</p>}
          </section>

          {s.deliverables.length > 0 && (
            <section aria-labelledby="entregables">
              <h2 id="entregables" className="text-2xl font-bold sm:text-3xl">Entregables</h2>
              <p className="mt-2 text-sm text-ink-dim">Se ajustan al alcance acordado para cada proyecto.</p>
              <ul className="mt-5 grid gap-3">
                {s.deliverables.map((x) => (
                  <li key={x} className="flex gap-3 text-ink-muted">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-luna-50" aria-hidden="true" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {s.faqs.length > 0 && (
            <section aria-labelledby="faq-servicio">
              <h2 id="faq-servicio" className="mb-5 text-2xl font-bold sm:text-3xl">Preguntas frecuentes</h2>
              <FaqList faqs={s.faqs} />
            </section>
          )}

          <section id="formulario" aria-labelledby="solicitar" className="scroll-mt-24">
            <h2 id="solicitar" className="text-2xl font-bold sm:text-3xl">¿Cómo solicitar una asesoría?</h2>
            <p className="mb-6 mt-3 text-ink-muted">Completa el formulario y te contactaremos para conversar sobre tu proyecto. También puedes escribirnos directamente por WhatsApp.</p>
            <LeadForm
              services={all.map((x) => ({ slug: x.slug, name: x.name }))}
              defaultService={s.slug}
              whatsappHref={wa}
              disabledText={cta.formEnabled ? null : cta.formDisabledText}
            />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-luna-500/50 to-luna-700 text-luna-50">
              <ServiceIcon name={s.icon} />
            </div>
            <h2 className="mt-4 text-lg font-semibold">¿Para quién es?</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.forWho}</p>
            <div className="mt-6 grid gap-2.5">
              <a href="#formulario" className="btn-primary">{s.ctaLabel}</a>
              {cta.whatsappEnabled && <WaLink href={wa} service={s.slug} location="servicio_lateral">WhatsApp</WaLink>}
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section border-t border-luna-50/10" aria-labelledby="relacionados">
          <div className="container-site">
            <h2 id="relacionados" className="text-2xl font-bold sm:text-3xl">Otros servicios</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => <ServiceCard key={r.id} s={r} whatsappNumber={contact.whatsappNumber} waEnabled={cta.whatsappEnabled} />)}
            </div>
            <Link href="/servicios" className="btn-secondary mt-8">Ver todos los servicios</Link>
          </div>
        </section>
      )}
    </>
  );
}
