import { CollectionEdit } from "@/components/admin/Collections";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ creado?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  return <CollectionEdit kind="article" id={id} created={!!sp.creado} />;
}
