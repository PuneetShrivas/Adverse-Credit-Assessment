import { cn } from "@/lib/utils";
import React from "react";

interface GridBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export function GridBackground({ children, className }: GridBackgroundProps) {
  return (
    <div className={cn("relative flex w-full items-center justify-center", className)}>
      {/* Grid pattern — uses theme border color */}
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)]"
        )}
      />

      {/* Radial fade — uses background & foreground from theme */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center",
          "bg-background",
          "[mask-image:radial-gradient(ellipse_at_center,transparent_20%,var(--foreground))]"
        )}
      />

      {/* Your content */}
      <div className="relative z-20">{children}</div>
    </div>
  );
}
