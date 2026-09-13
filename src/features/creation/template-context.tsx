import { getTemplateById } from "@/domain/templates/registry";

export function TemplateContext({
  templateId,
}: {
  templateId?: string | undefined;
}) {
  const template = getTemplateById(templateId);
  if (!template) return null;
  return (
    <p className="mb-6 text-sm text-text-secondary">
      Starting with{" "}
      <span className="font-semibold text-foreground">{template.name}</span>
    </p>
  );
}
