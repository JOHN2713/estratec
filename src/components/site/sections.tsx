import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import type { Faq, Project, Service } from "@prisma/client";
import type { Blocks } from "@/lib/content";
import { waLink } from "@/lib/whatsapp";
import { ServiceIcon } from "@/components/ui/Icon";
import { CoreVisual } from "./CoreVisual";
import { WaLink } from "./TrackedLinks";

type Home = Blocks["home"];

export function SectionHeading({ eyebrow, title, intro, center }: { eyebrow?: string; title: string; intro?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="section-title">{title}</h2>
      {intro && <p className={`section-intro ${center ? "mx-auto" : ""}`}>{intro}</p>}
    </div>
  );
}

// ───────────────────────────── Hero ─────────────────────────────
export function Hero({ hero }: { hero: Home["hero"] }) {
  return (
    <section className="relative overflow-hidden pb-16 pt-10 sm:pt-14 lg:pb-24 lg:pt-16">
      <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-60" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[620px] w-[620px] rounded-full bg-luna-500/25 blur-[120px]" aria-hidden="true" />
      <div className="container-site relative grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        <div>
          {hero.eyebrow && (
            <p className="inline-flex items-center gap-2 rounded-full border border-luna-50/20 bg-luna-700/40 px-3.5 py-1.5 text-xs font-medium text-luna-50">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {hero.eyebrow}
            </p>
          )}
          <h1 className="mt-5 text-[2.35rem] font-extrabold leading-[1.08] sm:text-5xl lg:text-[3.6rem]">
            <span className="text-gradient">{hero.title}</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">{hero.subtitle}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/contacto#formulario" className="btn-primary">
              {hero.ctaPrimary} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/#servicios" className="btn-secondary">{hero.ctaSecondary}</Link>
          </div>
        </div>
        <CoreVisual labels={hero.coreLabels} />
      </div>
    </section>
  );
}

// ───────────────────────────── Capacidades ─────────────────────────────
export function CapabilityStrip({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <section aria-label="Capacidades" className="border-y border-luna-50/10 bg-luna-700/20">
      <ul className="container-site flex flex-wrap items-center justify-center gap-2.5 py-5 text-sm font-medium text-ink-muted sm:text-[15px]">
        {items.map((c) => (
          <li key={c} className="flex items-center gap-2 rounded-full border border-luna-50/10 bg-luna-900/40 px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-luna-300" aria-hidden="true" />
            {c}
          </li>
        ))}
      </ul>
    </section>
  );
}

// ───────────────────────────── Problemas ─────────────────────────────
export function Problems({ data, services }: { data: Home["problems"]; services: Service[] }) {
  const bySlug = new Map(services.map((s) => [s.slug, s]));
  return (
    <section className="section" aria-labelledby="problemas-title">
      <div className="container-site">
        <div className="max-w-3xl">
          <h2 id="problemas-title" className="section-title">{data.title}</h2>
          {data.intro && <p className="section-intro">{data.intro}</p>}
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((p) => {
            const related = p.serviceSlugs.map((s) => bySlug.get(s)).filter(Boolean) as Service[];
            return (
              <li key={p.title} className="card flex flex-col p-6">
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{p.text}</p>
                {related.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Servicios relacionados">
                    {related.map((s) => (
                      <li key={s.slug}>
                        <Link href={`/servicios/${s.slug}`} className="inline-flex items-center gap-1 rounded-full border border-luna-300/30 px-3 py-1 text-xs font-medium text-luna-50 hover:border-luna-50 hover:bg-luna-300/10">
                          {s.shortName} <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

// ───────────────────────────── Servicios ─────────────────────────────
export function ServiceCard({ s, whatsappNumber, waEnabled }: { s: Service; whatsappNumber: string; waEnabled: boolean }) {
  return (
    <article className="card card-hover group flex flex-col p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-luna-50/20 bg-gradient-to-br from-luna-500/50 to-luna-700 text-luna-50">
        <ServiceIcon name={s.icon} />
      </div>
      <h3 className="mt-5 text-lg font-semibold leading-snug">
        <Link href={`/servicios/${s.slug}`} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
          {s.name}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{s.summary}</p>
      <div className="relative z-10 mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-luna-50/10 pt-4">
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-luna-50" aria-hidden="true">
          Conocer solución <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
        {waEnabled ? (
          <WaLink
            href={waLink(whatsappNumber, s.whatsappText)}
            service={s.slug}
            location="tarjeta_servicio"
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-ink-muted hover:bg-white/5 hover:text-white"
            ariaLabel={`Consultar por WhatsApp sobre ${s.name}`}
          >
            WhatsApp
          </WaLink>
        ) : (
          <Link href={`/contacto?servicio=${s.slug}#formulario`} className="ml-auto text-sm font-medium text-ink-muted hover:text-white">
            Solicitar asesoría
          </Link>
        )}
      </div>
    </article>
  );
}

export function ServicesGrid({ data, services, whatsappNumber, waEnabled }: { data: Home["services"]; services: Service[]; whatsappNumber: string; waEnabled: boolean }) {
  return (
    <section id="servicios" className="section relative" aria-labelledby="servicios-title">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-luna-300/30 to-transparent" aria-hidden="true" />
      <div className="container-site">
        <div className="max-w-3xl">
          <p className="eyebrow">{data.eyebrow}</p>
          <h2 id="servicios-title" className="section-title">{data.title}</h2>
          {data.intro && <p className="section-intro">{data.intro}</p>}
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <ServiceCard key={s.id} s={s} whatsappNumber={whatsappNumber} waEnabled={waEnabled} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────── Objetivos ─────────────────────────────
export function Objectives({ data }: { data: Home["objectives"] }) {
  return (
    <section id="soluciones" className="section bg-gradient-to-b from-transparent via-luna-700/25 to-transparent" aria-labelledby="soluciones-title">
      <div className="container-site">
        <div className="max-w-3xl">
          <p className="eyebrow">{data.eyebrow}</p>
          <h2 id="soluciones-title" className="section-title">{data.title}</h2>
          {data.intro && <p className="section-intro">{data.intro}</p>}
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((o, i) => (
            <li key={o.title}>
              <Link
                href={o.serviceSlug ? `/servicios/${o.serviceSlug}` : "/servicios"}
                className="card card-hover group flex h-full items-start gap-4 p-6"
              >
                <span className="font-display text-3xl font-extrabold text-luna-300/60 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1">
                  <span className="flex items-center justify-between gap-3 text-lg font-semibold text-white">
                    {o.title}
                    <ArrowRight className="h-4 w-4 shrink-0 text-luna-50 transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-ink-muted">{o.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ───────────────────────────── Cómo trabajamos ─────────────────────────────
// Escritorio: pasos 1-3 a la izquierda (arriba→abajo), 4-6 a la derecha (abajo→arriba) y el ciclo al centro.
const LG_POS = [
  "lg:col-start-1 lg:row-start-1",
  "lg:col-start-1 lg:row-start-2",
  "lg:col-start-1 lg:row-start-3",
  "lg:col-start-3 lg:row-start-3",
  "lg:col-start-3 lg:row-start-2",
  "lg:col-start-3 lg:row-start-1",
];

export function Process({ data }: { data: Home["process"] }) {
  const steps = data.steps;
  const cyclic = steps.length === 6;
  return (
    <section id="como-trabajamos" className="section" aria-labelledby="proceso-title">
      <div className="container-site">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">{data.eyebrow}</p>
          <h2 id="proceso-title" className="section-title">{data.title}</h2>
          {data.intro && <p className="section-intro mx-auto">{data.intro}</p>}
        </div>
        <ol className={`relative mt-14 grid gap-4 sm:grid-cols-2 ${cyclic ? "lg:grid-cols-[1fr_minmax(240px,300px)_1fr] lg:grid-rows-3 lg:gap-x-8" : "lg:grid-cols-3"}`}>
          {cyclic && (
            <li aria-hidden="true" className="pointer-events-none hidden lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:flex lg:items-center lg:justify-center">
              <svg viewBox="0 0 300 300" className="w-full max-w-[300px]">
                <defs>
                  <marker id="pc-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M0 0 10 5 0 10z" fill="#A7EBF2" />
                  </marker>
                </defs>
                <circle cx="150" cy="150" r="125" fill="none" stroke="#A7EBF2" strokeOpacity="0.15" />
                <path d="M 64 59 A 125 125 0 0 0 64 241" fill="none" stroke="#54ACBF" strokeWidth="2" markerEnd="url(#pc-arrow)" />
                <path d="M 236 241 A 125 125 0 0 0 236 59" fill="none" stroke="#54ACBF" strokeWidth="2" markerEnd="url(#pc-arrow)" />
                <path d="M 90 248 A 125 125 0 0 0 210 248" fill="none" stroke="#54ACBF" strokeOpacity=".5" strokeWidth="2" strokeDasharray="4 6" />
                <path d="M 210 52 A 125 125 0 0 0 90 52" fill="none" stroke="#54ACBF" strokeOpacity=".5" strokeWidth="2" strokeDasharray="4 6" markerEnd="url(#pc-arrow)" />
                <circle cx="150" cy="150" r="72" fill="#023859" fillOpacity="0.7" stroke="#54ACBF" strokeOpacity="0.45" />
                <text x="150" y="142" textAnchor="middle" fill="#A7EBF2" fontSize="12" fontWeight="700" letterSpacing="3">CICLO</text>
                <text x="150" y="164" textAnchor="middle" fill="#EAF4F7" fontSize="15" fontWeight="600">Estratec</text>
              </svg>
            </li>
          )}
          {steps.map((s, i) => (
            <li key={s.title} className={`card p-5 ${cyclic ? LG_POS[i] : ""}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-luna-300 to-luna-50 font-display text-sm font-extrabold text-luna-900">
                  {i + 1}
                </span>
                <h3 className="text-base font-semibold">{s.title}</h3>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{s.text}</p>
            </li>
          ))}
        </ol>
        {data.note && <p className="mt-10 text-center text-sm text-ink-dim">{data.note}</p>}
      </div>
    </section>
  );
}

// ───────────────────────────── Proyectos ─────────────────────────────
export function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="card card-hover group flex flex-col overflow-hidden">
      {p.image ? (
        <div className="relative aspect-[16/10] bg-luna-700">
          <Image src={p.image} alt={p.imageAlt ?? ""} fill sizes="(min-width:1024px) 380px, (min-width:640px) 50vw, 100vw" className="object-cover" loading="lazy" />
        </div>
      ) : (
        <div className="aspect-[16/10] bg-gradient-to-br from-luna-500/40 to-luna-700" aria-hidden="true" />
      )}
      <div className="flex flex-1 flex-col p-6">
        {p.sector && <p className="text-xs font-semibold uppercase tracking-wider text-luna-300">{p.sector}</p>}
        <h3 className="mt-2 text-lg font-semibold">
          <Link href={`/proyectos/${p.slug}`} className="after:absolute after:inset-0">{p.title}</Link>
        </h3>
        <p className="mt-2 flex-1 text-sm text-ink-muted">{p.summary}</p>
        {p.tech.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {p.tech.slice(0, 5).map((t) => (
              <li key={t} className="rounded-md bg-luna-900/60 px-2 py-0.5 text-xs text-ink-muted">{t}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export function ProjectsSection({ data, projects }: { data: Home["projects"]; projects: Project[] }) {
  return (
    <section id="proyectos" className="section" aria-labelledby="proyectos-title">
      <div className="container-site">
        {projects.length > 0 ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-3xl">
                <p className="eyebrow">{data.eyebrow}</p>
                <h2 id="proyectos-title" className="section-title">{data.title}</h2>
                {data.intro && <p className="section-intro">{data.intro}</p>}
              </div>
              <Link href="/proyectos" className="btn-secondary">Ver todos</Link>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 3).map((p) => <ProjectCard key={p.id} p={p} />)}
            </div>
          </>
        ) : (
          <div className="card relative overflow-hidden p-8 sm:p-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-luna-300/20 blur-3xl" aria-hidden="true" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow">{data.eyebrow}</p>
                <h2 id="proyectos-title" className="mt-3 text-2xl font-bold sm:text-3xl">{data.emptyTitle}</h2>
                <p className="mt-3 text-ink-muted">{data.emptyText}</p>
              </div>
              <Link href="/contacto#formulario" className="btn-primary shrink-0">
                Cuéntanos tu proyecto <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ───────────────────────────── ¿Por qué Estratec? ─────────────────────────────
export function Why({ data }: { data: Home["why"] }) {
  const pillars = ["Entender", "Orientar", "Construir", "Acompañar"];
  return (
    <section id="nosotros" className="section relative overflow-hidden" aria-labelledby="nosotros-title">
      <div className="pointer-events-none absolute left-[-15%] top-1/3 h-[480px] w-[480px] rounded-full bg-luna-500/20 blur-[120px]" aria-hidden="true" />
      <div className="container-site relative grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="eyebrow">{data.eyebrow}</p>
          <h2 id="nosotros-title" className="section-title">{data.title}</h2>
          {data.intro && <p className="section-intro">{data.intro}</p>}
          <ol className="mt-8 flex flex-wrap items-center gap-2 text-sm font-semibold" aria-label="Nuestro enfoque">
            {pillars.map((p, i) => (
              <li key={p} className="flex items-center gap-2">
                <span className="rounded-full border border-luna-300/40 bg-luna-700/50 px-3.5 py-1.5 text-luna-50">{p}</span>
                {i < pillars.length - 1 && <ArrowRight className="h-4 w-4 text-luna-300" aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </div>
        <ul className="grid gap-4">
          {data.items.map((w) => (
            <li key={w.title} className="card flex gap-4 p-5 sm:p-6">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-luna-50 shadow-[0_0_12px_#A7EBF2]" aria-hidden="true" />
              <div>
                <h3 className="text-base font-semibold sm:text-lg">{w.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{w.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ───────────────────────────── FAQ ─────────────────────────────
export function FaqList({ faqs, headingLevel = 3 }: { faqs: Pick<Faq, "id" | "question" | "answer">[]; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="divide-y divide-luna-50/10 rounded-2xl border border-luna-50/10 bg-luna-700/30">
      {faqs.map((f) => (
        <details key={f.id} className="group px-5 sm:px-6 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left">
            <H className="font-sans text-base font-semibold text-white sm:text-[17px]">{f.question}</H>
            <ChevronDown className="h-5 w-5 shrink-0 text-luna-50 transition group-open:rotate-180" aria-hidden="true" />
          </summary>
          <p className="-mt-1 pb-5 text-[15px] leading-relaxed text-ink-muted">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function FaqSection({ data, faqs }: { data: Home["faq"]; faqs: Faq[] }) {
  if (!faqs.length) return null;
  return (
    <section id="preguntas" className="section" aria-labelledby="faq-title">
      <div className="container-site grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">{data.eyebrow}</p>
          <h2 id="faq-title" className="section-title">{data.title}</h2>
          {data.intro && <p className="section-intro">{data.intro}</p>}
        </div>
        <FaqList faqs={faqs} />
      </div>
    </section>
  );
}

// ───────────────────────────── CTA de cierre ─────────────────────────────
export function Closing({ data, waHref, waEnabled, children }: { data: Home["closing"]; waHref: string; waEnabled: boolean; children?: React.ReactNode }) {
  return (
    <section id="contacto" className="section relative overflow-hidden" aria-labelledby="cierre-title">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(84,172,191,0.25),transparent_60%)]" aria-hidden="true" />
      <div className="container-site relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <h2 id="cierre-title" className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{data.title}</h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-muted">{data.text}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <a href="#formulario" className="btn-primary">{data.ctaPrimary}</a>
            {waEnabled && <WaLink href={waHref} location="cierre">{data.ctaWhatsapp}</WaLink>}
          </div>
        </div>
        <div id="formulario" className="scroll-mt-24">{children}</div>
      </div>
    </section>
  );
}
