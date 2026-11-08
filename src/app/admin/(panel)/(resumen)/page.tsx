import Link from "next/link";
import { ArrowRight, BarChart3, Boxes, CalendarCheck, CircleHelp, House, Inbox, Search, Settings } from "lucide-react";
import type { LeadStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { STATUS_GROUP, STATUS_LABEL } from "@/lib/leads";
import { AdminPage, Panel } from "@/components/admin/Page";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata = { title: "Dashboard" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denegado?: string }> }) {
  const user = await requireUser();
  const { denegado } = await searchParams;
  const isAdmin = can(user, "crm");
  const settings = await getSettings();

  let crm: React.ReactNode = null;
  if (isAdmin) {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [byStatus, byService, recent, last30, upcoming] = await Promise.all([
      db.lead.groupBy({ by: ["status"], _count: { _all: true } }),
      db.lead.groupBy({ by: ["serviceName"], _count: { _all: true }, orderBy: { _count: { serviceName: "desc" } }, take: 10 }),
      db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, name: true, company: true, serviceName: true, status: true, createdAt: true } }),
      db.lead.count({ where: { createdAt: { gte: since } } }),
      db.lead.findMany({
        where: { status: "CITA_CONFIRMADA", agreedAt: { gte: new Date() } },
        orderBy: { agreedAt: "asc" },
        take: 5,
        select: { id: true, name: true, agreedAt: true, serviceName: true },
      }),
    ]);
    const count = (s: LeadStatus) => byStatus.find((b) => b.status === s)?._count._all ?? 0;
    const total = byStatus.reduce((a, b) => a + b._count._all, 0);
    const groups = { nuevas: 0, gestion: 0, contactadas: 0, cerradas: 0 };
    for (const b of byStatus) groups[STATUS_GROUP[b.status]] += b._count._all;
    const maxSvc = Math.max(1, ...byService.map((b) => b._count._all));
    const fmt = new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Guayaquil" });

    crm = (
      <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Total de solicitudes", value: total, href: "/admin/prospectos" },
            { label: "Nuevas", value: groups.nuevas, href: "/admin/prospectos?estado=NUEVA" },
            { label: "En gestión", value: groups.gestion, href: "/admin/prospectos" },
            { label: "Contactadas", value: groups.contactadas, href: "/admin/prospectos" },
            { label: "Cerradas", value: groups.cerradas, href: "/admin/prospectos" },
          ].map((k) => (
            <Link key={k.label} href={k.href} className="rounded-2xl border border-luna-50/10 bg-luna-700/25 p-5 transition hover:border-luna-50/30">
              <p className="text-sm text-ink-muted">{k.label}</p>
              <p className="mt-2 font-display text-3xl font-extrabold text-white tabular-nums">{k.value}</p>
            </Link>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-dim">
          {last30} solicitudes en los últimos 30 días · Ganados: {count("GANADO")} · Perdidos: {count("PERDIDO")}
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel title="Solicitudes recientes">
            {recent.length === 0 ? (
              <p className="text-sm text-ink-muted">Aún no hay solicitudes.</p>
            ) : (
              <ul className="divide-y divide-luna-50/10">
                {recent.map((l) => (
                  <li key={l.id}>
                    <Link href={`/admin/prospectos/${l.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-white">
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-white">{l.name}{l.company ? ` · ${l.company}` : ""}</span>
                        <span className="block truncate text-xs text-ink-dim">{l.serviceName} · {fmt.format(l.createdAt)}</span>
                      </span>
                      <StatusBadge status={l.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/admin/prospectos" className="mt-4 inline-flex items-center gap-1 text-sm text-luna-50 hover:underline">
              Ver todos <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Panel>

          <Panel title="Consultas por servicio">
            {byService.length === 0 ? (
              <p className="text-sm text-ink-muted">Sin datos todavía.</p>
            ) : (
              <ul className="space-y-3">
                {byService.map((b) => (
                  <li key={b.serviceName}>
                    <div className="flex justify-between text-sm">
                      <span className="truncate text-ink">{b.serviceName}</span>
                      <span className="tabular-nums text-ink-muted">{b._count._all}</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-luna-900/70">
                      <div className="h-2 rounded-full bg-gradient-to-r from-luna-500 to-luna-300" style={{ width: `${(b._count._all / maxSvc) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Próximas citas confirmadas">
            {upcoming.length === 0 ? (
              <p className="text-sm text-ink-muted">No hay citas confirmadas próximas.</p>
            ) : (
              <ul className="divide-y divide-luna-50/10">
                {upcoming.map((u) => (
                  <li key={u.id}>
                    <Link href={`/admin/prospectos/${u.id}`} className="flex items-center gap-3 py-3">
                      <CalendarCheck className="h-4 w-4 text-luna-300" aria-hidden="true" />
                      <span className="flex-1 truncate text-sm text-white">{u.name} <span className="text-ink-dim">· {u.serviceName}</span></span>
                      <span className="text-xs text-ink-muted">{u.agreedAt ? fmt.format(u.agreedAt) : ""}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Analítica">
            <div className="flex gap-3 text-sm text-ink-muted">
              <BarChart3 className="h-5 w-5 shrink-0 text-luna-300" aria-hidden="true" />
              {settings.analytics.ga4Id ? (
                <p>
                  GA4 está configurado ({settings.analytics.ga4Id}). Los indicadores de tráfico y conversión se consultan en Google Analytics; su
                  integración en este panel está prevista para la Fase 2.
                </p>
              ) : (
                <p>
                  GA4 aún no está conectado. Añade el Measurement ID en <Link href="/admin/seo" className="link">SEO y analítica</Link> para empezar a
                  medir los eventos de conversión.
                </p>
              )}
            </div>
            <p className="mt-3 text-xs text-ink-dim">Estados: {Object.values(STATUS_LABEL).join(" · ")}</p>
          </Panel>
        </div>
      </>
    );
  }

  const shortcuts = [
    { href: "/admin/contenido", label: "Editar página de inicio", icon: House },
    { href: "/admin/servicios", label: "Servicios", icon: Boxes },
    { href: "/admin/faqs", label: "Preguntas frecuentes", icon: CircleHelp },
    { href: "/admin/seo", label: "SEO y analítica", icon: Search },
    ...(isAdmin ? [{ href: "/admin/configuracion", label: "Contacto y plantillas", icon: Settings }, { href: "/admin/prospectos/nuevo", label: "Registrar prospecto", icon: Inbox }] : []),
  ];

  return (
    <AdminPage title={`Hola, ${user.name.split(" ")[0]}`} description="Resumen del sitio y de las solicitudes recibidas.">
      {denegado && (
        <p role="alert" className="mb-6 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          No tienes permisos para la sección solicitada.
        </p>
      )}
      {crm}
      <h2 className="mb-3 mt-10 text-lg font-semibold">Accesos rápidos</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((s) => (
          <Link key={s.href} href={s.href} className="flex items-center gap-3 rounded-xl border border-luna-50/10 bg-luna-700/25 px-4 py-3.5 text-sm font-medium hover:border-luna-50/30">
            <s.icon className="h-4 w-4 text-luna-300" aria-hidden="true" /> {s.label}
          </Link>
        ))}
      </div>
    </AdminPage>
  );
}
