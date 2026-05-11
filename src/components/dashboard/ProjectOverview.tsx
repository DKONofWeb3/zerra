import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { TokenIcon, tokenVariantFromName } from "./TokenIcon";
import { StatusPill } from "./StatusPill";
import type { ProjectRow } from "@/lib/types";

interface ProjectOverviewProps {
  rows: ProjectRow[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function FilterPill() {
  return (
    <button
      className={cn(
        "h-9 pl-1.5 pr-3 rounded-full flex items-center gap-2",
        "border border-white/[0.06] bg-white/[0.02]",
        "text-[12.5px] text-fg-secondary hover:text-fg-primary transition-colors"
      )}
    >
      <span
        className={cn(
          "h-6 px-2 rounded-full text-[11px] font-medium tabular-nums grid place-items-center",
          "text-fg-tertiary",
          "bg-white/[0.04]"
        )}
      >
        #2
      </span>
      <span>Top Yappers</span>
      <ChevronDown className="w-3.5 h-3.5 text-fg-tertiary" />
    </button>
  );
}

export function ProjectOverview({ rows }: ProjectOverviewProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card",
        "border border-white/[0.07]",
        "shadow-card"
      )}
      style={{
        background:
          "linear-gradient(180deg, rgb(255 255 255 / 0.025) 0%, rgb(255 255 255 / 0) 50%), rgb(var(--bg-card))",
      }}
    >
      {/* Top inner highlight rim */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.18), transparent)",
        }}
      />

      <div className="relative p-6">
        {/* Filter pill at top right */}
        <div className="flex justify-end mb-4">
          <FilterPill />
        </div>

        {/* Column headers — sit ABOVE the inner card */}
        <div className="px-5 mb-3">
          <div className="grid grid-cols-[60px_120px_1fr_120px_140px_120px] gap-4 text-[12.5px] text-fg-tertiary">
            <div>Rank</div>
            <div>Name</div>
            <div>Project ID</div>
            <div>Date</div>
            <div>Allocations</div>
            <div>Stats</div>
          </div>
        </div>

        {/* Inner card containing the rows */}
        <div
          className={cn(
            "relative overflow-hidden rounded-card",
            "border border-white/[0.07]"
          )}
          style={{
            background:
              "linear-gradient(180deg, rgb(255 255 255 / 0.02) 0%, rgb(0 0 0 / 0.15) 100%), rgb(var(--bg-base) / 0.5)",
          }}
        >
          {/* Inner card top rim */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.12), transparent)",
            }}
          />

          <div className="relative px-5 py-2 divide-y divide-white/[0.04]">
            {rows.map((row) => (
              <div
                key={`${row.rank}-${row.projectId}`}
                className="grid grid-cols-[60px_120px_1fr_120px_140px_120px] gap-4 items-center py-4 text-[13.5px]"
              >
                <div className="text-fg-secondary tabular-nums">#{row.rank}</div>
                <div className="text-fg-secondary">{row.name}</div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <TokenIcon
                      name={row.projectId}
                      variant={tokenVariantFromName(row.projectId)}
                      size={26}
                      className="!rounded-md"
                    />
                    <span className="text-fg-primary">{row.projectId}</span>
                  </div>
                </div>
                <div className="text-fg-secondary tabular-nums">
                  {formatDate(row.date)}
                </div>
                <div className="text-fg-secondary tabular-nums">
                  {row.allocations}
                </div>
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
