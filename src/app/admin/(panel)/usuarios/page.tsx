import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateUserAction } from "@/app/admin/actions/users";
import { AdminPage, Panel } from "@/components/admin/Page";
import { CreateUserForm } from "@/components/admin/UserForms";
import { ConfirmButton } from "@/components/admin/ui";

export const metadata = { title: "Usuarios" };

export default async function UsersPage() {
  const me = await requireAdmin();
  const users = await db.user.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, role: true, active: true, lastLoginAt: true, lockedUntil: true, _count: { select: { sessions: true } } },
  });
  const fmt = new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Guayaquil" });
  const Op = ({ id, op, children, extra, confirm }: { id: string; op: string; children: React.ReactNode; extra?: Record<string, string>; confirm?: string }) => (
    <form action={updateUserAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="op" value={op} />
      {extra && Object.entries(extra).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {confirm ? (
        <ConfirmButton message={confirm} className="btn-ghost btn-sm">{children}</ConfirmButton>
      ) : (
        <button type="submit" className="btn-ghost btn-sm">{children}</button>
      )}
    </form>
  );

  return (
    <AdminPage
      title="Usuarios"
      description="Administrador: gestiona usuarios, configuración y prospectos. Editor: solo contenidos y SEO. Se recomienda activar MFA en una próxima fase para Administradores."
    >
      <Panel title="Nuevo usuario" className="mb-6">
        <CreateUserForm />
      </Panel>
      <div className="overflow-x-auto rounded-2xl border border-luna-50/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-luna-700/40 text-xs uppercase tracking-wider text-ink-dim">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Usuario</th>
              <th scope="col" className="px-4 py-3 font-medium">Rol</th>
              <th scope="col" className="px-4 py-3 font-medium">Último acceso</th>
              <th scope="col" className="px-4 py-3 font-medium">Estado</th>
              <th scope="col" className="px-4 py-3 font-medium"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-luna-50/10">
            {users.map((u) => {
              const self = u.id === me.id;
              const locked = u.lockedUntil && u.lockedUntil > new Date();
              return (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{u.name}{self && <span className="ml-2 text-xs text-ink-dim">(tú)</span>}</p>
                    <p className="text-xs text-ink-dim">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">{u.role === "ADMIN" ? "Administrador" : "Editor"}</td>
                  <td className="px-4 py-3 text-ink-muted">{u.lastLoginAt ? fmt.format(u.lastLoginAt) : "Nunca"} · {u._count.sessions} sesión(es)</td>
                  <td className="px-4 py-3">
                    {!u.active ? <span className="text-rose-300">Inactivo</span> : locked ? <span className="text-amber-300">Bloqueado</span> : <span className="text-emerald-300">Activo</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1">
                      {!self && <Op id={u.id} op="role" extra={{ role: u.role === "ADMIN" ? "EDITOR" : "ADMIN" }} confirm="¿Cambiar el rol de este usuario? Se cerrarán sus sesiones.">{u.role === "ADMIN" ? "Hacer Editor" : "Hacer Admin"}</Op>}
                      {!self && <Op id={u.id} op="toggle" confirm={u.active ? "¿Desactivar este usuario?" : "¿Reactivar este usuario?"}>{u.active ? "Desactivar" : "Activar"}</Op>}
                      {locked && <Op id={u.id} op="unlock">Desbloquear</Op>}
                      <Op id={u.id} op="sessions" confirm="¿Cerrar todas las sesiones de este usuario?">Cerrar sesiones</Op>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
}
