"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, requestResetAction, resetPasswordAction } from "@/app/admin/actions/auth";
import { FormAlert, SubmitButton } from "./ui";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="field-label">Correo</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" maxLength={160} />
      </div>
      <div>
        <label htmlFor="password" className="field-label">Contraseña</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" maxLength={200} />
      </div>
      <FormAlert state={state} />
      <SubmitButton className="btn-primary w-full" pendingText="Ingresando…">Ingresar</SubmitButton>
      <p className="text-center text-sm">
        <Link href="/admin/recuperar" className="link">¿Olvidaste tu contraseña?</Link>
      </p>
    </form>
  );
}

export function RequestResetForm() {
  const [state, action] = useActionState(requestResetAction, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="field-label">Correo de tu cuenta</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" maxLength={160} />
      </div>
      <FormAlert state={state} />
      <SubmitButton className="btn-primary w-full" pendingText="Enviando…">Enviar enlace</SubmitButton>
      <p className="text-center text-sm">
        <Link href="/admin/login" className="link">Volver a iniciar sesión</Link>
      </p>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, null);
  if (state?.ok) {
    return (
      <div className="space-y-4">
        <FormAlert state={state} />
        <Link href="/admin/login" className="btn-primary w-full">Iniciar sesión</Link>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="field-label">Nueva contraseña</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={12} className="field" />
        <p className="field-hint">Mínimo 12 caracteres, con letras y números.</p>
      </div>
      <div>
        <label htmlFor="password2" className="field-label">Repite la contraseña</label>
        <input id="password2" name="password2" type="password" autoComplete="new-password" required className="field" />
      </div>
      <FormAlert state={state} />
      <SubmitButton className="btn-primary w-full">Guardar contraseña</SubmitButton>
    </form>
  );
}
