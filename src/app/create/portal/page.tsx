import type { Metadata } from "next";
import { PortalCreation } from "@/features/creation/portal-creation";
import {
  resolveCreationTemplate,
  type TemplateSearchParams,
} from "@/features/creation/template-handoff";
export const metadata: Metadata = {
  title: "Import your schedule — ScheduleBud",
  alternates: { canonical: "/create/portal" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<TemplateSearchParams>;
}) {
  return (
    <PortalCreation
      templateId={resolveCreationTemplate((await searchParams).template)}
    />
  );
}
