import { cn } from "@/lib/cn";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { InfluenceRatingResponse } from "@/lib/types";

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

interface InfluenceRatingCardProps {
  rating: InfluenceRatingResponse;
  referralPoints: number;
  referralChangePercent: number;
}

// "Total Score" = Earned Point (the Influence Rating from
// GET /me/influence-rating) + Referral Point (GET /me/referral). The 24h
// change badge reuses the Influence Rating's own delta since that's the
// only piece of the sum with tracked history.
export function InfluenceRatingCard({ rating, referralPoints, referralChangePercent }: InfluenceRatingCardProps) {
  const earnedPoints = rating.calculated ? rating.score : 0;
  const earnedChangePercent = rating.calculated ? (rating.scoreChange24h ?? 0) : 0;
  const totalScore = earnedPoints + referralPoints;

  return (
    <div className="relative overflow-hidden rounded-card border border-white/[0.06] shadow-card p-5 md:p-6"
      style={{ background: "rgb(var(--bg-card))" }}>
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />

      <div className="flex items-center justify-between">
        <p className="text-[13px] text-fg-tertiary">Total Score</p>
        <p className="text-[12px] text-fg-muted">24h Change</p>
      </div>

      <div className="flex items-center gap-3 mt-2 mb-1">
        <p className="font-display font-medium text-[36px] md:text-[42px] text-fg-primary tabular-nums leading-none">
          {totalScore.toLocaleString()}
        </p>
        <ChangeBadge percent={earnedChangePercent} />
      </div>

      {!rating.calculated ? (
        <p className="text-[12.5px] text-fg-tertiary mb-4">
          Connect a TikTok or Instagram account in Settings to start earning points.
        </p>
      ) : (
        <div className="mb-4">
          {rating.percentile != null && (
            <p className="text-[12.5px] text-fg-tertiary">Top {Math.max(1, 100 - rating.percentile)}% of creators</p>
          )}
          {rating.confidenceScore < 40 && (
            <p className="text-[11.5px] text-fg-muted mt-0.5">Still learning your audience — this improves as you post more.</p>
          )}
        </div>
      )}

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
