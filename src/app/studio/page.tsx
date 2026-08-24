import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

import { PageShell } from "@/components/shell/page-shell";
import { buttonVariants } from "@/components/ui/button";

export default function StudioPage() {
  return (
    <PageShell width="narrow">
      <div className="py-14 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-md bg-accent text-brand">
          <Construction aria-hidden="true" />
        </span>
        <h1 className="mt-5 sb-page-title">
          Your schedule is ready for Studio.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-text-secondary">
          The Schedule Studio and wallpaper renderer begin in the next reviewed
          phase. Your project is already saved locally.
        </p>
        <Link
          href="/review"
          className={`${buttonVariants({ variant: "outline", size: "lg" })} mt-7`}
        >
          <ArrowLeft aria-hidden="true" /> Back to review
        </Link>
      </div>
    </PageShell>
  );
}
