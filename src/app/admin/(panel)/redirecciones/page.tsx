import { CollectionIndex } from "@/components/admin/Collections";

export const metadata = { title: "Redirecciones" };

export default async function Page({ searchParams }: { searchParams: Promise<{ eliminado?: string }> }) {
  const sp = await searchParams;
  return <CollectionIndex kind="redirect" flash={sp.eliminado ? "Elemento eliminado." : undefined} />;
}
