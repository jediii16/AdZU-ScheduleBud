import { describe, expect, it } from "vitest";

import {
  PngExportCoordinator,
  photoExportBlockReason,
  sanitizePngFilename,
} from "@/features/export/png-export";

describe("PNG export coordination", () => {
  it("requires a referenced asset only for Photo Hero export", () => {
    expect(photoExportBlockReason("photo", null)).toMatch(/Add a photo/);
    expect(photoExportBlockReason("photo", "photo-1")).toBeNull();
    expect(photoExportBlockReason("planner", null)).toBeNull();
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
