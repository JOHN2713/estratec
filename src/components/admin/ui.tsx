"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import type { ActionState } from "@/app/admin/actions/types";

export function SubmitButton({ children, className = "btn-primary", pendingText = "Guardando…", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || rest.disabled} {...rest}>
      {pending ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function FormAlert({ state }: { state: ActionState }) {
  if (!state?.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={`rounded-xl border px-4 py-3 text-sm ${
        state.ok ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200" : "border-rose-400/40 bg-rose-500/10 text-rose-200"
      }`}
    >
      {state.message}
    </p>
  );
}

export function FieldError({ state, name }: { state: ActionState; name: string }) {
  const e = state?.errors?.[name];
  return e ? <p className="field-error">{e}</p> : null;
}

/** Botón que pide confirmación antes de enviar (acciones destructivas o sensibles). */
export function ConfirmButton({ message, children, className = "btn-secondary btn-sm" }: { message: string; children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
