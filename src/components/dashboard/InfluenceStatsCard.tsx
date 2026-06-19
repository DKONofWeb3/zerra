// src/components/dashboard/InfluenceStatsCard.tsx
// Styled after the "Total Yaps" reference — big primary number with a
// change badge, then two sub-stats below (Earned / Referral style split).
import { cn } from "@/lib/cn";
import { TrendingUp, TrendingDown } from "lucide-react";

interface InfluenceStatsCardProps {
  totalScore: number;
  scoreChangePercent: number;     // 24h change, can be negative
  eligibleVideos: number;
  eligibleChangePercent: number;
  campaignsJoined: number;
  campaignsChangePercent: number;
}

function ChangeBadge({ percent }: { percent: number }) {
  const positive = percent >= 0;
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12.5px] font-medium",
      positive ? "text-success bg-[rgb(var(--success)/0.1)]" : "text-danger bg-[rgb(var(--danger)/0.1)]"
    )}>
      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(percent).toFixed(2)}
    </div>
  );
}

export function InfluenceStatsCard({
  totalScore, scoreChangePercent,
  eligibleVideos, eligibleChangePercent,
  campaignsJoined, campaignsChangePercent,
}: InfluenceStatsCardProps) {
  return (
    <div className="relative overflow-hidden rounded-card border border-white/[0.06] shadow-card p-5 md:p-6"
      style={{ background: "rgb(var(--bg-card))" }}>
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />

      <div className="flex items-center justify-between">
        <p className="text-[13px] text-fg-tertiary">Total Score</p>
        <p className="text-[12px] text-fg-muted">24h Change</p>
      </div>

      <div className="flex items-center gap-3 mt-2 mb-5">
        <p className="font-display font-medium text-[36px] md:text-[42px] text-fg-primary tabular-nums leading-none">
          {totalScore.toLocaleString()}
        </p>
        <ChangeBadge percent={scoreChangePercent} />
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-2xl bg-bg-elevated p-4">
        <div>
          <p className="text-[12px] text-fg-tertiary mb-2">Eligible Videos</p>
          <p className="text-[22px] font-display font-medium text-fg-primary tabular-nums">{eligibleVideos}</p>
          <div className="mt-1.5"><ChangeBadge percent={eligibleChangePercent} /></div>
        </div>
        <div>
          <p className="text-[12px] text-fg-tertiary mb-2">Campaigns Joined</p>
          <p className="text-[22px] font-display font-medium text-fg-primary tabular-nums">{campaignsJoined}</p>
          <div className="mt-1.5"><ChangeBadge percent={campaignsChangePercent} /></div>
        </div>
      </div>
    </div>
  );
}