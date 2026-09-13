"use client";

import { AppFallback } from "@/components/shared/app-fallback";

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <AppFallback
      title="Something went wrong"
      description="ScheduleBud couldn't display this page. Try again, or return to Home."
      onRetry={retry}
    />
  );
}
