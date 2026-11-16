import { db } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import { AdminPage, EmptyState, Panel } from "@/components/admin/Page";
import { MediaGrid, MediaUploadForm } from "@/components/admin/MediaLibrary";

export const metadata = { title: "Multimedia" };

export default async function Page({ searchParams }: { searchParams: Promise<{ eliminado?: string }> }) {
  await requireEditor();
  const sp = await searchParams;
  const items = await db.mediaFile.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      filename: true,
      width: true,
      height: true,
      size: true,
      alt: true,
      uploadedBy: { select: { name: true } },
    },
  });

  return (
    <AdminPage
      title="Multimedia"
      description="Biblioteca de imágenes del sitio. Todo lo que subas se convierte automáticamente a WebP y se sirve con caché inmutable desde /media/<id>. Copia la URL y úsala en los campos de imagen de servicios, proyectos y recursos."
    >
      {sp.eliminado && (
        <p role="status" className="mb-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Imagen eliminada.
        </p>
      )}
      <Panel title="Subir imagen">
        <MediaUploadForm />
      </Panel>
      <div className="mt-8">
        {items.length === 0 ? (
          <EmptyState title="Aún no hay imágenes" text="Sube la primera desde el formulario de arriba: se convertirá a WebP automáticamente." />
        ) : (
          <MediaGrid
            items={items.map((m) => ({
              id: m.id,
              filename: m.filename,
              width: m.width,
              height: m.height,
              size: m.size,
              alt: m.alt,
              uploadedBy: m.uploadedBy?.name ?? null,
            }))}
          />
        )}
      </div>
    </AdminPage>
  );
}
