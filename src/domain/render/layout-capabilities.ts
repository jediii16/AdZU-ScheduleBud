import type { LayoutId } from "@/domain/design/types";
import {
  resolveTargetComposition,
  type TargetCompositionFamily,
} from "@/domain/device/composition";
import type { DeviceVariant, VisibleFields } from "@/domain/device/types";

export type DetailAvailability = "available" | "larger-grid-targets";

export type LayoutDetailCapabilities = {
  compositionFamily: TargetCompositionFamily;
  fieldOrder: readonly (keyof VisibleFields)[];
  fields: Record<keyof VisibleFields, DetailAvailability>;
  preferenceScope: "project" | "variant-layout";
  defaultFields: Partial<VisibleFields>;
};

const DEFAULT_FIELD_ORDER: readonly (keyof VisibleFields)[] = [
  "time",
  "room",
  "professor",
  "section",
];

export function resolveLayoutDetailCapabilities(
  layoutId: LayoutId,
  variant: DeviceVariant,
): LayoutDetailCapabilities {
  const compositionFamily = resolveTargetComposition(variant);
  const compactPhoneGrid =
    layoutId === "grid" && compositionFamily === "phonePortrait";
  return {
    compositionFamily,
    fieldOrder: compactPhoneGrid
      ? ["room", "time", "professor", "section"]
      : DEFAULT_FIELD_ORDER,
    fields: {
      time: "available",
      room: "available",
      professor: "available",
      section: compactPhoneGrid ? "larger-grid-targets" : "available",
    },
    preferenceScope: compactPhoneGrid ? "variant-layout" : "project",
    defaultFields: compactPhoneGrid ? { room: true, time: false } : {},
  };
}

export function resolveLayoutVisibleFields(
  layoutId: LayoutId,
  projectFields: VisibleFields,
  variant: DeviceVariant,
  capabilities = resolveLayoutDetailCapabilities(layoutId, variant),
): VisibleFields {
  const deviceFields = variant.visibleFieldsOverride;
  const layoutFields = variant.layoutVisibleFieldsOverride?.[layoutId];
  return Object.fromEntries(
    (Object.keys(projectFields) as (keyof VisibleFields)[]).map((field) => [
      field,
      layoutFields?.[field] ??
        deviceFields?.[field] ??
        capabilities.defaultFields[field] ??
        projectFields[field],
    ]),
  ) as VisibleFields;
}

export function applyLayoutDetailCapabilities(
  fields: VisibleFields,
  capabilities: LayoutDetailCapabilities,
): VisibleFields {
  return Object.fromEntries(
    (Object.keys(fields) as (keyof VisibleFields)[]).map((field) => [
      field,
      capabilities.fields[field] === "available" && fields[field],
    ]),
  ) as VisibleFields;
}
