import "server-only";
import type { LeadSource, LeadStatus, Prisma } from "@prisma/client";
import { STATUS_ORDER } from "@/lib/leads";

export type LeadFilters = {
  q?: string;
  estado?: string;
  servicio?: string;
  pais?: string;
  fuente?: string;
  desde?: string;
  hasta?: string;
  page?: string;
};

const isDate = (v?: string) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

/** Construye el filtro con valores permitidos (nunca se pasa la entrada directamente a la consulta). */
export function buildLeadWhere(f: LeadFilters): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {};
  const q = f.q?.trim().slice(0, 100);
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { message: { contains: q, mode: "insensitive" } },
    ];
  }
  if (f.estado && (STATUS_ORDER as string[]).includes(f.estado)) where.status = f.estado as LeadStatus;
  if (f.servicio) where.serviceSlug = f.servicio === "ninguno" ? null : f.servicio.slice(0, 120);
  if (f.pais) where.country = f.pais.slice(0, 80);
  if (f.fuente === "FORMULARIO_WEB" || f.fuente === "MANUAL") where.source = f.fuente as LeadSource;
  if (isDate(f.desde) || isDate(f.hasta)) {
    where.createdAt = {
      ...(isDate(f.desde) ? { gte: new Date(`${f.desde}T00:00:00-05:00`) } : {}),
      ...(isDate(f.hasta) ? { lte: new Date(`${f.hasta}T23:59:59-05:00`) } : {}),
    };
  }
  return where;
}
