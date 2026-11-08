"use client";

import { useActionState } from "react";
import { createUserAction } from "@/app/admin/actions/users";
import { changePasswordAction } from "@/app/admin/actions/auth";
import { FormAlert, SubmitButton } from "./ui";

export function CreateUserForm() {
  const [state, action] = useActionState(createUserAction, null);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-[1fr_1fr_160px_auto] sm:items-end">
      <div>
        <label htmlFor="u-name" className="field-label">Nombre</label>
        <input id="u-name" name="name" className="field" required maxLength={120} />
      </div>
      <div>
        <label htmlFor="u-email" className="field-label">Correo</label>
        <input id="u-email" name="email" type="email" className="field" required maxLength={160} />
      </div>
      <div>
        <label htmlFor="u-role" className="field-label">Rol</label>
        <select id="u-role" name="role" className="field" defaultValue="EDITOR">
          <option value="EDITOR">Editor</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>
      <SubmitButton className="btn-primary">Crear usuario</SubmitButton>
      <div className="sm:col-span-4">
        <FormAlert state={state} />
        {state?.secret && (
          <p className="mt-2 rounded-xl border border-luna-50/20 bg-luna-900 px-4 py-3 font-mono text-sm text-luna-50">
            Contraseña temporal: <span className="select-all">{state.secret}</span>
          </p>
        )}
      </div>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePasswordAction, null);
  return (
    <form action={action} className="max-w-md space-y-4">
      <div>
        <label htmlFor="cp-current" className="field-label">Contraseña actual</label>
        <input id="cp-current" name="current" type="password" autoComplete="current-password" className="field" required />
      </div>
      <div>
        <label htmlFor="cp-new" className="field-label">Nueva contraseña</label>
        <input id="cp-new" name="password" type="password" autoComplete="new-password" minLength={12} className="field" required />
        <p className="field-hint">Mínimo 12 caracteres, con letras y números.</p>
      </div>
      <div>
        <label htmlFor="cp-new2" className="field-label">Repite la nueva contraseña</label>
        <input id="cp-new2" name="password2" type="password" autoComplete="new-password" className="field" required />
      </div>
      <FormAlert state={state} />
      <SubmitButton>Cambiar contraseña</SubmitButton>
    </form>
  );
}
