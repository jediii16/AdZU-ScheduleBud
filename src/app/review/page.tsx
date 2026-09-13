import { ScheduleReview } from "@/features/classes/schedule-review";
import {
  resolveCreationTemplate,
  type TemplateSearchParams,
} from "@/features/creation/template-handoff";
export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<TemplateSearchParams>;
}) {
  return (
    <ScheduleReview
      templateId={resolveCreationTemplate((await searchParams).template)}
    />
  );
}
