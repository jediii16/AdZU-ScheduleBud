import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Switch({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      role="switch"
      data-slot="switch"
      className={cn(
        "relative h-6 w-10 shrink-0 cursor-pointer appearance-none rounded-full border border-input bg-muted transition-colors duration-150 outline-none before:absolute before:top-1/2 before:left-0.5 before:size-4 before:-translate-y-1/2 before:rounded-full before:bg-surface-elevated before:shadow-sm before:transition-transform before:duration-150 checked:border-brand checked:bg-brand checked:before:translate-x-4 focus-visible:border-brand/60 focus-visible:ring-2 focus-visible:ring-brand/25 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transition-none motion-reduce:before:transition-none",
        className,
      )}
      {...props}
    />
  );
}

export { Switch };
