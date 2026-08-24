import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "source-data", "curriculum", "courses.js");
const sourceText = await fs.readFile(sourcePath, "utf8");
const sourceUrl = `data:text/javascript;base64,${Buffer.from(sourceText).toString("base64")}`;
const source = await import(sourceUrl);
const outputDirectory = path.join(
  root,
  "src",
  "data",
  "curriculum",
  "programs",
);
await fs.mkdir(outputDirectory, { recursive: true });

const programs = source.COURSES.map((course) => {
  const terms = Object.entries(source.SUBJECTS_BY_COURSE_YEAR_NEW)
    .filter(([key]) => key.startsWith(`${course.id}-`))
    .map(([key, subjects]) => {
      const match = /-(\d)-(\d)$/.exec(key);
      if (!match) throw new Error(`Malformed current curriculum key: ${key}`);
      return {
        yearLevel: Number(match[1]),
        semester: Number(match[2]),
        subjects: subjects.map(({ code, name, units }) => ({
          code,
          name,
          units,
        })),
      };
    })
    .sort(
      (left, right) =>
        left.yearLevel - right.yearLevel || left.semester - right.semester,
    );
  return {
    id: course.id,
    name: course.name,
    abbreviation: course.code,
    curriculumVersion: "current",
    terms,
  };
});

for (const program of programs) {
  await fs.writeFile(
    path.join(outputDirectory, `${program.id}.json`),
    `${JSON.stringify(program, null, 2)}\n`,
  );
}

const importNames = programs.map((program, index) => `program${index}`);
const registry = [
  ...programs.map(
    (program, index) =>
      `import ${importNames[index]} from "./programs/${program.id}.json";`,
  ),
  "",
  'import { loadCurriculumPrograms } from "./schema";',
  "",
  `const rawPrograms: unknown[] = [${importNames.join(", ")}];`,
  "",
  "export const curriculumPrograms = loadCurriculumPrograms(rawPrograms);",
  "export const curriculumProgramById = new Map(curriculumPrograms.map((program) => [program.id, program]));",
  "",
].join("\n");
await fs.writeFile(
  path.join(root, "src", "data", "curriculum", "index.ts"),
  registry,
);

console.log(
  `Normalized ${programs.length} current-curriculum programs into ${outputDirectory}.`,
);
