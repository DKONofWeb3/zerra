import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { TokenIcon, tokenVariantFromName } from "@/components/dashboard/TokenIcon";
import { StatusPill } from "@/components/dashboard/StatusPill";
import type { TalkProjectRow } from "@/lib/types";

interface ProjectsTalkAboutTableProps {
  rows: TalkProjectRow[];
}

export function ProjectsTalkAboutTable({ rows }: ProjectsTalkAboutTableProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card",
        "border border-white/[0.05]",
        "shadow-card"
      )}
      style={{ background: "rgb(var(--bg-card))" }}
    >
      {/* Top inner highlight */}
      <div
        className="absolute inset-x-0 top-0 h-1/4 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgb(255 255 255 / 0.02) 0%, transparent 100%)",
        }}
      />

      {/* Subtle dotted texture */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(rgb(255 255 255 / 0.04) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <h3 className="text-[15px] font-medium text-fg-primary">
            Projects to Talk About
          </h3>
          <button
            className={cn(
              "h-8 px-3 rounded-full flex items-center gap-1.5",
              "border border-white/[0.06] bg-white/[0.02]",
              "text-[12px] text-fg-secondary hover:text-fg-primary transition-colors"
            )}
          >
            <span>View More Projects</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Column headers */}
        <div className="px-4 mb-3">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_120px] gap-4 text-[12.5px] text-fg-tertiary">
            <div>Name</div>
            <div>User ID</div>
            <div>Date</div>
            <div></div>
          </div>
        </div>

        {/* Inner card with rows */}
        <div
          className={cn(
            "relative overflow-hidden rounded-card",
            "border border-white/[0.05]"
          )}
          style={{ background: "rgb(var(--bg-base) / 0.4)" }}
        >
          <div className="px-4 py-2">
            {rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1.4fr_1fr_1fr_120px] gap-4 items-center py-3.5 text-[13.5px]"
              >
                <div className="flex items-center gap-2.5">
                  <TokenIcon
                    name={row.name}
                    variant={tokenVariantFromName(row.name)}
                    size={26}
                    className="!rounded-md"
                  />
                  <span className="text-fg-primary">{row.name}</span>
                </div>
                <div className="text-fg-secondary tabular-nums">{row.userId}</div>
                <div className="text-fg-secondary tabular-nums">{row.date}</div>
                <div>
                  <StatusPill status={row.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
