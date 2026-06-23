// src/components/dashboard/InfluenceStatsCard.tsx
//
// Matches the reference (dashboard.jpg / image 4): "Total Score" big
// number up top with a 24h-change pill, then TWO sub-cards below —
// "Earned Point" and "Referral Point" — each with its own value and
// change pill, on the same dark-blue/matte-black card pattern used by
// the hero card's sub-stat cards.
//
// All numbers are real fields, currently 0 until campaigns go live and
// AI scoring starts producing real totals — nothing here is mocked.
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

function ChangeBadge({ percent }: { percent: number }) {
  const positive = percent >= 0;
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12.5px] font-medium",
      positive ? "text-success bg-[rgb(var(--success)/0.1)]" : "text-danger bg-[rgb(var(--danger)/0.1)]"
    )}>
      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(percent).toFixed(2)}%
    </div>
  );
}

export function InfluenceStatsCard({
  totalScore, scoreChangePercent,
  earnedPoints, earnedChangePercent,
  referralPoints, referralChangePercent,
}: InfluenceStatsCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-card p-5 md:p-6"
      style={{ background: "linear-gradient(165deg, rgb(15 21 46) 0%, rgb(8 12 28) 100%)" }}
    >
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

      <div className="grid grid-cols-2 gap-3.5">
        <div className="rounded-xl p-3.5" style={{ background: "rgb(15 16 20)" }}>
          <div className="flex items-center gap-1.5 text-fg-tertiary">
            <span className="text-[12px]">Earned Point</span>
            <span className="text-fg-muted text-[12px]">›</span>
          </div>
          <p className="mt-1.5 font-display font-medium text-[18px] text-fg-primary tabular-nums">
            {earnedPoints.toLocaleString()}
          </p>
          <div className="mt-2"><ChangeBadge percent={earnedChangePercent} /></div>
        </div>

        <div className="rounded-xl p-3.5" style={{ background: "rgb(15 16 20)" }}>
          <div className="flex items-center gap-1.5 text-fg-tertiary">
            <span className="text-[12px]">Referral Point</span>
            <span className="text-fg-muted text-[12px]">›</span>
          </div>
          <p className="mt-1.5 font-display font-medium text-[18px] text-fg-primary tabular-nums">
            {referralPoints.toLocaleString()}
          </p>
          <div className="mt-2"><ChangeBadge percent={referralChangePercent} /></div>
        </div>
      </div>
    </div>
  );
}