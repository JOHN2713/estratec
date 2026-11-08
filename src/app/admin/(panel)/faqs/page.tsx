import { CollectionIndex } from "@/components/admin/Collections";

export const metadata = { title: "Preguntas frecuentes" };

export default async function Page({ searchParams }: { searchParams: Promise<{ eliminado?: string }> }) {
  const sp = await searchParams;
  return <CollectionIndex kind="faq" flash={sp.eliminado ? "Elemento eliminado." : undefined} />;
}
