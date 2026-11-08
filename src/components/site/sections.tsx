import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Sparkles } from "lucide-react";
import type { Faq, Project, Service } from "@prisma/client";
import type { Blocks } from "@/lib/content";
import { waLink } from "@/lib/whatsapp";
import { ServiceIcon } from "@/components/ui/Icon";
import { CoreVisual } from "./CoreVisual";
import { WaLink } from "./TrackedLinks";

type Home = Blocks["home"];

/** Encabezado de sección con aparición escalonada (etiqueta → título → introducción). */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  center,
  id,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  center?: boolean;
  id?: string;
  className?: string;
}) {
  return (
    <div data-reveal-group className={`${center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} ${className}`}>
      {eyebrow && <p data-reveal className="eyebrow">{eyebrow}</p>}
      <h2 data-reveal id={id} className="section-title">{title}</h2>
      {intro && <p data-reveal className={`section-intro ${center ? "mx-auto" : ""}`}>{intro}</p>}
    </div>
  );
}

// ───────────────────────────── Hero ─────────────────────────────
export function Hero({ hero }: { hero: Home["hero"] }) {
  const d = (ms: number) => ({ "--d": ms }) as React.CSSProperties;
  return (
    <section className="relative overflow-hidden pb-16 pt-10 sm:pt-16 lg:pb-28 lg:pt-20">
      <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-60" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[620px] w-[620px] rounded-full bg-luna-500/25 blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-40 top-1/2 h-[380px] w-[380px] rounded-full bg-luna-300/10 blur-[110px]" aria-hidden="true" />
      <div className="container-site relative grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div>
          {hero.eyebrow && (
            <p
              style={d(0)}
              className="animate-rise inline-flex items-center gap-2 rounded-full border border-luna-50/20 bg-luna-700/40 px-3.5 py-1.5 text-xs font-medium text-luna-50 backdrop-blur"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {hero.eyebrow}
            </p>
          )}
          <h1 style={d(120)} className="animate-rise mt-6 text-[2.35rem] font-extrabold leading-[1.06] tracking-[-0.02em] sm:text-5xl lg:text-[3.75rem]">
            <span className="text-gradient-animated">{hero.title}</span>
          </h1>
          <p style={d(260)} className="animate-rise mt-6 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            {hero.subtitle}
          </p>
          <div style={d(400)} className="animate-rise mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/contacto#formulario" className="btn-primary group">
              {hero.ctaPrimary} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link href="/#servicios" className="btn-secondary">{hero.ctaSecondary}</Link>
          </div>
        </div>
        <div style={d(300)} className="animate-rise mx-auto w-full max-w-[420px] sm:max-w-[500px] lg:max-w-none">
          <CoreVisual labels={hero.coreLabels} />
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────── Capacidades ─────────────────────────────
export function CapabilityStrip({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <section aria-label="Capacidades" className="relative border-y border-luna-50/10 bg-luna-700/20">
      <ul data-reveal-group className="container-site flex flex-wrap items-center justify-center gap-2.5 py-6 text-sm font-medium text-ink-muted sm:text-[15px]">
        {items.map((c) => (
          <li data-reveal key={c} className="flex items-center gap-2 rounded-full border border-luna-50/10 bg-luna-900/40 px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-luna-300 shadow-[0_0_8px_#54ACBF]" aria-hidden="true" />
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
        <SectionHeading id="problemas-title" eyebrow="Retos frecuentes" title={data.title} intro={data.intro} />
        <ul data-reveal-group className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((p, i) => {
            const related = p.serviceSlugs.map((s) => bySlug.get(s)).filter(Boolean) as Service[];
            return (
              <li data-reveal key={p.title} className="card card-hover flex flex-col p-6">
                <span className="font-display text-sm font-bold tabular-nums text-luna-300/70" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-lg font-semibold leading-snug">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{p.text}</p>
                {related.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-2 border-t border-luna-50/10 pt-4" aria-label="Servicios relacionados">
                    {related.map((s) => (
                      <li key={s.slug}>
                        <Link
                          href={`/servicios/${s.slug}`}
                          className="inline-flex items-center gap-1 rounded-full border border-luna-300/30 px-3 py-1 text-xs font-medium text-luna-50 transition hover:border-luna-50 hover:bg-luna-300/10"
                        >
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
    <article data-reveal className="card card-hover group flex h-full flex-col p-6">
      <div className="flex items-start justify-between">
        <span className="icon-tile transition duration-500 group-hover:scale-105">
          <ServiceIcon name={s.icon} />
        </span>
        <ArrowUpRight
          className="h-5 w-5 text-ink-dim transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-luna-50"
          aria-hidden="true"
        />
      </div>
      <h3 className="mt-6 text-lg font-semibold leading-snug">
        <Link href={`/servicios/${s.slug}`} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
          {s.name}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{s.summary}</p>
      <div className="relative z-10 mt-6 flex items-center justify-between gap-3 border-t border-luna-50/10 pt-4">
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-luna-50" aria-hidden="true">
          Conocer solución <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
        {waEnabled ? (
          <WaLink
            href={waLink(whatsappNumber, s.whatsappText)}
            service={s.slug}
            location="tarjeta_servicio"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-luna-50/15 text-ink-muted transition hover:border-[#22c55e]/60 hover:bg-[#15803d] hover:text-white"
            ariaLabel={`Consultar por WhatsApp sobre ${s.name}`}
          >
            <span className="sr-only">WhatsApp</span>
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
      <div className="divider-glow" aria-hidden="true" />
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading id="servicios-title" eyebrow={data.eyebrow} title={data.title} intro={data.intro} />
          <Link data-reveal href="/servicios" className="btn-secondary btn-sm">
            Ver todos los servicios
          </Link>
        </div>
        <div data-reveal-group className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
    <section id="soluciones" className="section relative bg-gradient-to-b from-transparent via-luna-700/25 to-transparent" aria-labelledby="soluciones-title">
      <div className="container-site">
        <SectionHeading id="soluciones-title" eyebrow={data.eyebrow} title={data.title} intro={data.intro} />
        <ul data-reveal-group className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((o, i) => (
            <li data-reveal key={o.title}>
              <Link
                href={o.serviceSlug ? `/servicios/${o.serviceSlug}` : "/servicios"}
                className="card card-hover group flex h-full items-start gap-5 p-6"
              >
                <span className="font-display text-3xl font-extrabold leading-none text-transparent [-webkit-text-stroke:1px_rgba(167,235,242,0.55)] tabular-nums transition group-hover:text-luna-300/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">
                  <span className="flex items-center justify-between gap-3 text-lg font-semibold text-white">
                    {o.title}
                    <ArrowRight className="h-4 w-4 shrink-0 text-luna-50 transition group-hover:translate-x-1" aria-hidden="true" />
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
    <section id="como-trabajamos" className="section relative" aria-labelledby="proceso-title">
      <div className="container-site">
        <SectionHeading id="proceso-title" eyebrow={data.eyebrow} title={data.title} intro={data.intro} center />
        <ol
          data-reveal-group
          className={`relative mt-16 grid gap-4 sm:grid-cols-2 ${cyclic ? "lg:grid-cols-[1fr_minmax(240px,300px)_1fr] lg:grid-rows-3 lg:gap-x-10" : "lg:grid-cols-3"}`}
        >
          {cyclic && (
            <li data-reveal="zoom" aria-hidden="true" className="pointer-events-none relative hidden lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:flex lg:items-center lg:justify-center">
              <svg viewBox="0 0 300 300" className="w-full max-w-[300px] [animation:spin_60s_linear_infinite] motion-reduce:animate-none">
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
              </svg>
              <div className="absolute flex h-36 w-36 flex-col items-center justify-center rounded-full border border-luna-300/40 bg-luna-700/80 text-center shadow-glow">
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-luna-50">Ciclo</span>
                <span className="mt-1 font-display text-base font-semibold text-white">Estratec</span>
              </div>
            </li>
          )}
          {steps.map((s, i) => (
            <li data-reveal key={s.title} className={`card card-hover p-5 sm:p-6 ${cyclic ? LG_POS[i] : ""}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-luna-300 to-luna-50 font-display text-sm font-extrabold text-luna-900 shadow-[0_0_18px_-4px_#54ACBF]">
                  {i + 1}
                </span>
                <h3 className="text-base font-semibold">{s.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{s.text}</p>
            </li>
          ))}
        </ol>
        {data.note && <p data-reveal className="mt-10 text-center text-sm text-ink-dim">{data.note}</p>}
      </div>
    </section>
  );
}

// ───────────────────────────── Proyectos ─────────────────────────────
export function ProjectCard({ p }: { p: Project }) {
  return (
    <article data-reveal className="card card-hover group flex flex-col overflow-hidden">
      {p.image ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-luna-700">
          <Image
            src={p.image}
            alt={p.imageAlt ?? ""}
            fill
            sizes="(min-width:1024px) 380px, (min-width:640px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
            loading="lazy"
          />
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
              <SectionHeading id="proyectos-title" eyebrow={data.eyebrow} title={data.title} intro={data.intro} />
              <Link data-reveal href="/proyectos" className="btn-secondary btn-sm">Ver todos</Link>
            </div>
            <div data-reveal-group className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 3).map((p) => <ProjectCard key={p.id} p={p} />)}
            </div>
          </>
        ) : (
          <div data-reveal="zoom" className="card relative overflow-hidden p-8 sm:p-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-luna-300/20 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:linear-gradient(90deg,transparent,black)]" aria-hidden="true" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow">{data.eyebrow}</p>
                <h2 id="proyectos-title" className="mt-3 text-2xl font-bold sm:text-3xl">{data.emptyTitle}</h2>
                <p className="mt-3 text-ink-muted">{data.emptyText}</p>
              </div>
              <Link href="/contacto#formulario" className="btn-primary group shrink-0">
                Cuéntanos tu proyecto <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
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
          <SectionHeading id="nosotros-title" eyebrow={data.eyebrow} title={data.title} intro={data.intro} />
          <ol data-reveal-group className="mt-8 flex flex-wrap items-center gap-2 text-sm font-semibold" aria-label="Nuestro enfoque">
            {pillars.map((p, i) => (
              <li data-reveal key={p} className="flex items-center gap-2">
                <span className="rounded-full border border-luna-300/40 bg-luna-700/50 px-3.5 py-1.5 text-luna-50">{p}</span>
                {i < pillars.length - 1 && <ArrowRight className="h-4 w-4 text-luna-300" aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </div>
        <ul data-reveal-group className="grid gap-4">
          {data.items.map((w) => (
            <li data-reveal="right" key={w.title} className="card card-hover flex gap-4 p-5 sm:p-6">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-luna-300/40 bg-luna-300/10 text-luna-50" aria-hidden="true">
                <Check className="h-4 w-4" />
              </span>
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
    <div data-reveal-group className="space-y-3">
      {faqs.map((f) => (
        <details
          data-reveal
          key={f.id}
          className="group rounded-2xl border border-luna-50/10 bg-luna-700/30 px-5 transition-colors duration-300 open:border-luna-300/30 open:bg-luna-700/50 hover:border-luna-50/25 sm:px-6 [&_summary::-webkit-details-marker]:hidden"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left">
            <H className="font-sans text-base font-semibold text-white sm:text-[17px]">{f.question}</H>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-luna-50/15 transition duration-300 group-open:rotate-180 group-open:border-luna-300/50 group-open:bg-luna-300/10">
              <ChevronDown className="h-4 w-4 text-luna-50" aria-hidden="true" />
            </span>
          </summary>
          <p className="faq-answer -mt-1 pb-5 pr-10 text-[15px] leading-relaxed text-ink-muted">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function FaqSection({ data, faqs }: { data: Home["faq"]; faqs: Faq[] }) {
  if (!faqs.length) return null;
  return (
    <section id="preguntas" className="section" aria-labelledby="faq-title">
      <div className="container-site grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading id="faq-title" eyebrow={data.eyebrow} title={data.title} intro={data.intro} />
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(84,172,191,0.22),transparent_60%)]" aria-hidden="true" />
      <div className="divider-glow" aria-hidden="true" />
      <div className="container-site relative grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div data-reveal-group className="lg:sticky lg:top-28">
          <h2 data-reveal id="cierre-title" className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{data.title}</h2>
          <p data-reveal className="mt-5 text-lg leading-relaxed text-ink-muted">{data.text}</p>
          <div data-reveal className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <a href="#formulario" className="btn-primary">{data.ctaPrimary}</a>
            {waEnabled && <WaLink href={waHref} location="cierre">{data.ctaWhatsapp}</WaLink>}
          </div>
        </div>
        <div data-reveal="zoom" id="formulario" className="scroll-mt-24">{children}</div>
      </div>
    </section>
  );
}
