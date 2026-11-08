import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { env } from "@/lib/env";
import { getSettings, type SettingKey } from "@/lib/settings";
import { SETTING_SPECS } from "@/lib/editor-specs";
import { saveSettingAction } from "@/app/admin/actions/content";
import { AdminPage, Panel } from "@/components/admin/Page";
import { SpecEditor } from "@/components/admin/SpecEditor";

export const metadata = { title: "Configuración" };

const TABS: SettingKey[] = ["contact", "social", "cta", "emails", "crmTemplates", "org"];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdmin();
  const t = (await searchParams).tab as SettingKey | undefined;
  const tab: SettingKey = t && TABS.includes(t) ? t : "contact";
  const settings = await getSettings();
  const spec = SETTING_SPECS[tab]!;

  return (
    <AdminPage title="Configuración" description="Contacto, CTA, correos automáticos, plantillas del CRM y datos de la organización.">
      <nav className="mb-6 flex flex-wrap gap-2" aria-label="Secciones de configuración">
        {TABS.map((k) => (
          <Link key={k} href={`/admin/configuracion?tab=${k}`} aria-current={tab === k ? "page" : undefined} className={`btn-sm ${tab === k ? "btn-primary" : "btn-secondary"}`}>
            {SETTING_SPECS[k]!.title}
          </Link>
        ))}
      </nav>

      {tab === "emails" && (
        <Panel className="mb-6" title="Proveedor de correo">
          <p className="text-sm text-ink-muted">
            {env.resendKey ? (
              <>Resend está configurado. Remitente: <code className="text-luna-50">{env.mailFrom}</code></>
            ) : (
              <>
                <strong className="text-amber-300">Resend no está configurado.</strong> Define <code>RESEND_API_KEY</code> y <code>MAIL_FROM</code> en las
                variables de entorno de Vercel. Las claves nunca se guardan ni se muestran en el panel.
              </>
            )}
          </p>
        </Panel>
      )}

      <p className="mb-5 text-sm text-ink-muted">{spec.description}</p>
      <SpecEditor key={tab} fields={spec.fields} initial={settings[tab] as Record<string, unknown>} action={saveSettingAction} hidden={{ key: tab }} />
    </AdminPage>
  );
}
