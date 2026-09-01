import { LockKeyhole } from "lucide-react";

export function LocalPrivacyNote() {
  return (
    <div className="flex gap-3 border-t border-border-muted pt-4 text-sm text-text-secondary">
      <LockKeyhole
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-brand"
      />
      <p>
        <strong className="font-semibold text-foreground">
          Processed locally.
        </strong>{" "}
        Your file or pasted text is read in this browser and is not uploaded to
        ScheduleBud.
      </p>
    </div>
  );
}
