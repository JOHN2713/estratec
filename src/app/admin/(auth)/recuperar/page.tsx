import { RequestResetForm } from "@/components/admin/AuthForms";

export const metadata = { title: "Recuperar contraseña" };

export default function RecoverPage() {
  return (
    <>
      <h1 className="mb-2 text-xl font-bold">Recuperar contraseña</h1>
      <p className="mb-6 text-sm text-ink-muted">Te enviaremos un enlace de un solo uso para crear una nueva contraseña.</p>
      <RequestResetForm />
    </>
  );
}
