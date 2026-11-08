import Link from "next/link";
import { requireEditor } from "@/lib/auth";
import { getBlock } from "@/lib/content";
import { PRIVACY_SPEC, TERMS_SPEC } from "@/lib/editor-specs";
import { saveBlockAction } from "@/app/admin/actions/content";
import { AdminPage } from "@/components/admin/Page";
import { SpecEditor } from "@/components/admin/SpecEditor";

export const metadata = { title: "Páginas legales" };

export default async function LegalPages({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireEditor();
  const tab = (await searchParams).tab === "terminos" ? "terms" : "privacy";
  const data = await getBlock(tab);
  return (
    <AdminPage
      title="Páginas legales"
      description="La política de privacidad está en borrador y debe ser aprobada por Estratec antes del lanzamiento."
    >
      <nav className="mb-6 flex gap-2" aria-label="Documentos">
        <Link href="/admin/legales" aria-current={tab === "privacy" ? "page" : undefined} className={`btn-sm ${tab === "privacy" ? "btn-primary" : "btn-secondary"}`}>Política de privacidad</Link>
        <Link href="/admin/legales?tab=terminos" aria-current={tab === "terms" ? "page" : undefined} className={`btn-sm ${tab === "terms" ? "btn-primary" : "btn-secondary"}`}>Términos de uso</Link>
      </nav>
      <SpecEditor key={tab} fields={tab === "privacy" ? PRIVACY_SPEC : TERMS_SPEC} initial={data} action={saveBlockAction} hidden={{ key: tab }} />
    </AdminPage>
  );
}
