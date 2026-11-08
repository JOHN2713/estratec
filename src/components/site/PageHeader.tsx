import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/ui/JsonLd";
import { siteUrl } from "@/lib/site-url";

export type Crumb = { name: string; href: string };

export function PageHeader({
  crumbs,
  eyebrow,
  title,
  intro,
  children,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  const all = [{ name: "Inicio", href: "/" }, ...crumbs];
  return (
    <section className="relative overflow-hidden pb-12 pt-10 sm:pb-16 sm:pt-14">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: siteUrl(c.href) })),
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-50" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-40 right-0 h-[420px] w-[420px] rounded-full bg-luna-500/25 blur-[110px]" aria-hidden="true" />
      <div className="container-site relative">
        <nav aria-label="Ruta de navegación">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-dim">
            {all.map((c, i) => (
              <li key={c.href} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
                {i === all.length - 1 ? (
                  <span aria-current="page" className="text-ink-muted">{c.name}</span>
                ) : (
                  <Link href={c.href} className="hover:text-white">{c.name}</Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        {eyebrow && <p className="eyebrow mt-8">{eyebrow}</p>}
        <h1 className={`${eyebrow ? "mt-3" : "mt-8"} max-w-4xl text-4xl font-extrabold leading-[1.1] sm:text-5xl`}>{title}</h1>
        {intro && <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-muted">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
