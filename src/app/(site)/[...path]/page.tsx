import { notFound, permanentRedirect, redirect } from "next/navigation";
import { db } from "@/lib/db";

/** Rutas no encontradas: se consultan las redirecciones 301/302 administrables antes de mostrar 404. */
export const dynamic = "force-dynamic";

export default async function CatchAll({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const from = "/" + path.map((p) => decodeURIComponent(p)).join("/");
  const r = await db.redirect.findUnique({ where: { from } }).catch(() => null);
  if (!r) notFound();
  // Solo destinos internos o https (evita redirecciones abiertas a esquemas peligrosos)
  const to = r.to.startsWith("/") && !r.to.startsWith("//") ? r.to : /^https:\/\//.test(r.to) ? r.to : null;
  if (!to) notFound();
  if (r.permanent) permanentRedirect(to);
  redirect(to);
}
