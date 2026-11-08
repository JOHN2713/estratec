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
import { FaqList, SectionHeading, ServiceCard } from "@/components/site/sections";
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
      <PageHeader
        crumbs={[{ name: "Servicios", href: "/servicios" }, { name: s.shortName, href: `/servicios/${s.slug}` }]}
        eyebrow={s.shortName}
        title={s.h1}
        intro={s.intro}
        icon={<ServiceIcon name={s.icon} className="h-7 w-7" />}
      >
        <div className="animate-rise mt-9 flex flex-col gap-3 sm:flex-row" style={{ "--d": 380 } as React.CSSProperties}>
          <a href="#formulario" className="btn-primary group">
            {s.ctaLabel} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
          {cta.whatsappEnabled && (
            <WaLink href={wa} service={s.slug} location="servicio_hero" className="btn-secondary">
              Hablemos por WhatsApp
            </WaLink>
          )}
        </div>
      </PageHeader>

      <div className="container-site grid gap-12 pb-24 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
        <div className="min-w-0 space-y-20">
          {s.image && (
            <div data-reveal="zoom" className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-luna-50/10">
              <Image src={s.image} alt={s.imageAlt ?? ""} fill priority sizes="(min-width:1024px) 760px, 100vw" className="object-cover" />
            </div>
          )}

          <section aria-labelledby="problema" data-reveal-group>
            <p data-reveal className="eyebrow">El reto</p>
            <h2 data-reveal id="problema" className="mt-3 text-2xl font-bold sm:text-3xl">¿Qué problema resuelve?</h2>
            <div data-reveal className="mt-6 rounded-2xl border-l-2 border-luna-300 bg-gradient-to-r from-luna-700/50 to-transparent py-5 pl-6 pr-4">
              <p className="text-[17px] leading-relaxed text-ink">{s.problem}</p>
            </div>
          </section>

          {s.includes.length > 0 && (
            <section aria-labelledby="incluye">
              <SectionHeading id="incluye" eyebrow="Alcance" title="¿Qué incluye?" />
              <ul data-reveal-group className="mt-8 grid gap-3 sm:grid-cols-2">
                {s.includes.map((x, i) => (
                  <li data-reveal key={x} className="card card-hover flex gap-4 p-5">
                    <span className="font-display text-sm font-bold tabular-nums text-luna-300">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[15px] leading-relaxed text-ink">{x}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {s.solutions.length > 0 && (
            <section aria-labelledby="soluciones-servicio">
              <SectionHeading id="soluciones-servicio" eyebrow="Ejemplos" title="Posibles soluciones" />
              <ul data-reveal-group className="mt-8 flex flex-wrap gap-2.5">
                {s.solutions.map((x) => (
                  <li
                    data-reveal
                    key={x}
                    className="rounded-full border border-luna-50/15 bg-luna-700/40 px-4 py-2 text-sm text-ink transition hover:border-luna-300/50 hover:bg-luna-300/10"
                  >
                    {x}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="proceso">
            <SectionHeading id="proceso" eyebrow="Metodología" title="¿Cómo funciona?" />
            <ol
              data-reveal-group
              className="relative mt-10 space-y-6 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-px before:bg-gradient-to-b before:from-luna-300/70 before:via-luna-300/30 before:to-transparent"
            >
              {home.process.steps.map((st, i) => (
                <li data-reveal="left" key={st.title} className="relative flex gap-5">
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-luna-300/50 bg-luna-900 font-display text-sm font-bold text-luna-50 shadow-[0_0_20px_-6px_#54ACBF]">
                    {i + 1}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="text-base font-semibold sm:text-lg">{st.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted sm:text-[15px]">{st.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            {home.process.note && <p data-reveal className="mt-6 pl-[60px] text-sm text-ink-dim">{home.process.note}</p>}
          </section>

          {s.deliverables.length > 0 && (
            <section aria-labelledby="entregables">
              <SectionHeading id="entregables" eyebrow="Resultado" title="Entregables" intro="Se ajustan al alcance acordado para cada proyecto." />
              <ul data-reveal-group className="mt-8 grid gap-3 sm:grid-cols-2">
                {s.deliverables.map((x) => (
                  <li data-reveal key={x} className="card card-hover flex items-start gap-3 p-5">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-luna-300/15 text-luna-50">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-[15px] leading-relaxed text-ink">{x}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {s.faqs.length > 0 && (
            <section aria-labelledby="faq-servicio">
              <SectionHeading id="faq-servicio" eyebrow="Dudas comunes" title="Preguntas frecuentes" />
              <div className="mt-8">
                <FaqList faqs={s.faqs} />
              </div>
            </section>
          )}

          <section id="formulario" aria-labelledby="solicitar" className="scroll-mt-24">
            <SectionHeading
              id="solicitar"
              eyebrow="Siguiente paso"
              title="¿Cómo solicitar una asesoría?"
              intro="Completa el formulario y te contactaremos para conversar sobre tu proyecto. También puedes escribirnos directamente por WhatsApp."
            />
            <div data-reveal className="mt-8">
              <LeadForm
                services={all.map((x) => ({ slug: x.slug, name: x.name }))}
                defaultService={s.slug}
                whatsappHref={wa}
                disabledText={cta.formEnabled ? null : cta.formDisabledText}
              />
            </div>
          </section>
        </div>

        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div data-reveal="right" className="card relative overflow-hidden p-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-luna-300/20 blur-3xl" aria-hidden="true" />
            <span className="icon-tile relative">
              <ServiceIcon name={s.icon} />
            </span>
            <h2 className="relative mt-5 text-lg font-semibold">¿Para quién es?</h2>
            <p className="relative mt-2 text-sm leading-relaxed text-ink-muted">{s.forWho}</p>
            <div className="relative mt-6 grid gap-2.5">
              <a href="#formulario" className="btn-primary w-full">{s.ctaLabel}</a>
              {cta.whatsappEnabled && (
                <WaLink href={wa} service={s.slug} location="servicio_lateral" className="btn-whatsapp w-full">
                  WhatsApp
                </WaLink>
              )}
            </div>
            <p className="relative mt-4 text-xs leading-relaxed text-ink-dim">Sin compromiso: revisamos tu caso y te orientamos sobre los siguientes pasos.</p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section relative" aria-labelledby="relacionados">
          <div className="divider-glow" aria-hidden="true" />
          <div className="container-site">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading id="relacionados" eyebrow="Explora" title="Otros servicios" />
              <Link data-reveal href="/servicios" className="btn-secondary btn-sm">Ver todos los servicios</Link>
            </div>
            <div data-reveal-group className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => <ServiceCard key={r.id} s={r} whatsappNumber={contact.whatsappNumber} waEnabled={cta.whatsappEnabled} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
