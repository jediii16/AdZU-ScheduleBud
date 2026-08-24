import program0 from "./programs/bsn-stem.json";
import program1 from "./programs/bsn-nonstem.json";
import program2 from "./programs/bscs.json";
import program3 from "./programs/bsit.json";
import program4 from "./programs/bsnmca.json";
import program5 from "./programs/aeet.json";
import program6 from "./programs/bsbiomed.json";
import program7 from "./programs/bscpe.json";
import program8 from "./programs/bsece.json";
import program9 from "./programs/bsce-cm.json";
import program10 from "./programs/bsce-st.json";
import program11 from "./programs/bsce-gt.json";
import program12 from "./programs/bsmath.json";
import program13 from "./programs/bsbio.json";
import program14 from "./programs/bsed.json";
import program15 from "./programs/beed.json";
import program16 from "./programs/bsped.json";
import program17 from "./programs/beced.json";
import program18 from "./programs/ba-comm.json";
import program19 from "./programs/baels.json";
import program20 from "./programs/baints.json";
import program21 from "./programs/baphilo.json";
import program22 from "./programs/bspsy.json";
import program23 from "./programs/bsac-abm.json";
import program24 from "./programs/bsac-nonabm.json";
import program25 from "./programs/bsma-abm.json";
import program26 from "./programs/bsma-nonabm.json";
import program27 from "./programs/bsbafm.json";
import program28 from "./programs/bsbamm.json";
import program29 from "./programs/bsbaentre.json";
import program30 from "./programs/bsoa.json";
import program31 from "./programs/bslm.json";

import { loadCurriculumPrograms } from "./schema";

const rawPrograms: unknown[] = [
  program0,
  program1,
  program2,
  program3,
  program4,
  program5,
  program6,
  program7,
  program8,
  program9,
  program10,
  program11,
  program12,
  program13,
  program14,
  program15,
  program16,
  program17,
  program18,
  program19,
  program20,
  program21,
  program22,
  program23,
  program24,
  program25,
  program26,
  program27,
  program28,
  program29,
  program30,
  program31,
];

export const curriculumPrograms = loadCurriculumPrograms(rawPrograms);
export const curriculumProgramById = new Map(
  curriculumPrograms.map((program) => [program.id, program]),
);
