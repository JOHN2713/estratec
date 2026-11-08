import Link from "next/link";
import { ResetForm } from "@/components/admin/AuthForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nueva contraseña", referrer: "no-referrer" as const };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <>
      <h1 className="mb-6 text-xl font-bold">Crear nueva contraseña</h1>
      {token ? <ResetForm token={token} /> : (
        <p className="text-sm text-ink-muted">El enlace no es válido. <Link href="/admin/recuperar" className="link">Solicita uno nuevo</Link>.</p>
      )}
    </>
  );
}
