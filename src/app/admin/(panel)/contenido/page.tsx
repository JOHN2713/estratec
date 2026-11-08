import Link from "next/link";
import { Eye } from "lucide-react";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import { getBlock } from "@/lib/content";
import { HOME_SPEC } from "@/lib/editor-specs";
import { saveBlockAction } from "@/app/admin/actions/content";
import { AdminPage } from "@/components/admin/Page";
import { SpecEditor } from "@/components/admin/SpecEditor";

export const metadata = { title: "Página de inicio" };

export default async function HomeContent() {
  await requireEditor();
  const [home, services] = await Promise.all([getBlock("home"), db.service.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } })]);
  return (
    <AdminPage
      title="Página de inicio"
      description="Textos del hero, CTA y secciones. Los cambios se publican al guardar."
      actions={
        <Link href="/" target="_blank" className="btn-secondary btn-sm">
          <Eye className="h-4 w-4" aria-hidden="true" /> Ver página
        </Link>
      }
    >
      <SpecEditor fields={HOME_SPEC} initial={home} action={saveBlockAction} hidden={{ key: "home" }} services={services} />
    </AdminPage>
  );
}
