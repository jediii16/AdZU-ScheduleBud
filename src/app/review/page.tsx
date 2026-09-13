import type { Metadata } from "next";
import { ScheduleReview } from "@/features/classes/schedule-review";
import {
  resolveCreationTemplate,
  type TemplateSearchParams,
} from "@/features/creation/template-handoff";
export const metadata: Metadata = {
  title: "Review your schedule — ScheduleBud",
  robots: { index: false, follow: true },
};

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
