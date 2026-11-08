import Image from "next/image";
import Link from "next/link";
import { getArticles } from "@/lib/public-data";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/site/PageHeader";

export const revalidate = 3600;

export async function generateMetadata() {
  const articles = await getArticles();
  return pageMetadata({
    path: "/recursos",
    title: "Recursos: guías y artículos sobre tecnología para empresas",
    description: "Guías y artículos de Estratec sobre software, integraciones, CRM, automatización y transformación digital.",
    seo: articles.length ? undefined : { noindex: true },
  });
}

const fmt = (d: Date) => new Intl.DateTimeFormat("es", { dateStyle: "long" }).format(d);

export default async function ResourcesPage() {
  const articles = await getArticles();
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Recursos", href: "/recursos" }]}
        eyebrow="Recursos"
        title="Guías y artículos"
        intro="Ideas prácticas para tomar mejores decisiones tecnológicas en tu negocio."
      />
      <section className="pb-24">
        <div className="container-site">
          {articles.length === 0 ? (
            <div className="card p-10 text-center">
              <h2 className="text-2xl font-bold">Muy pronto</h2>
              <p className="mx-auto mt-3 max-w-xl text-ink-muted">Estamos preparando nuestros primeros recursos. Mientras tanto, si tienes una pregunta concreta, escríbenos.</p>
              <Link href="/contacto" className="btn-primary mt-6">Contáctanos</Link>
            </div>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <li key={a.id}>
                  <article className="card card-hover relative flex h-full flex-col overflow-hidden">
                    {a.image ? (
                      <div className="relative aspect-[16/9]">
                        <Image src={a.image} alt={a.imageAlt ?? ""} fill sizes="(min-width:1024px) 380px, (min-width:640px) 50vw, 100vw" className="object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-gradient-to-br from-luna-500/40 to-luna-700" aria-hidden="true" />
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      {a.publishedAt && <time dateTime={a.publishedAt.toISOString()} className="text-xs text-ink-dim">{fmt(a.publishedAt)}</time>}
                      <h2 className="mt-2 text-lg font-semibold">
                        <Link href={`/recursos/${a.slug}`} className="after:absolute after:inset-0">{a.title}</Link>
                      </h2>
                      <p className="mt-2 text-sm text-ink-muted">{a.excerpt}</p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
