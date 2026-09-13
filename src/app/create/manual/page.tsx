import type { Metadata } from "next";
import { resolveCreationTemplate } from "@/features/creation/template-handoff";
import { ManualCreation } from "@/features/creation/manual-creation";

export const metadata: Metadata = {
  title: "Enter classes manually — ScheduleBud",
  alternates: { canonical: "/create/manual" },
};

export default async function ManualPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; template?: string | string[] }>;
}) {
  const { edit, template } = await searchParams;
  return (
    <ManualCreation
      editingExisting={edit === "1"}
      templateId={resolveCreationTemplate(template)}
    />
  );
}
