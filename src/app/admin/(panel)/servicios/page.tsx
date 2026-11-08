import { CollectionIndex } from "@/components/admin/Collections";

export const metadata = { title: "Servicios" };

export default async function Page({ searchParams }: { searchParams: Promise<{ eliminado?: string }> }) {
  const sp = await searchParams;
  return <CollectionIndex kind="service" flash={sp.eliminado ? "Elemento eliminado." : undefined} />;
}
