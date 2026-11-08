import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "@/components/admin/AuthForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/admin");
  return (
    <>
      <h1 className="mb-6 text-xl font-bold">Panel administrativo</h1>
      <LoginForm />
    </>
  );
}
