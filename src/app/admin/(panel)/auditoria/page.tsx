import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminPage, EmptyState } from "@/components/admin/Page";

export const metadata = { title: "Auditoría" };
const PAGE = 50;

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ page?: string; accion?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Math.min(500, parseInt(sp.page || "1", 10) || 1));
  const where = sp.accion && /^[a-z_.]{1,80}$/.test(sp.accion) ? { action: { startsWith: sp.accion } } : {};
  const [logs, total] = await Promise.all([
    db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE, include: { user: { select: { name: true } } } }),
    db.auditLog.count({ where }),
  ]);
  const fmt = new Intl.DateTimeFormat("es-EC", { dateStyle: "short", timeStyle: "medium", timeZone: "America/Guayaquil" });
  const filters = ["auth.", "lead.", "content.", "settings.", "user."];
  return (
    <AdminPage title="Auditoría" description="Registro de acciones sensibles: accesos, cambios de configuración, roles, exportaciones y confirmaciones de citas. No guarda contraseñas ni tokens.">
      <nav className="mb-5 flex flex-wrap gap-2" aria-label="Filtrar">
        <Link href="/admin/auditoria" className={`btn-sm ${!sp.accion ? "btn-primary" : "btn-secondary"}`}>Todo</Link>
        {filters.map((f) => (
          <Link key={f} href={`/admin/auditoria?accion=${f}`} className={`btn-sm ${sp.accion === f ? "btn-primary" : "btn-secondary"}`}>{f.replace(".", "")}</Link>
        ))}
      </nav>
      {logs.length === 0 ? (
        <EmptyState title="Sin registros" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-luna-50/10">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-luna-700/40 text-xs uppercase tracking-wider text-ink-dim">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
                <th scope="col" className="px-4 py-3 font-medium">Usuario</th>
                <th scope="col" className="px-4 py-3 font-medium">Acción</th>
                <th scope="col" className="px-4 py-3 font-medium">Entidad</th>
                <th scope="col" className="px-4 py-3 font-medium">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luna-50/10 font-mono text-xs">
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="whitespace-nowrap px-4 py-2.5 text-ink-muted">{fmt.format(l.createdAt)}</td>
                  <td className="px-4 py-2.5 font-sans text-white">{l.user?.name ?? "—"}</td>
                  <td className="px-4 py-2.5 text-luna-50">{l.action}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{l.entity ? `${l.entity}${l.entityId ? ` · ${l.entityId.slice(0, 10)}` : ""}` : "—"}</td>
                  <td className="max-w-xs truncate px-4 py-2.5 text-ink-dim">{l.meta ? JSON.stringify(l.meta) : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <nav aria-label="Paginación" className="mt-6 flex items-center justify-between text-sm">
        {page > 1 ? <Link href={`/admin/auditoria?page=${page - 1}${sp.accion ? `&accion=${sp.accion}` : ""}`} className="btn-secondary btn-sm">Anterior</Link> : <span />}
        <span className="text-ink-muted">{total} registros</span>
        {page * PAGE < total ? <Link href={`/admin/auditoria?page=${page + 1}${sp.accion ? `&accion=${sp.accion}` : ""}`} className="btn-secondary btn-sm">Siguiente</Link> : <span />}
      </nav>
    </AdminPage>
  );
}
