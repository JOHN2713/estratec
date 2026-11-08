import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { PublishStatus } from "@prisma/client";

export function AdminPage({
  title,
  description,
  actions,
  back,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      {back && (
        <Link href={back.href} className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {back.label}
        </Link>
      )}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          {description && <div className="mt-1.5 max-w-3xl text-sm text-ink-muted">{description}</div>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function Panel({ title, description, children, className = "" }: { title?: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-luna-50/10 bg-luna-700/25 p-5 sm:p-6 ${className}`}>
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      <div className={title || description ? "mt-5" : ""}>{children}</div>
    </section>
  );
}

export function PublishBadge({ status }: { status: PublishStatus }) {
  return status === "PUBLISHED" ? (
    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300">Publicado</span>
  ) : (
    <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-300">Borrador</span>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-luna-50/15 p-10 text-center">
      <p className="font-semibold text-white">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Denied() {
  return <EmptyState title="Acceso restringido" text="Tu rol no tiene permisos para esta sección. Si lo necesitas, solicítalo a un Administrador." />;
}
