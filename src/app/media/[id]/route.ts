import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Sirve las imágenes de la biblioteca de medios (siempre WebP, almacenadas en Postgres).
 * El contenido de un id nunca cambia, por eso la caché es inmutable.
 */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9]{20,40}$/i.test(id)) return new Response(null, { status: 404 });
  const media = await db.mediaFile.findUnique({ where: { id }, select: { data: true, mimeType: true } });
  if (!media) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(media.data), {
    headers: {
      "Content-Type": media.mimeType,
      "Content-Length": String(media.data.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
