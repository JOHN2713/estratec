import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/ui/JsonLd";
import { siteUrl } from "@/lib/site-url";

export type Crumb = { name: string; href: string };

const d = (ms: number) => ({ "--d": ms }) as React.CSSProperties;

export function PageHeader({
  crumbs,
  eyebrow,
  title,
  intro,
  icon,
  children,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  intro?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const all = [{ name: "Inicio", href: "/" }, ...crumbs];
  return (
    <section className="relative overflow-hidden pb-14 pt-10 sm:pb-20 sm:pt-14">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: siteUrl(c.href) })),
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-50" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-40 right-0 h-[440px] w-[440px] rounded-full bg-luna-500/25 blur-[110px]" aria-hidden="true" />
      <div className="container-site relative">
        <nav aria-label="Ruta de navegación" className="animate-rise" style={d(0)}>
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-dim">
            {all.map((c, i) => (
              <li key={c.href} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
                {i === all.length - 1 ? (
                  <span aria-current="page" className="text-ink-muted">{c.name}</span>
                ) : (
                  <Link href={c.href} className="transition hover:text-white">{c.name}</Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-start">
          {icon && (
            <span className="icon-tile animate-rise h-16 w-16 rounded-2xl" style={d(80)} aria-hidden="true">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            {eyebrow && <p className="eyebrow animate-rise" style={d(120)}>{eyebrow}</p>}
            <h1
              className={`animate-rise ${eyebrow ? "mt-3" : ""} max-w-4xl text-[2.1rem] font-extrabold leading-[1.08] tracking-[-0.02em] sm:text-5xl lg:text-[3.4rem]`}
              style={d(180)}
            >
              {title}
            </h1>
            {intro && (
              <p className="animate-rise mt-5 max-w-3xl text-base leading-relaxed text-ink-muted sm:text-lg" style={d(280)}>
                {intro}
              </p>
            )}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
