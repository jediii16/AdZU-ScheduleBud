import { getTemplateById } from "@/domain/templates/registry";

export type TemplateSearchParams = { template?: string | string[] };
export function resolveCreationTemplate(
  value: TemplateSearchParams["template"],
): string | undefined {
  return typeof value === "string" ? getTemplateById(value)?.id : undefined;
}
export function withCreationTemplate(
  href: string,
  templateId?: string,
): string {
  const id = resolveCreationTemplate(templateId);
  if (!id) return href;
  const [path, hash] = href.split("#");
  return `${path}${path!.includes("?") ? "&" : "?"}template=${encodeURIComponent(id)}${hash ? `#${hash}` : ""}`;
}
