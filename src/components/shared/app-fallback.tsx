import { BrandLockup } from "./brand-lockup";

const actionClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand";

export function AppFallback({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-lg text-center">
        <div className="mb-8 flex justify-center">
          <BrandLockup />
        </div>
        <h1 className="sb-page-title">{title}</h1>
        <p className="mt-4 text-text-secondary">{description}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {onRetry ? (
            <button type="button" onClick={onRetry} className={actionClass}>
              Try again
            </button>
          ) : null}
          {/* A full navigation also recovers a failed client route. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className={actionClass}>
            Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}
