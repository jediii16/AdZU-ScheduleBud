import { describe, expect, it } from "vitest";

import {
  PngExportCoordinator,
  photoExportBlockReason,
  sanitizePngFilename,
} from "@/features/export/png-export";

describe("PNG export coordination", () => {
  it("requires one Photo and allows one to four Polaroid photos", () => {
    expect(photoExportBlockReason("photo", 0)).toMatch(/Add a photo/);
    expect(photoExportBlockReason("photo", 1, "hero")).toBeNull();
    expect(photoExportBlockReason("photo", 1, "split")).toBeNull();
    expect(photoExportBlockReason("photo", 1, "polaroid")).toBeNull();
    expect(photoExportBlockReason("photo", 2, "polaroid")).toBeNull();
    expect(photoExportBlockReason("photo", 3, "polaroid")).toBeNull();
    expect(photoExportBlockReason("photo", 4, "polaroid")).toBeNull();
    expect(photoExportBlockReason("photo", 5, "polaroid")).toMatch(
      /maximum of 4/,
    );
    expect(photoExportBlockReason("planner", 0)).toBeNull();
  });
  it("uses predictable sanitized filenames", () => {
    expect(sanitizePngFilename("My Semester / Phone")).toBe(
      "my-semester-phone.png",
    );
  });

  it("locks repeated requests and recovers after an error", async () => {
    const coordinator = new PngExportCoordinator();
    let release: (() => void) | undefined;
    const first = coordinator.run(
      () =>
        new Promise<string>((resolve) => {
          release = () => resolve("done");
        }),
    );
    expect(coordinator.busy).toBe(true);
    expect(await coordinator.run(async () => "duplicate")).toBeNull();
    release?.();
    expect(await first).toBe("done");
    await expect(
      coordinator.run(async () => {
        throw new Error("canvas failed");
      }),
    ).rejects.toThrow("canvas failed");
    expect(coordinator.busy).toBe(false);
    expect(await coordinator.run(async () => "recovered")).toBe("recovered");
  });
});
