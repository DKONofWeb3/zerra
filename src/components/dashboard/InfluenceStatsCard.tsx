import { cn } from "@/lib/cn";
import { TrendingUp, TrendingDown } from "lucide-react";

interface InfluenceStatsCardProps {
  totalScore: number;
  scoreChangePercent: number;
  earnedPoints: number;
  earnedChangePercent: number;
  referralPoints: number;
  referralChangePercent: number;
}

function ChangeBadge({ percent, onDark }: { percent: number; onDark?: boolean }) {
  const positive = percent >= 0;
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-medium",
      onDark
        ? "text-white bg-black/20"
        : positive ? "text-success bg-[rgb(var(--success)/0.1)]" : "text-danger bg-[rgb(var(--danger)/0.1)]"
    )}>
      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(percent).toFixed(2)}%
    </div>
  );
}

/**
 * "Influence Section" panel, matching dashboard.jpg: Total Score up top,
 * then two sub-cards — "Earned Point" as a bright glowing solid-blue
 * tile, "Referral Point" as a plain dark tile. Both stay at 0 for now
 * since the referral system isn't built yet; wire real values into
 * earnedPoints/referralPoints once it exists, no other changes needed.
 */
export function InfluenceStatsCard({
  totalScore, scoreChangePercent,
  earnedPoints, earnedChangePercent,
  referralPoints, referralChangePercent,
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

      <div className="grid grid-cols-2 gap-4">
        {/* Highlight tile — bright glowing blue */}
        <div
          className="relative overflow-hidden rounded-2xl p-4"
          style={{ background: "linear-gradient(165deg, rgb(15 150 255) 0%, rgb(20 175 255) 100%)" }}
        >
          <div aria-hidden className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(120% 100% at 0% 0%, rgb(255 255 255 / 0.18), transparent 60%)" }} />
          <p className="relative text-[12px] text-white/75">Earned Point</p>
          <p className="relative text-[22px] font-display font-medium text-white tabular-nums mt-2">
            {earnedPoints.toLocaleString()}
          </p>
          <div className="relative mt-1.5"><ChangeBadge percent={earnedChangePercent} onDark /></div>
        </div>

        {/* Plain tile — flat dark */}
        <div className="rounded-2xl p-4" style={{ background: "rgb(var(--bg-elevated))" }}>
          <p className="text-[12px] text-fg-tertiary">Referral Point</p>
          <p className="text-[22px] font-display font-medium text-fg-primary tabular-nums mt-2">
            {referralPoints.toLocaleString()}
          </p>
          <div className="mt-1.5"><ChangeBadge percent={referralChangePercent} /></div>
        </div>
      </div>
    </div>
  );
}