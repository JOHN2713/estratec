import { requireUser } from "@/lib/auth";
import { logoutAllAction } from "@/app/admin/actions/auth";
import { AdminPage, Panel } from "@/components/admin/Page";
import { ChangePasswordForm } from "@/components/admin/UserForms";

export const metadata = { title: "Mi cuenta" };

export default async function AccountPage() {
  const me = await requireUser();
  return (
    <AdminPage title="Mi cuenta" description={`${me.name} · ${me.email} · ${me.role === "ADMIN" ? "Administrador" : "Editor"}`}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Cambiar contraseña">
          <ChangePasswordForm />
        </Panel>
        <Panel title="Sesiones" description="Cierra la sesión en todos los dispositivos donde hayas ingresado.">
          <form action={logoutAllAction}>
            <button type="submit" className="btn-secondary">Cerrar todas mis sesiones</button>
          </form>
        </Panel>
      </div>
    </AdminPage>
  );
}
