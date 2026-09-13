import { AppFallback } from "@/components/shared/app-fallback";

export default function NotFound() {
  return (
    <AppFallback
      title="Page not found"
      description="This page doesn't exist or may have moved. Return to ScheduleBud to create or open a schedule."
    />
  );
}
