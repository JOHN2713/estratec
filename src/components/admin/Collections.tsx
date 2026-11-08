import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, Pencil, Plus } from "lucide-react";
import type { PublishStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import { parseSeo } from "@/lib/seo";
import { ICON_NAMES } from "@/components/ui/Icon";
import { ARTICLE_SPEC, KIND_META, PROJECT_SPEC, REDIRECT_SPEC, faqSpec, serviceSpec, type Kind } from "@/lib/collection-specs";
import type { FieldSpec } from "@/lib/editor-specs";
import { deleteItemAction, saveItemAction, togglePublishAction } from "@/app/admin/actions/collections";
import { AdminPage, EmptyState, PublishBadge } from "./Page";
import { SpecEditor } from "./SpecEditor";
import { ConfirmButton } from "./ui";

type Row = { id: string; title: string; sub?: string; status?: PublishStatus; slug?: string; warn?: string };

async function rowsFor(kind: Kind): Promise<Row[]> {
  const seoWarn = (seo: unknown) => {
    const s = parseSeo(seo);
    return !s.title || !s.description ? "SEO incompleto" : undefined;
  };
  switch (kind) {
    case "service":
      return (await db.service.findMany({ orderBy: { order: "asc" } })).map((s) => ({ id: s.id, title: s.name, sub: `/servicios/${s.slug} · orden ${s.order}`, status: s.status, slug: s.slug, warn: seoWarn(s.seo) }));
    case "faq":
      return (await db.faq.findMany({ orderBy: [{ order: "asc" }], include: { service: { select: { shortName: true } } } })).map((f) => ({
        id: f.id, title: f.question, sub: [f.service?.shortName ?? "General", f.showOnHome ? "En inicio" : null, `orden ${f.order}`].filter(Boolean).join(" · "), status: f.status,
      }));
    case "project":
      return (await db.project.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] })).map((p) => ({ id: p.id, title: p.title, sub: `/proyectos/${p.slug}`, status: p.status, slug: p.slug, warn: seoWarn(p.seo) }));
    case "article":
      return (await db.article.findMany({ orderBy: { createdAt: "desc" } })).map((a) => ({ id: a.id, title: a.title, sub: `/recursos/${a.slug}`, status: a.status, slug: a.slug, warn: seoWarn(a.seo) }));
    case "redirect":
      return (await db.redirect.findMany({ orderBy: { createdAt: "desc" } })).map((r) => ({ id: r.id, title: `${r.from} → ${r.to}`, sub: r.permanent ? "301 permanente" : "302 temporal" }));
  }
}

const DESCRIPTIONS: Record<Kind, string> = {
  service: "Tarjetas de la página de inicio y páginas de detalle de cada servicio.",
  faq: "Preguntas generales (inicio) y por servicio. Generan datos estructurados FAQPage.",
  project: "Casos y proyectos. Mientras no haya proyectos publicados, el sitio muestra una invitación a conversar.",
  article: "Blog, guías y artículos (sección Recursos).",
  redirect: "Redirecciones para URLs que cambiaron. Los cambios de slug de contenidos publicados crean una automáticamente.",
};

export async function CollectionIndex({ kind, flash }: { kind: Kind; flash?: string }) {
  await requireEditor();
  const meta = KIND_META[kind];
  const rows = await rowsFor(kind);
  return (
    <AdminPage
      title={meta.plural}
      description={DESCRIPTIONS[kind]}
      actions={
        <Link href={`${meta.base}/nuevo`} className="btn-primary btn-sm">
          <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo {meta.label}
        </Link>
      }
    >
      {flash && <p role="status" className="mb-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{flash}</p>}
      {kind === "project" && (
        <p className="mb-5 rounded-xl border border-luna-50/15 bg-luna-700/25 px-4 py-3 text-sm text-ink-muted">
          Portafolio de GitHub (Fase 2): selecciona los repositorios, confirma qué es público y redacta cada caso con contexto, capturas y resultados verificables. No publiques testimonios ni cifras sin autorización.
        </p>
      )}
      {rows.length === 0 ? (
        <EmptyState title={`Aún no hay ${meta.plural.toLowerCase()}`} action={<Link href={`${meta.base}/nuevo`} className="btn-primary btn-sm">Crear el primero</Link>} />
      ) : (
        <ul className="divide-y divide-luna-50/10 rounded-2xl border border-luna-50/10 bg-luna-700/20">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:flex-nowrap">
              <div className="min-w-0 flex-1">
                <Link href={`${meta.base}/${r.id}`} className="block truncate font-medium text-white hover:underline">{r.title}</Link>
                <p className="truncate text-xs text-ink-dim">
                  {r.sub}
                  {r.warn && <span className="ml-2 text-amber-300">· {r.warn}</span>}
                </p>
              </div>
              {r.status && <PublishBadge status={r.status} />}
              {r.status && (
                <form action={togglePublishAction}>
                  <input type="hidden" name="kind" value={kind} />
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="to" value={r.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"} />
                  <button type="submit" className="btn-ghost btn-sm">{r.status === "PUBLISHED" ? "Despublicar" : "Publicar"}</button>
                </form>
              )}
              <Link href={`${meta.base}/${r.id}`} className="btn-secondary btn-sm" aria-label={`Editar ${r.title}`}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AdminPage>
  );
}

const DEFAULTS: Record<Kind, Record<string, unknown>> = {
  service: { status: "DRAFT", name: "", shortName: "", slug: "", icon: "Layers", order: 99, summary: "", h1: "", intro: "", problem: "", includes: [], solutions: [], deliverables: [], forWho: "", ctaLabel: "Solicitar asesoría", whatsappText: "Hola, Estratec. Quiero información sobre ", image: "", imageAlt: "", seo: {} },
  faq: { status: "DRAFT", question: "", answer: "", serviceId: "", showOnHome: false, order: 50 },
  project: { status: "DRAFT", title: "", slug: "", client: "", sector: "", summary: "", challenge: "", solution: "", tech: [], results: "", image: "", imageAlt: "", videoUrl: "", repoUrl: "", order: 0, seo: {} },
  article: { status: "DRAFT", title: "", slug: "", excerpt: "", author: "", body: "", image: "", imageAlt: "", seo: {} },
  redirect: { from: "", to: "", permanent: true },
};

const nz = (v: string | null | undefined) => v ?? "";

async function loadItem(kind: Kind, id: string): Promise<Record<string, unknown> | null> {
  switch (kind) {
    case "service": {
      const s = await db.service.findUnique({ where: { id } });
      return s && { ...s, image: nz(s.image), imageAlt: nz(s.imageAlt), seo: parseSeo(s.seo) };
    }
    case "faq": {
      const f = await db.faq.findUnique({ where: { id } });
      return f && { status: f.status, question: f.question, answer: f.answer, serviceId: nz(f.serviceId), showOnHome: f.showOnHome, order: f.order };
    }
    case "project": {
      const p = await db.project.findUnique({ where: { id } });
      return p && { ...p, client: nz(p.client), sector: nz(p.sector), results: nz(p.results), image: nz(p.image), imageAlt: nz(p.imageAlt), videoUrl: nz(p.videoUrl), repoUrl: nz(p.repoUrl), seo: parseSeo(p.seo) };
    }
    case "article": {
      const a = await db.article.findUnique({ where: { id } });
      return a && { status: a.status, title: a.title, slug: a.slug, excerpt: a.excerpt, author: nz(a.author), body: a.body, image: nz(a.image), imageAlt: nz(a.imageAlt), seo: parseSeo(a.seo) };
    }
    case "redirect": {
      const r = await db.redirect.findUnique({ where: { id } });
      return r && { from: r.from, to: r.to, permanent: r.permanent };
    }
  }
}

/** Elimina campos que no forman parte del formulario (id, fechas…). */
function pick(fields: FieldSpec[], data: Record<string, unknown>) {
  return Object.fromEntries(fields.map((f) => [f.key, data[f.key]]));
}

export async function CollectionEdit({ kind, id, created }: { kind: Kind; id: string; created?: boolean }) {
  await requireEditor();
  const meta = KIND_META[kind];
  const isNew = id === "nuevo";
  const [item, services] = await Promise.all([
    isNew ? Promise.resolve(DEFAULTS[kind]) : /^[a-z0-9]{20,40}$/i.test(id) ? loadItem(kind, id) : Promise.resolve(null),
    kind === "faq" ? db.service.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }) : Promise.resolve([]),
  ]);
  if (!item) notFound();

  const fields: FieldSpec[] =
    kind === "service" ? serviceSpec(ICON_NAMES) : kind === "faq" ? faqSpec(services) : kind === "project" ? PROJECT_SPEC : kind === "article" ? ARTICLE_SPEC : REDIRECT_SPEC;
  const slug = typeof item.slug === "string" ? item.slug : "";
  const previewPath = meta.publicBase && slug ? `${meta.publicBase}/${slug}` : kind === "faq" ? "/#preguntas" : null;
  const title = isNew ? `Nuevo ${meta.label}` : String(item.name ?? item.title ?? item.question ?? item.from ?? meta.label);

  return (
    <AdminPage
      title={title}
      back={{ href: meta.base, label: meta.plural }}
      actions={
        !isNew && previewPath ? (
          <a href={`/api/preview?path=${encodeURIComponent(previewPath)}`} target="_blank" className="btn-secondary btn-sm">
            <Eye className="h-4 w-4" aria-hidden="true" /> Vista previa
          </a>
        ) : undefined
      }
    >
      {created && <p role="status" className="mb-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Creado correctamente.</p>}
      <SpecEditor fields={fields} initial={pick(fields, item)} action={saveItemAction} hidden={{ kind, ...(isNew ? {} : { id }) }} submitLabel={isNew ? "Crear" : "Guardar cambios"} />
      {!isNew && (
        <form action={deleteItemAction} className="mt-10 rounded-2xl border border-rose-400/20 p-5">
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="id" value={id} />
          <p className="text-sm font-semibold text-rose-200">Eliminar {meta.label}</p>
          <p className="mt-1 text-xs text-ink-muted">Si solo quieres ocultarlo, cámbialo a borrador. Eliminar no se puede deshacer.</p>
          <div className="mt-3">
            <ConfirmButton message={`¿Eliminar definitivamente este ${meta.label}?`} className="btn-secondary btn-sm border-rose-400/40 text-rose-200">
              Eliminar
            </ConfirmButton>
          </div>
        </form>
      )}
    </AdminPage>
  );
}
