import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminPage, Panel } from "@/components/admin/Page";
import { LeadEditForm } from "@/components/admin/LeadForms";

export const metadata = { title: "Nuevo prospecto" };

export default async function NewLead() {
  await requireAdmin();
  const services = await db.service.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } });
  return (
    <AdminPage title="Registrar prospecto" description="Para contactos que llegan por WhatsApp, redes, eventos o referidos." back={{ href: "/admin/prospectos", label: "Prospectos" }}>
      <Panel>
        <LeadEditForm services={services} />
      </Panel>
    </AdminPage>
  );
}
