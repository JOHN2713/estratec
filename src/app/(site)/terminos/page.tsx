import { notFound } from "next/navigation";
import { getBlock } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { Markdown } from "@/components/ui/Markdown";
import { PageHeader } from "@/components/site/PageHeader";

export const revalidate = 3600;

export async function generateMetadata() {
  const t = await getBlock("terms");
  return pageMetadata({ path: "/terminos", title: t.title, seo: t.enabled ? undefined : { noindex: true } });
}

export default async function TermsPage() {
  const t = await getBlock("terms");
  if (!t.enabled || !t.body) notFound();
  return (
    <>
      <PageHeader crumbs={[{ name: t.title, href: "/terminos" }]} title={t.title}>
        {t.updated && <p className="mt-4 text-sm text-ink-dim">Actualizados: {t.updated}</p>}
      </PageHeader>
      <div className="container-site max-w-3xl pb-24">
        <Markdown>{t.body}</Markdown>
      </div>
    </>
  );
}
