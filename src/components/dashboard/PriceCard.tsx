import { MoreVertical, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { TokenIcon, tokenVariantFromName } from "./TokenIcon";
import { SparklineChart } from "./SparklineChart";
import { Skeleton } from "./Skeleton";
import type { PriceCardData } from "@/lib/types";
import type { LivePrice } from "@/lib/crypto-api";

interface PriceCardProps {
  data: PriceCardData;
  /** Live CoinGecko data for this card. If absent, falls back to mock. */
  live?: LivePrice;
  /**
   * True while waiting for the FIRST fetch to complete. After that,
   * silent background refreshes don't trigger loading state.
   */
  loading?: boolean;
}

function formatPrice(n: number): string {
  // For large numbers (>=1000), no decimals; for smaller, 2 decimals
  if (n >= 1000) {
    return `$${n.toLocaleString("en-US", { maximumFractionDigits: 1 })}`;
  }
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Convert a CoinGecko hourly sparkline (24 numeric points) into the
 * { x, y, label? }[] shape SparklineChart expects, with a labeled peak.
 */
function liveSparklineToPoints(
  prices: number[],
  changePercent: number
): { x: number; y: number; label?: string }[] {
  if (prices.length === 0) return [];

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  // Find the highest point — that's where we put the label
  const peakIdx = prices.indexOf(max);

  return prices.map((p, i) => ({
    x: i / (prices.length - 1),
    y: (p - min) / range,
    label:
      i === peakIdx
        ? `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(1)}%`
        : undefined,
  }));
}

export function PriceCard({ data, live, loading }: PriceCardProps) {
  // Resolve display values: live data wins when available, else fall back to mock
  const effectivePrice = live?.price ?? data.price;
  const effectiveChange = live?.changePercent24h ?? data.changePercent;
  const isUp = effectiveChange >= 0;
  const TrendIcon = isUp ? TrendingUp : TrendingDown;
  const showSkeletons = loading && data.coinGeckoId !== undefined;

  // Build sparkline points from live data when present, else use mock
  const sparklinePoints = live
    ? liveSparklineToPoints(live.sparkline, effectiveChange)
    : data.sparkline;

  const labeledIdx = sparklinePoints.findIndex((p) => p.label !== undefined);
  const neighborIdx =
    labeledIdx > 0 && labeledIdx < sparklinePoints.length - 1
      ? labeledIdx - 2
      : undefined;

  // Derive trend direction from the effective change so live cards
  // get correct line color regardless of mock value
  const effectiveTrend = isUp ? "up" : "down";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card",
        "border border-white/[0.025]",
        "aspect-[1/0.85] min-h-[420px]"
      )}
      style={{ background: "rgb(var(--bg-card))" }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.06), transparent)",
        }}
      />

      <div
        aria-hidden
        className="absolute left-0 top-[100px] w-[3px] h-[44px] rounded-r-sm z-10"
        style={{
          background: "rgb(var(--brand))",
          boxShadow: "0 0 14px 1px rgb(var(--brand-glow) / 0.7)",
        }}
      />

      {/* Chart fills the entire card as a background layer */}
      <div className="absolute inset-0 pointer-events-none">
        {showSkeletons ? (
          <div className="absolute inset-0 grid place-items-end pb-12 px-7">
            <Skeleton className="w-full h-[140px] opacity-50" />
          </div>
        ) : (
          <SparklineChart
            data={sparklinePoints}
            trend={effectiveTrend}
            width={600}
            height={420}
            neighborDotIndex={neighborIdx}
            className="w-full h-full"
          />
        )}
      </div>

      <div className="relative h-full flex flex-col p-7 z-[1]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <TokenIcon
              name={data.assetName}
              variant={tokenVariantFromName(data.assetName)}
              size={42}
            />
            <div className="leading-tight">
              <div className="text-[13px] text-fg-tertiary tabular-nums">
                {data.pair}
              </div>
              <div className="text-[16px] font-semibold text-gradient mt-0.5">
                {data.assetName}
              </div>
            </div>
          </div>

          <button
            aria-label="More options"
            className={cn(
              "shrink-0 grid place-items-center w-8 h-8 rounded-lg",
              "border border-white/[0.06] bg-bg-elevated/50",
              "text-fg-tertiary hover:text-fg-primary transition-colors"
            )}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-7 text-[13px] text-fg-tertiary">Price</div>

        {showSkeletons ? (
          <Skeleton className="mt-2 h-[52px] w-[260px]" />
        ) : (
          <div
            className={cn(
              "mt-2 font-display font-medium num-tabular leading-none",
              "text-[48px] tracking-[-0.02em]",
              "text-gradient"
            )}
          >
            {formatPrice(effectivePrice)}
          </div>
        )}

        {/* Inline trend row */}
        {showSkeletons ? (
          <div className="mt-4 flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-[72px] h-7 rounded-md" />
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2">
            <span
              className={cn(
                "grid place-items-center w-6 h-6 rounded-full",
                isUp ? "text-success" : "text-danger"
              )}
              style={{
                backgroundColor: isUp
                  ? "rgb(var(--success) / 0.15)"
                  : "rgb(var(--danger) / 0.15)",
              }}
            >
              <TrendIcon className="w-3 h-3" strokeWidth={2.5} />
            </span>
            <span
              className={cn(
                "px-3 py-1 rounded-md text-[13px] font-semibold tabular-nums",
                isUp ? "text-success" : "text-danger"
              )}
              style={{
                backgroundColor: isUp
                  ? "rgb(var(--success) / 0.16)"
                  : "rgb(var(--danger) / 0.16)",
              }}
            >
              {isUp ? "+" : ""}
              {effectiveChange.toFixed(1)}%
            </span>
          </div>
        )}

        <div className="flex-1" />
      </div>
    </div>
  );
}
