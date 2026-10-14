import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tom = "neutral" | "accent" | "success" | "warning" | "danger";

const TONS: Record<Tom, string> = {
  neutral: "bg-surface-muted text-muted-foreground",
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

export function Badge({
  tom = "neutral",
  className,
  children,
}: {
  tom?: Tom;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONS[tom],
        className,
      )}
    >
      {children}
    </span>
  );
}
