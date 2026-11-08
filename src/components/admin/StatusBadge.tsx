import type { LeadStatus } from "@prisma/client";
import { STATUS_LABEL } from "@/lib/leads";

const COLORS: Record<LeadStatus, string> = {
  NUEVA: "bg-sky-500/15 text-sky-300",
  EN_REVISION: "bg-indigo-500/15 text-indigo-300",
  CONTACTADO: "bg-cyan-500/15 text-cyan-300",
  CITA_SOLICITADA: "bg-amber-500/15 text-amber-300",
  CITA_CONFIRMADA: "bg-emerald-500/15 text-emerald-300",
  PROPUESTA_ENVIADA: "bg-violet-500/15 text-violet-300",
  GANADO: "bg-green-500/20 text-green-300",
  PERDIDO: "bg-rose-500/15 text-rose-300",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return <span className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[status]}`}>{STATUS_LABEL[status]}</span>;
}
