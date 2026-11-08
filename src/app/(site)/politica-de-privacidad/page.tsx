import { getBlock } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { Markdown } from "@/components/ui/Markdown";
import { PageHeader } from "@/components/site/PageHeader";

export const revalidate = 3600;

export async function generateMetadata() {
  const p = await getBlock("privacy");
  return pageMetadata({ path: "/politica-de-privacidad", title: p.title, description: "Cómo trata Estratec los datos personales recibidos a través de su sitio web." });
}

export default async function PrivacyPage() {
  const p = await getBlock("privacy");
  return (
    <>
      <PageHeader crumbs={[{ name: p.title, href: "/politica-de-privacidad" }]} title={p.title}>
        <p className="mt-4 text-sm text-ink-dim">
          Versión {p.version}
          {p.updated && <> · Actualizada: {p.updated}</>}
        </p>
      </PageHeader>
      <div className="container-site max-w-3xl pb-24">
        <Markdown>{p.body}</Markdown>
      </div>
    </>
  );
}
