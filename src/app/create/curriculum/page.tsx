import type { Metadata } from "next";
import { CurriculumCreation } from "@/features/creation/curriculum-creation";
import {
  resolveCreationTemplate,
  type TemplateSearchParams,
} from "@/features/creation/template-handoff";
export const metadata: Metadata = {
  title: "Use curriculum — ScheduleBud",
  alternates: { canonical: "/create/curriculum" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<TemplateSearchParams>;
}) {
  return (
    <CurriculumCreation
      templateId={resolveCreationTemplate((await searchParams).template)}
    />
  );
}
