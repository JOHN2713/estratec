import Link from "next/link";
import { Download, Plus, Search } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { COUNTRIES, STATUS_LABEL, STATUS_ORDER } from "@/lib/leads";
import { buildLeadWhere, type LeadFilters } from "@/lib/server/lead-filters";
import { AdminPage, EmptyState } from "@/components/admin/Page";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata = { title: "Prospectos" };
const PAGE = 25;

export default async function LeadsPage({ searchParams }: { searchParams: Promise<LeadFilters & { eliminado?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Math.min(1000, parseInt(sp.page || "1", 10) || 1));
  const where = buildLeadWhere(sp);
  const [leads, total, services, counts] = await Promise.all([
    db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE,
      take: PAGE,
      select: {
        id: true, name: true, company: true, email: true, phone: true, serviceName: true, status: true, country: true,
        source: true, createdAt: true, preferredDate: true, agreedAt: true, assignedTo: { select: { name: true } },
      },
    }),
    db.lead.count({ where }),
    db.service.findMany({ orderBy: { order: "asc" }, select: { slug: true, shortName: true } }),
    db.lead.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const fmt = new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeZone: "America/Guayaquil" });
  const qs = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, eliminado: undefined, ...over })) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `?${s}` : "";
  };
  const exportQs = qs({ page: undefined });

  return (
    <AdminPage
      title="Prospectos"
      description="Solicitudes recibidas desde la web y contactos registrados manualmente."
      actions={
        <>
          <a href={`/admin/prospectos/exportar${exportQs}`} className="btn-secondary btn-sm">
            <Download className="h-4 w-4" aria-hidden="true" /> Exportar CSV
          </a>
          <Link href="/admin/prospectos/nuevo" className="btn-primary btn-sm">
            <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo prospecto
          </Link>
        </>
      }
    >
      {sp.eliminado && <p role="status" className="mb-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Prospecto eliminado.</p>}

      {/* Pipeline */}
      <nav aria-label="Filtrar por estado" className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <Link href={`/admin/prospectos${qs({ estado: undefined, page: undefined })}`} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${!sp.estado ? "border-luna-300 bg-luna-300/15 text-white" : "border-luna-50/15 text-ink-muted hover:text-white"}`}>
          Todos
        </Link>
        {STATUS_ORDER.map((s) => (
          <Link
            key={s}
            href={`/admin/prospectos${qs({ estado: s, page: undefined })}`}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${sp.estado === s ? "border-luna-300 bg-luna-300/15 text-white" : "border-luna-50/15 text-ink-muted hover:text-white"}`}
          >
            {STATUS_LABEL[s]} <span className="tabular-nums text-ink-dim">{counts.find((c) => c.status === s)?._count._all ?? 0}</span>
          </Link>
        ))}
      </nav>

      <form method="get" className="mb-6 grid gap-3 rounded-2xl border border-luna-50/10 bg-luna-700/25 p-4 sm:grid-cols-2 lg:grid-cols-6">
        {sp.estado && <input type="hidden" name="estado" value={sp.estado} />}
        <div className="lg:col-span-2">
          <label htmlFor="q" className="sr-only">Buscar</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim" aria-hidden="true" />
            <input id="q" name="q" defaultValue={sp.q} placeholder="Nombre, correo, empresa, teléfono…" className="field pl-9" maxLength={100} />
          </div>
        </div>
        <select name="servicio" defaultValue={sp.servicio ?? ""} className="field" aria-label="Servicio">
          <option value="">Todos los servicios</option>
          {services.map((s) => <option key={s.slug} value={s.slug}>{s.shortName}</option>)}
          <option value="ninguno">No estoy seguro/a</option>
        </select>
        <select name="pais" defaultValue={sp.pais ?? ""} className="field" aria-label="País">
          <option value="">Todos los países</option>
          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="fuente" defaultValue={sp.fuente ?? ""} className="field" aria-label="Fuente">
          <option value="">Todas las fuentes</option>
          <option value="FORMULARIO_WEB">Formulario web</option>
          <option value="MANUAL">Registro manual</option>
        </select>
        <div className="flex gap-2">
          <input type="date" name="desde" defaultValue={sp.desde} className="field" aria-label="Desde" />
          <input type="date" name="hasta" defaultValue={sp.hasta} className="field" aria-label="Hasta" />
        </div>
        <div className="flex gap-2 lg:col-span-6">
          <button type="submit" className="btn-primary btn-sm">Aplicar filtros</button>
          <Link href="/admin/prospectos" className="btn-ghost btn-sm">Limpiar</Link>
          <span className="ml-auto self-center text-sm text-ink-muted">{total} resultado{total === 1 ? "" : "s"}</span>
        </div>
      </form>

      {leads.length === 0 ? (
        <EmptyState title="No hay prospectos con estos filtros" text="Las solicitudes del formulario web aparecerán aquí automáticamente." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-luna-50/10">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-luna-700/40 text-xs uppercase tracking-wider text-ink-dim">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Prospecto</th>
                <th scope="col" className="px-4 py-3 font-medium">Servicio</th>
                <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                <th scope="col" className="px-4 py-3 font-medium">Cita</th>
                <th scope="col" className="px-4 py-3 font-medium">Responsable</th>
                <th scope="col" className="px-4 py-3 font-medium">Recibido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luna-50/10">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/prospectos/${l.id}`} className="font-medium text-white hover:underline">{l.name}</Link>
                    <div className="text-xs text-ink-dim">{[l.company, l.country, l.source === "MANUAL" ? "Manual" : null].filter(Boolean).join(" · ") || l.email}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{l.serviceName}</td>
                  <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {l.agreedAt ? (
                      <span className="text-emerald-300">Confirmada: {fmt.format(l.agreedAt)}</span>
                    ) : l.preferredDate ? (
                      <span>Prefiere: {new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeZone: "UTC" }).format(l.preferredDate)}</span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{l.assignedTo?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{fmt.format(l.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Paginación" className="mt-6 flex items-center justify-between text-sm">
          {page > 1 ? <Link href={`/admin/prospectos${qs({ page: String(page - 1) })}`} className="btn-secondary btn-sm">Anterior</Link> : <span />}
          <span className="text-ink-muted">Página {page} de {pages}</span>
          {page < pages ? <Link href={`/admin/prospectos${qs({ page: String(page + 1) })}`} className="btn-secondary btn-sm">Siguiente</Link> : <span />}
        </nav>
      )}
    </AdminPage>
  );
}
