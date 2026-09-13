import type { DeviceCategory } from "@/domain/device/types";
import { BETA_TEMPLATES } from "./definitions/beta-templates";
import { templateRegistrySchema } from "./schema";

export const TEMPLATE_REGISTRY = templateRegistrySchema.parse(BETA_TEMPLATES);
export const getTemplateById = (id: string | null | undefined) =>
  TEMPLATE_REGISTRY.find((template) => template.id === id);
export const getTemplatesByDevice = (category: DeviceCategory) =>
  TEMPLATE_REGISTRY.filter((template) => template.device.category === category);
