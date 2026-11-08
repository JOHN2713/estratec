import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

/** Activa la vista previa de borradores solo para usuarios autenticados. */
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return new Response("No autorizado", { status: 401 });
  const path = new URL(req.url).searchParams.get("path") || "/";
  // Solo rutas internas (evita redirección abierta)
  const safe = path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\") ? path : "/";
  (await draftMode()).enable();
  redirect(safe);
}
