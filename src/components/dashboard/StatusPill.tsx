import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ProjectStatus } from "@/lib/types";

interface StatusPillProps {
  status: ProjectStatus;
}

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; colorVar: string; trend: "up" | "down" }
> = {
  sold: { label: "Sold", colorVar: "--danger", trend: "down" },
  stacked: { label: "Stacked", colorVar: "--success", trend: "up" },
  pending: { label: "Pending", colorVar: "--warning", trend: "up" },
};

export function StatusPill({ status }: StatusPillProps) {
  const config = STATUS_CONFIG[status];
  const TrendIcon = config.trend === "up" ? TrendingUp : TrendingDown;

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className="grid place-items-center w-5 h-5 rounded-full"
        style={{ backgroundColor: `rgb(var(${config.colorVar}) / 0.15)` }}
      >
        <TrendIcon
          className="w-2.5 h-2.5"
          strokeWidth={2.5}
          style={{ color: `rgb(var(${config.colorVar}))` }}
        />
      </span>
      <span
        className={cn(
          "px-2.5 py-0.5 rounded-md text-[12px] font-medium tabular-nums"
        )}
        style={{
          color: `rgb(var(${config.colorVar}))`,
          backgroundColor: `rgb(var(${config.colorVar}) / 0.13)`,
        }}
      >
        {config.label}
      </span>
    </div>
  );
}
