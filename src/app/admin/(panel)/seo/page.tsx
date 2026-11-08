import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { can, requireEditor } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { parseSeo } from "@/lib/seo";
import { SETTING_SPECS } from "@/lib/editor-specs";
import { saveSettingAction } from "@/app/admin/actions/content";
import { AdminPage, Panel } from "@/components/admin/Page";
import { SpecEditor } from "@/components/admin/SpecEditor";

export const metadata = { title: "SEO, GEO y AEO" };

export default async function SeoPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireEditor();
  const tab = (await searchParams).tab;
  const canAnalytics = can(user, "settings");
  const active = tab === "analitica" && canAnalytics ? "analytics" : tab === "revision" ? "review" : "seo";
  const settings = await getSettings();

  let review: React.ReactNode = null;
  if (active === "review") {
    const [services, projects, articles, faqs] = await Promise.all([
      db.service.findMany({ select: { id: true, name: true, slug: true, status: true, seo: true, summary: true, imageAlt: true, image: true } }),
      db.project.findMany({ select: { id: true, title: true, slug: true, status: true, seo: true, image: true, imageAlt: true } }),
      db.article.findMany({ select: { id: true, title: true, slug: true, status: true, seo: true, image: true, imageAlt: true } }),
      db.faq.count({ where: { status: "PUBLISHED" } }),
    ]);
    const rows = [
      ...services.map((s) => ({ ...s, title: s.name, kind: "Servicio", href: `/admin/servicios/${s.id}`, path: `/servicios/${s.slug}` })),
      ...projects.map((p) => ({ ...p, kind: "Proyecto", href: `/admin/proyectos/${p.id}`, path: `/proyectos/${p.slug}` })),
      ...articles.map((a) => ({ ...a, kind: "Artículo", href: `/admin/recursos/${a.id}`, path: `/recursos/${a.slug}` })),
    ].map((r) => {
      const s = parseSeo(r.seo);
      const issues: string[] = [];
      if (!s.title) issues.push("Falta meta title");
      else if (s.title.length > 60) issues.push("Title largo");
      if (!s.description) issues.push("Falta meta description");
      else if (s.description.length > 160) issues.push("Description larga");
      if (r.image && !r.imageAlt) issues.push("Imagen sin texto alternativo");
      if (s.noindex) issues.push("noindex");
      return { ...r, issues };
    });
    review = (
      <>
        <p className="mb-4 text-sm text-ink-muted">{faqs} preguntas frecuentes publicadas (generan datos estructurados FAQPage).</p>
        <div className="overflow-x-auto rounded-2xl border border-luna-50/10">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-luna-700/40 text-xs uppercase tracking-wider text-ink-dim">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Contenido</th>
                <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                <th scope="col" className="px-4 py-3 font-medium">Alertas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luna-50/10">
              {rows.map((r) => (
                <tr key={r.href}>
                  <td className="px-4 py-3">
                    <Link href={r.href} className="font-medium text-white hover:underline">{r.title}</Link>
                    <p className="text-xs text-ink-dim">{r.kind} · {r.path}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{r.status === "PUBLISHED" ? "Publicado" : "Borrador"}</td>
                  <td className="px-4 py-3">
                    {r.issues.length ? <span className="text-amber-300">{r.issues.join(" · ")}</span> : <span className="text-emerald-300">Completo</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  const tabs = [
    { k: "seo", href: "/admin/seo", label: "SEO global y GEO" },
    { k: "review", href: "/admin/seo?tab=revision", label: "Revisión por página" },
    ...(canAnalytics ? [{ k: "analytics", href: "/admin/seo?tab=analitica", label: "Analítica y Search Console" }] : []),
  ];

  return (
    <AdminPage
      title="SEO, GEO y AEO"
      description="Claridad, estructura y autoridad del contenido. No se garantizan posiciones en buscadores ni apariciones en respuestas de IA."
      actions={
        <>
          <a href="/sitemap.xml" target="_blank" className="btn-secondary btn-sm"><ExternalLink className="h-4 w-4" aria-hidden="true" /> sitemap.xml</a>
          <a href="/robots.txt" target="_blank" className="btn-secondary btn-sm"><ExternalLink className="h-4 w-4" aria-hidden="true" /> robots.txt</a>
          <a href="/llms.txt" target="_blank" className="btn-secondary btn-sm"><ExternalLink className="h-4 w-4" aria-hidden="true" /> llms.txt</a>
        </>
      }
    >
      <nav className="mb-6 flex flex-wrap gap-2" aria-label="Secciones">
        {tabs.map((t) => (
          <Link key={t.k} href={t.href} aria-current={active === t.k ? "page" : undefined} className={`btn-sm ${active === t.k ? "btn-primary" : "btn-secondary"}`}>{t.label}</Link>
        ))}
      </nav>
      {active === "seo" && (
        <>
          <Panel className="mb-6" title="Buenas prácticas GEO / AEO">
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink-muted">
              <li>Describe con consistencia qué hace Estratec, a quién ayuda y qué problemas resuelve (Configuración › Organización).</li>
              <li>Redacta las preguntas frecuentes como las haría un cliente y responde de forma directa al inicio.</li>
              <li>Cada servicio responde: qué es, para quién es, qué incluye, cómo funciona y cómo solicitarlo.</li>
              <li>Evita repetir el mismo texto en varias páginas; no crees páginas por país sin una propuesta diferenciada.</li>
            </ul>
          </Panel>
          <SpecEditor key="seo" fields={SETTING_SPECS.seo!.fields} initial={settings.seo} action={saveSettingAction} hidden={{ key: "seo" }} />
        </>
      )}
      {active === "review" && review}
      {active === "analytics" && (
        <>
          <p className="mb-5 text-sm text-ink-muted">
            Eventos registrados: <code>click_whatsapp</code>, <code>form_start</code>, <code>form_submit_success</code>, <code>appointment_request</code>,{" "}
            <code>email_click</code>, <code>service_view</code>. Márcalos como eventos clave en GA4.
          </p>
          <SpecEditor key="analytics" fields={SETTING_SPECS.analytics!.fields} initial={settings.analytics} action={saveSettingAction} hidden={{ key: "analytics" }} />
        </>
      )}
    </AdminPage>
  );
}
