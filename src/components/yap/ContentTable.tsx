import { ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/cn";
import { ContentThumbnail } from "./ContentThumbnail";
import { PlatformIcon } from "@/components/icons/PlatformIcon";
import type { ContentRow } from "@/lib/types";

interface ContentTableProps {
  rows: ContentRow[];
}

const COLS =
  "grid-cols-[100px_1.4fr_0.7fr_1fr_0.8fr_0.9fr_0.9fr_1fr]";

function HeaderControls() {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <h3 className="text-[16px] font-semibold text-fg-primary">
          Top Performing Content
        </h3>
        <Info className="w-3.5 h-3.5 text-fg-tertiary" />
      </div>
      <div className="flex items-center gap-3">
        <button
          className={cn(
            "h-10 px-4 rounded-2xl flex items-center gap-2 min-w-[140px] justify-between",
            "border border-white/[0.07] bg-bg-card",
            "text-[12.5px] text-fg-secondary hover:text-fg-primary transition-colors"
          )}
        >
          <span>All Platform</span>
          <ChevronDown className="w-3.5 h-3.5 text-fg-tertiary" />
        </button>
        <button
          className={cn(
            "h-10 px-4 rounded-2xl flex items-center gap-2 min-w-[180px] justify-between",
            "border border-white/[0.07] bg-bg-card",
            "text-[12.5px] text-fg-secondary hover:text-fg-primary transition-colors"
          )}
        >
          <span>
            Sort by: <span className="text-fg-primary">Engagement</span>
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-fg-tertiary" />
        </button>
      </div>
    </div>
  );
}

export function ContentTable({ rows }: ContentTableProps) {
  return (
    <div>
      <HeaderControls />

      {/* Column headers */}
      <div className={cn("grid gap-3 px-5 mb-3 text-[12px] text-fg-tertiary", COLS)}>
        <div>Content</div>
        <div></div>
        <div>Platform</div>
        <div>Platform</div>
        <div>Score</div>
        <div>Views</div>
        <div>Eng. Rate</div>
        <div>Watch Time</div>
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className={cn(
              "grid gap-3 items-center px-5 py-3 text-[12.5px]",
              "rounded-2xl border border-white/[0.05]",
              COLS
            )}
            style={{ background: "rgb(8 10 16 / 0.6)" }}
          >
            <ContentThumbnail
              thumbId={row.thumbId}
              duration={row.duration}
              contentType={row.contentType}
            />
            <div className="leading-tight min-w-0">
              <div className="text-fg-primary truncate">{row.handle}</div>
              <div className="text-[11px] text-fg-tertiary truncate">
                {row.role}
              </div>
            </div>
            <div>
              <PlatformIcon platform={row.platform} size={16} className="text-fg-secondary" />
            </div>
            <div className="flex items-center gap-1.5">
              <PlatformIcon platform={row.platform} size={12} className="text-fg-secondary" />
              <span className="text-fg-secondary">
                {row.platform === "youtube" ? "YouTube" : "TikTok"}
              </span>
            </div>
            <div className="text-fg-secondary">{row.scoreLabel}</div>
            <div className="text-fg-secondary tabular-nums">{row.views}</div>
            <div className="text-success tabular-nums">{row.engagementRate}%</div>
            <div className="text-fg-tertiary tabular-nums">{row.watchTime}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
