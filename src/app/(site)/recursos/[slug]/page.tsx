import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle } from "@/lib/public-data";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site-url";
import { JsonLd } from "@/components/ui/JsonLd";
import { Markdown } from "@/components/ui/Markdown";
import { PageHeader } from "@/components/site/PageHeader";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const a = await getArticle((await params).slug);
  if (!a) return {};
  return pageMetadata({ path: `/recursos/${a.slug}`, title: a.title, description: a.excerpt, seo: a.seo, image: a.image, type: "article" });
}

export default async function ArticlePage({ params }: Props) {
  const a = await getArticle((await params).slug);
  if (!a) notFound();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: a.title,
          description: a.excerpt,
          inLanguage: "es",
          ...(a.publishedAt ? { datePublished: a.publishedAt.toISOString() } : {}),
          dateModified: a.updatedAt.toISOString(),
          ...(a.image ? { image: a.image.startsWith("/") ? siteUrl(a.image) : a.image } : {}),
          author: a.author ? { "@type": "Person", name: a.author } : { "@type": "Organization", name: "Estratec" },
          publisher: { "@type": "Organization", "@id": `${siteUrl()}/#organization`, name: "Estratec" },
          mainEntityOfPage: siteUrl(`/recursos/${a.slug}`),
        }}
      />
      <PageHeader crumbs={[{ name: "Recursos", href: "/recursos" }, { name: a.title, href: `/recursos/${a.slug}` }]} title={a.title} intro={a.excerpt}>
        <p className="mt-5 text-sm text-ink-dim">
          {a.author && <>Por {a.author} · </>}
          {a.publishedAt && <time dateTime={a.publishedAt.toISOString()}>{new Intl.DateTimeFormat("es", { dateStyle: "long" }).format(a.publishedAt)}</time>}
        </p>
      </PageHeader>
      <article className="container-site max-w-3xl pb-24">
        {a.image && (
          <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl border border-luna-50/10">
            <Image src={a.image} alt={a.imageAlt ?? ""} fill priority sizes="(min-width:768px) 760px, 100vw" className="object-cover" />
          </div>
        )}
        <Markdown>{a.body}</Markdown>
        <div className="card mt-14 p-6 sm:p-8">
          <h2 className="text-xl font-bold">¿Quieres aplicar esto en tu negocio?</h2>
          <p className="mt-2 text-ink-muted">Conversemos sobre tu caso y te orientamos sobre los siguientes pasos.</p>
          <Link href="/contacto#formulario" className="btn-primary mt-5">Agenda una consultoría</Link>
        </div>
      </article>
    </>
  );
}
