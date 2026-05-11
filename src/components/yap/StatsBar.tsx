import { Crown, Star, TrendingUp, WalletMinimal, ChevronDown, Filter } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TopCreatorsStats } from "@/lib/types";

interface StatsBarProps {
  stats: TopCreatorsStats;
}

interface StatItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function StatItem({ icon: Icon, label, value }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 flex-1 px-5 py-2.5 min-w-0">
      <span
        className={cn(
          "shrink-0 grid place-items-center w-12 h-12 rounded-xl",
          "border border-white/[0.08]"
        )}
        style={{
          background:
            "linear-gradient(180deg, rgb(20 24 34) 0%, rgb(8 10 16) 100%)",
          boxShadow: "inset 0 1px 0 0 rgb(255 255 255 / 0.05)",
        }}
      >
        <Icon className="w-[18px] h-[18px] text-white" strokeWidth={2} />
      </span>
      <div className="leading-tight min-w-0">
        <div className="text-[12px] text-fg-tertiary">{label}</div>
        <div className="text-[20px] font-semibold text-fg-primary mt-1 truncate tabular-nums">
          {value}
        </div>
      </div>
    </div>
  );
}

/**
 * Horizontal stats bar at the top of Top Creators. Single rounded
 * container, with a strong radial blue glow seeping from the LEFT side
 * (centered behind the first stat). All icons are dark squares with
 * white glyphs — no per-stat highlight box.
 */
export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="flex items-stretch gap-4 flex-wrap">
      {/* Main stats container with blue ambient glow on left */}
      <div
        className={cn(
          "relative flex-1 min-w-[600px] flex items-stretch overflow-hidden",
          "rounded-2xl border border-white/[0.07]"
        )}
        style={{ background: "rgb(var(--bg-card))" }}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)",
          }}
        />

        {/* Left-side blue radial glow */}
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            left: "-8%",
            top: "-50%",
            width: "55%",
            height: "200%",
            background:
              "radial-gradient(ellipse at 30% 50%, rgb(74 125 255 / 0.6), rgb(40 80 200 / 0.25) 30%, transparent 60%)",
            filter: "blur(8px)",
          }}
        />

        <div className="relative flex items-stretch flex-1">
          <StatItem icon={Crown} label="Total Creator" value={stats.totalCreators} />
          <StatItem icon={Star} label="Total Campains" value={stats.totalCampaigns} />
          <StatItem icon={TrendingUp} label="Total View" value={stats.totalView} />
          <StatItem icon={WalletMinimal} label="Total Payouts" value={stats.totalPayouts} />
        </div>
      </div>

      {/* Get Premium pill */}
      <button
        className={cn(
          "relative shrink-0 flex items-center gap-4 pl-3 pr-5 py-2.5 rounded-2xl overflow-hidden",
          "border border-white/[0.07] bg-bg-card",
          "hover:border-white/[0.12] transition-colors"
        )}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)",
          }}
        />

        {/* Stacked badge layers — fanned shadow effect */}
        <div className="relative w-[88px] h-[60px] shrink-0">
          <div
            aria-hidden
            className="absolute rounded-xl"
            style={{
              left: 8, top: 12, width: 76, height: 44,
              background:
                "linear-gradient(135deg, rgb(255 200 100 / 0.4), rgb(255 140 60 / 0.35))",
              transform: "rotate(-12deg)",
              filter: "blur(2px)",
            }}
          />
          <div
            aria-hidden
            className="absolute rounded-xl"
            style={{
              left: 4, top: 8, width: 78, height: 46,
              background:
                "linear-gradient(135deg, rgb(255 200 100 / 0.7), rgb(255 140 60 / 0.6))",
              transform: "rotate(-9deg)",
            }}
          />
          <div
            className="absolute grid place-items-center rounded-xl"
            style={{
              left: 0, top: 4, width: 82, height: 50,
              background:
                "linear-gradient(135deg, rgb(255 200 100), rgb(255 140 60))",
              transform: "rotate(-7deg)",
              boxShadow:
                "0 8px 22px -4px rgb(255 140 60 / 0.55), inset 0 1px 0 0 rgb(255 255 255 / 0.4)",
            }}
          >
            <span className="text-[20px] font-bold text-black leading-none">
              40<span className="text-[14px]">%</span>
            </span>
          </div>
        </div>

        <div className="leading-tight text-left">
          <div className="text-[11.5px] text-fg-tertiary">Experience</div>
          <div className="text-[16px] font-semibold text-fg-primary mt-0.5">
            Get Premium
          </div>
        </div>
      </button>

      {/* Filter dropdown */}
      <button
        className={cn(
          "relative shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl overflow-hidden",
          "border border-white/[0.07] bg-bg-card",
          "hover:border-white/[0.12] transition-colors"
        )}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)",
          }}
        />
        <Filter className="w-4 h-4 text-fg-tertiary" />
        <span className="text-[13px] text-fg-secondary">All Platforms</span>
        <ChevronDown className="w-4 h-4 text-fg-tertiary" />
      </button>
    </div>
  );
}
