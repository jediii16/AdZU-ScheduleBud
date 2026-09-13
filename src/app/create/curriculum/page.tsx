import { CurriculumCreation } from "@/features/creation/curriculum-creation";
import {
  resolveCreationTemplate,
  type TemplateSearchParams,
} from "@/features/creation/template-handoff";
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
