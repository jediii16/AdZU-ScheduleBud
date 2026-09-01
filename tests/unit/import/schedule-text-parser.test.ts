import { describe, expect, it } from "vitest";

import { parsePastedSchedule } from "@/domain/import";

const ids = (() => {
  let sequence = 0;
  return (kind: "subject" | "meeting") => `${kind}-${sequence++}`;
})();

describe("pasted schedule parsing", () => {
  it("parses AdZU copied cells, drops duplicates, and ignores unscheduled rows", () => {
    const table = `Current Subject\tSection\tDay\tTime\tSession\tRoom\tInstructor\tSchool Year
CS.412&#x9;
A
MTH&#x9;
08:00 AM - 09:20 AM
1\tADV LAB\tJausan, Aleekhazer J.\t2026-2027-1
CIT.017&#x9;
A
MTH&#x9;
11:00 AM - 12:20 PM
1\tBC405\tGallardo,, Maureen Olive M.\t2026-2027-1
CS.411&#x9;
A
07:28 PM - 07:28 PM
1\t\t\t2026-2027-1`;
    const result = parsePastedSchedule(`${table}\n${table}`, {
      idFactory: ids,
    });

    expect(result.subjects).toHaveLength(2);
    expect(result.subjects[0]).toMatchObject({
      code: "CS.412",
      section: "A",
      meetings: [
        {
          days: ["Mon", "Thu"],
          startTime: "08:00",
          endTime: "09:20",
          room: "ADV LAB",
          professor: "Jausan, Aleekhazer J.",
        },
      ],
    });
    expect(result.metadata.schoolYears).toEqual(["2026-2027-1"]);
  });

  it("recognizes a flattened schedule from another university", () => {
    const result = parsePastedSchedule(
      "Subject Sec Units Schedule Room Faculty " +
        "JDN503 Property Law 2A-JDN-ONSITE 4.00 Mon 05:30 PM - 09:30 PM No Room No Instructor " +
        "JDN727 Transportation Law 2V-JDN-ONLINE 2.00 Tue 06:30 PM - 08:30 PM No Room No Instructor",
      { idFactory: ids },
    );

    expect(result.subjects).toMatchObject([
      {
        code: "JDN503",
        section: "2A-JDN-ONSITE",
        units: 4,
        meetings: [{ days: ["Mon"], startTime: "17:30", endTime: "21:30" }],
      },
      {
        code: "JDN727",
        section: "2V-JDN-ONLINE",
        units: 2,
        meetings: [{ days: ["Tue"], startTime: "18:30", endTime: "20:30" }],
      },
    ]);
  });
});
