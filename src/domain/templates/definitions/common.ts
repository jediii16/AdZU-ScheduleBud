import { createBlankProject } from "@/domain/project";
import { templateDesignSchema } from "../schema";

// Canonical defaults fill every owned field; no previous design leaks in.
export const baseRecipeDesign = templateDesignSchema
  .strip()
  .parse(
    createBlankProject({
      id: "recipe-defaults",
      now: "2026-09-12T00:00:00.000Z",
    }).design,
  );
