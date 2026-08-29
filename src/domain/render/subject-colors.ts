import type { ProjectDesign } from "@/domain/project";
import type { Subject } from "@/domain/schedule/types";

export type SubjectColorConfiguration = ProjectDesign["subjectColors"];

function paletteColor(
  subjectIndex: number,
  automaticPalette: readonly string[],
): string {
  return automaticPalette[subjectIndex % automaticPalette.length] ?? "#FFFFFF";
}

export function resolveAutomaticSubjectColor({
  subjectId,
  subjects,
  automaticPalette,
}: {
  subjectId: string;
  subjects: readonly Subject[];
  automaticPalette: readonly string[];
}): string {
  const index = subjects.findIndex((subject) => subject.id === subjectId);
  return paletteColor(Math.max(0, index), automaticPalette);
}

export function resolveSubjectColor({
  subjectId,
  subjects,
  automaticPalette,
  configuration,
}: {
  subjectId: string;
  subjects: readonly Subject[];
  automaticPalette: readonly string[];
  configuration: SubjectColorConfiguration;
}): string {
  const automatic = resolveAutomaticSubjectColor({
    subjectId,
    subjects,
    automaticPalette,
  });
  if (configuration.mode === "single")
    return configuration.singleColor ?? automaticPalette[0] ?? automatic;
  if (configuration.mode === "custom")
    return configuration.bySubjectId[subjectId] ?? automatic;
  return automatic;
}

export function seedCustomSubjectColors({
  subjects,
  automaticPalette,
  existing = {},
}: {
  subjects: readonly Subject[];
  automaticPalette: readonly string[];
  existing?: Readonly<Record<string, string>>;
}): Record<string, string> {
  return Object.fromEntries(
    subjects.map((subject) => [
      subject.id,
      existing[subject.id] ??
        resolveAutomaticSubjectColor({
          subjectId: subject.id,
          subjects,
          automaticPalette,
        }),
    ]),
  );
}
