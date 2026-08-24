import Image from "next/image";

import { cn } from "@/lib/utils";

export function BrandLockup({
  className,
  descriptor = false,
  surface = "light",
}: {
  className?: string;
  descriptor?: boolean;
  surface?: "light" | "dark";
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image
        src={
          surface === "dark"
            ? "/brand/schedulebud-logo-on-dark.svg"
            : "/brand/schedulebud-logo-on-light.svg"
        }
        alt=""
        width={172}
        height={162}
        className="h-9 w-auto shrink-0"
      />
      <span className="flex min-w-0 flex-col">
        <span
          className={cn(
            "font-heading text-lg leading-5 font-extrabold tracking-[-0.03em]",
            surface === "dark" ? "text-white" : "text-foreground",
          )}
        >
          Schedule<span className="text-brand">Bud</span>
        </span>
        {descriptor ? (
          <span
            className={cn(
              "mt-0.5 text-[0.56rem] leading-3 font-semibold tracking-[0.13em] uppercase sm:text-[0.6rem]",
              surface === "dark" ? "text-white/70" : "text-text-muted",
            )}
          >
            for AdZU students
          </span>
        ) : null}
      </span>
    </span>
  );
}
