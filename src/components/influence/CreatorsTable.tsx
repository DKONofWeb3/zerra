import { cn } from "@/lib/cn";
import { CreatorAvatar } from "./CreatorAvatar";
import { PlatformIcon } from "@/components/icons/PlatformIcon";
import type { CreatorRow } from "@/lib/types";

interface CreatorsTableProps {
  rows: CreatorRow[];
}

const COLS =
  "grid-cols-[60px_2fr_1.2fr_1fr_0.8fr_1.3fr_1fr]";

/**
 * Top Creators leaderboard. Headers sit on the page background (no card).
 * Each row is a thin-bordered horizontal container at the same level.
 */
export function CreatorsTable({ rows }: CreatorsTableProps) {
  return (
    <div>
      {/* Column headers — sit directly on page bg */}
      <div className={cn("grid gap-4 px-7 mb-4 text-[13px] text-fg-tertiary", COLS)}>
        <div>Rank</div>
        <div>Creators</div>
        <div>Platform</div>
        <div>Score</div>
        <div>Views</div>
        <div>Engagement Rate</div>
        <div>Earnings</div>
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div
            key={i}
            className={cn(
              "grid gap-4 items-center px-7 py-3.5 text-[13.5px]",
              "rounded-2xl border border-white/[0.05]",
              COLS
            )}
            style={{ background: "rgb(8 10 16 / 0.6)" }}
          >
            <div className="text-fg-secondary tabular-nums">{row.rank}</div>
            <div className="flex items-center gap-3 min-w-0">
              <CreatorAvatar id={row.id} name={row.handle} size={36} />
              <div className="leading-tight min-w-0">
                <div className="text-fg-primary truncate">{row.handle}</div>
                <div className="text-[11.5px] text-fg-tertiary truncate">
                  {row.role}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PlatformIcon platform={row.platform} size={14} className="text-fg-secondary" />
              <span className="text-fg-secondary capitalize">
                {row.platform === "tiktok" ? "TikTok" : row.platform}
              </span>
            </div>
            <div className="text-fg-secondary">{row.scoreLabel}</div>
            <div className="text-fg-secondary tabular-nums">{row.views}</div>
            <div className="text-success tabular-nums">{row.engagementRate}%</div>
            <div className="text-brand-glow tabular-nums">
              ${row.earnings.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
