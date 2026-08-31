import { cn } from "@/lib/cn";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { InfluenceRatingResponse } from "@/lib/types";

function ChangeBadge({ percent }: { percent: number }) {
  const positive = percent >= 0;
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-medium",
      positive ? "text-success bg-[rgb(var(--success)/0.1)]" : "text-danger bg-[rgb(var(--danger)/0.1)]"
    )}>
      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(percent).toFixed(2)}%
    </div>
  );
}

function PillarTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "rgb(var(--bg-elevated))" }}>
      <p className="text-[12px] text-fg-tertiary">{label}</p>
      <p className="text-[22px] font-display font-medium text-fg-primary tabular-nums mt-2">{value}</p>
    </div>
  );
}

/**
 * "Influence Section" panel — a cross-platform Influence Rating (100-1000),
 * computed from a creator's connected TikTok/Instagram data (GET
 * /me/influence-rating). Replaces the old Total Score / Earned Point /
 * Referral Point layout: this card is about social influence, not points —
 * referral points live on the Referral dashboard instead.
 */
export function InfluenceRatingCard({ rating }: { rating: InfluenceRatingResponse }) {
  if (!rating.calculated) {
    return (
      <div className="relative overflow-hidden rounded-card border border-white/[0.06] shadow-card p-5 md:p-6 min-h-[220px] flex flex-col items-center justify-center text-center gap-2"
        style={{ background: "rgb(var(--bg-card))" }}>
        <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
        <p className="text-[14px] font-medium text-fg-primary">No Influence Rating yet</p>
        <p className="text-[12.5px] text-fg-tertiary max-w-[260px]">
          Connect a TikTok or Instagram account in Settings to get rated on your real social footprint.
        </p>
      </div>
    );
  }

  const { score, audienceScore, engagementScore, impactScore, percentile, scoreChange24h, confidenceScore } = rating;

  return (
    <div className="relative overflow-hidden rounded-card border border-white/[0.06] shadow-card p-5 md:p-6"
      style={{ background: "rgb(var(--bg-card))" }}>
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />

      <div className="flex items-center justify-between">
        <p className="text-[13px] text-fg-tertiary">Influence Rating</p>
        <p className="text-[12px] text-fg-muted">24h Change</p>
      </div>

      <div className="flex items-center gap-3 mt-2">
        <p className="font-display font-medium text-[36px] md:text-[42px] text-fg-primary tabular-nums leading-none">
          {score.toLocaleString()}
        </p>
        {scoreChange24h != null && <ChangeBadge percent={scoreChange24h} />}
      </div>

      {percentile != null && (
        <p className="text-[12.5px] text-fg-tertiary mt-1.5">Top {Math.max(1, 100 - percentile)}% of creators</p>
      )}

      {confidenceScore < 40 && (
        <p className="text-[11.5px] text-fg-muted mt-1">Still learning your audience — this improves as you post more.</p>
      )}

      <div className="grid grid-cols-3 gap-3 mt-5">
        <PillarTile label="Audience" value={audienceScore} />
        <PillarTile label="Engagement" value={engagementScore} />
        <PillarTile label="Impact" value={impactScore} />
      </div>
    </div>
  );
}
