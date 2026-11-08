"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { sendTestEmailAction } from "@/app/admin/actions/mail";
import { FormAlert, SubmitButton } from "./ui";

export function MailTestButton({ disabled }: { disabled?: boolean }) {
  const [state, action] = useActionState(sendTestEmailAction, null);
  return (
    <form action={action} className="mt-4 space-y-3">
      <SubmitButton className="btn-secondary btn-sm" pendingText="Enviando…" disabled={disabled}>
        <Send className="h-4 w-4" aria-hidden="true" /> Enviar correo de prueba
      </SubmitButton>
      <FormAlert state={state} />
    </form>
  );
}
