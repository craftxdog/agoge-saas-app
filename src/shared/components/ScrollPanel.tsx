import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ScrollPanel({
  children,
  className,
  heightClassName = "max-h-[56vh]",
}: {
  children: ReactNode;
  className?: string;
  heightClassName?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-y-auto overscroll-contain pr-2",
        heightClassName,
        className,
      )}
    >
      <div className="grid gap-3">{children}</div>
    </div>
  );
}
