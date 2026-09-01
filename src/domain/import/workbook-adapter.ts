import { read, utils } from "xlsx";

import type { IdFactory } from "@/domain/schedule";

import { parsePortalRows, type PendingPortalImport } from "./portal-parser";

export const MAX_PORTAL_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_PORTAL_WORKBOOK_BYTES = MAX_PORTAL_FILE_BYTES;

export function validatePortalFile(
  file: Pick<File, "name" | "size">,
): string[] {
  const errors: string[] = [];
  if (!/\.(?:xlsx|pdf)$/i.test(file.name))
    errors.push("Schedule files must be PDF or XLSX files.");
  if (file.size > MAX_PORTAL_FILE_BYTES)
    errors.push("Schedule files must be 5 MB or smaller.");
  return errors;
}

export function parsePortalWorkbook(
  bytes: ArrayBuffer,
  options: { idFactory: IdFactory },
): PendingPortalImport {
  // Normalize cross-realm ArrayBuffers (worker, browser, and test environments)
  // before passing bytes to SheetJS.
  const workbook = read(new Uint8Array(bytes), { type: "array", dense: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("The workbook has no worksheets.");
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet)
    throw new Error("The workbook's first worksheet could not be read.");
  const rows = utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    raw: true,
    defval: null,
    blankrows: false,
  });
  return parsePortalRows(rows, { ...options, sheetName });
}
