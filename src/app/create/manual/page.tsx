import { ManualCreation } from "@/features/creation/manual-creation";

export default async function ManualPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  return <ManualCreation editingExisting={edit === "1"} />;
}
