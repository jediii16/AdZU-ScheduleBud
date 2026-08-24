import { z } from "zod";

export const scheduleDaySchema = z.enum([
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
]);
export type ScheduleDay = z.infer<typeof scheduleDaySchema>;

export const time24Schema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Expected a 24-hour HH:mm time");
export type Time24 = z.infer<typeof time24Schema>;

export const importMetadataSchema = z
  .object({
    source: z.enum(["portal", "curriculum", "manual"]).optional(),
    sourceRows: z.array(z.number().int().positive()).optional(),
    rawSubject: z.string().optional(),
    rawTime: z.string().optional(),
    session: z.union([z.string(), z.number()]).optional(),
    schoolYear: z.string().optional(),
    duplicatedFrom: z.string().optional(),
  })
  .passthrough();
export type ImportMetadata = z.infer<typeof importMetadataSchema>;

export const meetingSchema = z.object({
  id: z.string().min(1),
  days: z.array(scheduleDaySchema),
  startTime: time24Schema,
  endTime: time24Schema,
  room: z.string(),
  professor: z.string(),
  enabled: z.boolean().default(true),
  importMetadata: importMetadataSchema.optional(),
});
export type Meeting = z.infer<typeof meetingSchema>;

export const subjectSchema = z.object({
  id: z.string().min(1),
  code: z.string(),
  name: z.string(),
  units: z.number().finite().nonnegative(),
  section: z.string(),
  enabled: z.boolean(),
  isCustom: z.boolean(),
  importMetadata: importMetadataSchema.optional(),
  meetings: z
    .array(meetingSchema)
    .min(1, "Every subject must retain at least one meeting"),
});
export type Subject = z.infer<typeof subjectSchema>;

export const scheduleSchema = z.array(subjectSchema);
export type Schedule = z.infer<typeof scheduleSchema>;

export const SCHEDULE_DAYS = scheduleDaySchema.options;

export type IdFactory = (kind: "subject" | "meeting") => string;
