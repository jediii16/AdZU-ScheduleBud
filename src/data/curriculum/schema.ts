import { z } from "zod";

export const curriculumSubjectSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  units: z.number().finite().nonnegative(),
});

export const curriculumTermSchema = z.object({
  yearLevel: z.number().int().positive(),
  semester: z.number().int().min(1).max(3),
  subjects: z.array(curriculumSubjectSchema),
});

export const curriculumProgramSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  abbreviation: z.string().min(1).optional(),
  curriculumVersion: z.string().min(1).optional(),
  terms: z.array(curriculumTermSchema),
});

export type CurriculumSubject = z.infer<typeof curriculumSubjectSchema>;
export type CurriculumTerm = z.infer<typeof curriculumTermSchema>;
export type CurriculumProgram = z.infer<typeof curriculumProgramSchema>;

export function loadCurriculumPrograms(input: unknown): CurriculumProgram[] {
  const parsed = z.array(curriculumProgramSchema).safeParse(input);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map(
        (issue) => `${issue.path.join(".") || "curriculum"}: ${issue.message}`,
      )
      .join("; ");
    throw new Error(`Malformed ScheduleBud curriculum data: ${details}`);
  }
  const ids = new Set<string>();
  for (const program of parsed.data) {
    if (ids.has(program.id))
      throw new Error(
        `Malformed ScheduleBud curriculum data: duplicate program id '${program.id}'.`,
      );
    ids.add(program.id);
    const terms = new Set<string>();
    for (const term of program.terms) {
      const termId = `${term.yearLevel}-${term.semester}`;
      if (terms.has(termId))
        throw new Error(
          `Malformed ScheduleBud curriculum data: duplicate term '${program.id}-${termId}'.`,
        );
      terms.add(termId);
    }
  }
  return parsed.data;
}
