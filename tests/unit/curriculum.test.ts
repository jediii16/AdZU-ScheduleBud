import { describe, expect, it } from "vitest";

import { curriculumPrograms } from "@/data/curriculum";
import { loadCurriculumPrograms } from "@/data/curriculum/schema";

describe("normalized current curriculum", () => {
  it("loads all supplied programs through the Zod schema", () => {
    expect(curriculumPrograms).toHaveLength(32);
    expect(curriculumPrograms.flatMap((program) => program.terms).length).toBe(
      365,
    );
    expect(
      curriculumPrograms.flatMap((program) =>
        program.terms.flatMap((term) => term.subjects),
      ),
    ).toHaveLength(1939);
    expect(new Set(curriculumPrograms.map((program) => program.id)).size).toBe(
      32,
    );
  });

  it("provides helpful malformed-data errors", () => {
    expect(() =>
      loadCurriculumPrograms([{ id: "Bad ID", name: "", terms: [] }]),
    ).toThrow(/Malformed ScheduleBud curriculum data/);
  });
});
