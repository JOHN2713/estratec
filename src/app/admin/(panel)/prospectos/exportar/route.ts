import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { STATUS_LABEL } from "@/lib/leads";
import { buildLeadWhere, type LeadFilters } from "@/lib/server/lead-filters";

export const dynamic = "force-dynamic";

/** Celdas CSV seguras: comillas escapadas y prevención de inyección de fórmulas en hojas de cálculo. */
function cell(v: unknown): string {
  let s = v == null ? "" : v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return new Response("No autorizado", { status: 403 });

  const sp = Object.fromEntries(new URL(req.url).searchParams) as LeadFilters;
  const where = buildLeadWhere(sp);
  const rows = await db.lead.findMany({ where, orderBy: { createdAt: "desc" }, take: 10000, include: { assignedTo: { select: { name: true } } } });

  const header = [
    "Fecha", "Nombre", "Correo", "Teléfono", "Empresa", "Servicio", "Estado", "Preferencia de contacto", "País", "Zona horaria",
    "Fecha preferida", "Franja preferida", "Cita acordada", "Responsable", "Fuente", "URL de origen", "utm_source", "utm_medium",
    "utm_campaign", "Mensaje",
  ];
  const lines = rows.map((l) =>
    [
      l.createdAt, l.name, l.email, l.phone, l.company, l.serviceName, STATUS_LABEL[l.status], l.contactPref, l.country, l.timezone,
      l.preferredDate?.toISOString().slice(0, 10), l.preferredSlot, l.agreedAt, l.assignedTo?.name, l.source, l.originUrl,
      l.utmSource, l.utmMedium, l.utmCampaign, l.message,
    ]
      .map(cell)
      .join(","),
  );
  await audit("lead.exported", { userId: user.id, meta: { count: rows.length, filters: Object.keys(sp).join(",") } });

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + [header.map(cell).join(","), ...lines].join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="prospectos-estratec-${stamp}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
