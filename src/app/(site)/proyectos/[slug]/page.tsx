import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/public-data";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/site/PageHeader";
import { Markdown } from "@/components/ui/Markdown";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const p = await getProject((await params).slug);
  if (!p) return {};
  return pageMetadata({ path: `/proyectos/${p.slug}`, title: p.title, description: p.summary, seo: p.seo, image: p.image, type: "article" });
}

function embedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (/(^|\.)youtube\.com$/.test(u.hostname) && u.searchParams.get("v")) return `https://www.youtube-nocookie.com/embed/${u.searchParams.get("v")}`;
    if (u.hostname === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (/(^|\.)vimeo\.com$/.test(u.hostname)) return `https://player.vimeo.com/video/${u.pathname.split("/").filter(Boolean)[0]}`;
  } catch {}
  return null;
}

export default async function ProjectPage({ params }: Props) {
  const p = await getProject((await params).slug);
  if (!p) notFound();
  const video = p.videoUrl ? embedUrl(p.videoUrl) : null;
  return (
    <>
      <PageHeader crumbs={[{ name: "Proyectos", href: "/proyectos" }, { name: p.title, href: `/proyectos/${p.slug}` }]} eyebrow={p.sector ?? undefined} title={p.title} intro={p.summary} />
      <article className="container-site grid gap-12 pb-24 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          {p.image && (
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-luna-50/10">
              <Image src={p.image} alt={p.imageAlt ?? ""} fill priority sizes="(min-width:1024px) 760px, 100vw" className="object-cover" />
            </div>
          )}
          <section>
            <h2 className="text-2xl font-bold">El reto</h2>
            <Markdown>{p.challenge}</Markdown>
          </section>
          <section>
            <h2 className="text-2xl font-bold">La solución</h2>
            <Markdown>{p.solution}</Markdown>
          </section>
          {p.results && (
            <section>
              <h2 className="text-2xl font-bold">Resultados</h2>
              <Markdown>{p.results}</Markdown>
            </section>
          )}
          {video && (
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-luna-50/10">
              <iframe src={video} title={`Video: ${p.title}`} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full" />
            </div>
          )}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6 text-sm">
            {p.client && (
              <p><span className="text-ink-dim">Cliente:</span> <span className="text-white">{p.client}</span></p>
            )}
            {p.sector && (
              <p className="mt-2"><span className="text-ink-dim">Sector:</span> <span className="text-white">{p.sector}</span></p>
            )}
            {p.tech.length > 0 && (
              <>
                <p className="mt-4 text-ink-dim">Tecnologías</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {p.tech.map((t) => <li key={t} className="rounded-md bg-luna-900/60 px-2 py-0.5 text-xs text-ink">{t}</li>)}
                </ul>
              </>
            )}
            {p.repoUrl && (
              <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="link mt-4 inline-block">Ver repositorio</a>
            )}
          </div>
          <div className="card p-6">
            <h2 className="text-lg font-semibold">¿Un reto parecido?</h2>
            <p className="mt-2 text-sm text-ink-muted">Conversemos sobre cómo abordarlo en tu organización.</p>
            <Link href="/contacto#formulario" className="btn-primary mt-4 w-full">Agenda una consultoría</Link>
          </div>
        </aside>
      </article>
    </>
  );
}
