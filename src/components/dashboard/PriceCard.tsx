import { useState, useCallback } from "react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/cn";
import { TokenIcon, tokenVariantFromName } from "./TokenIcon";
import { SparklineChart } from "./SparklineChart";
import { Skeleton } from "./Skeleton";
import type { PriceCardData } from "@/lib/types";
import type { LivePrice } from "@/lib/crypto-api";

interface PriceCardProps {
  data: PriceCardData;
  live?: LivePrice;
  loading?: boolean;
}

function formatPrice(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 1 })}`;
  if (n >= 1)    return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(4)}`;
}

function liveSparklineToPoints(
  prices: number[]
): { x: number; y: number }[] {
  if (prices.length === 0) return [];
  const min     = Math.min(...prices);
  const max     = Math.max(...prices);
  const range   = max - min || 1;
  return prices.map((p, i) => ({
    x: i / (prices.length - 1),
    y: (p - min) / range,
  }));
}

function interpolatePrice(
  hoverX: number,
  sparklinePoints: { x: number; y: number }[],
  minPrice: number,
  maxPrice: number,
  padX: number,
  innerW: number
): number {
  if (sparklinePoints.length < 2) return minPrice;
  const svgX = padX + hoverX * innerW;
  const xs   = sparklinePoints.map((_, i) => (i / (sparklinePoints.length - 1)) * innerW + padX);
  const hi   = xs.findIndex((x) => x >= svgX);
  if (hi <= 0) return minPrice + sparklinePoints[0].y * (maxPrice - minPrice);
  const lo   = hi - 1;
  const frac = (svgX - xs[lo]) / (xs[hi] - xs[lo]);
  const y    = sparklinePoints[lo].y + (sparklinePoints[hi].y - sparklinePoints[lo].y) * Math.max(0, Math.min(1, frac));
  return minPrice + y * (maxPrice - minPrice);
}

const PAD_X   = 12;
const INNER_W = 576;

export function PriceCard({ data, live, loading }: PriceCardProps) {
  const [hoverX, setHoverX] = useState<number | null>(null);

  const effectivePrice  = live?.price ?? data.price;
  const effectiveChange = live?.changePercent24h ?? data.changePercent;
  const isUp            = effectiveChange >= 0;
  const showSkeletons   = loading && data.coinGeckoId !== undefined;

  // Strip labels from sparkline — we show % in the badge, not on the chart
  const sparklinePoints = (live
    ? liveSparklineToPoints(live.sparkline)
    : data.sparkline.map(p => ({ x: p.x, y: p.y }))
  );

  const effectiveTrend = isUp ? "up" : "down";

  const priceRange = effectivePrice * 0.05;
  const minPrice   = effectivePrice - priceRange;
  const maxPrice   = effectivePrice + priceRange;

  const hoverPrice = hoverX !== null
    ? interpolatePrice(hoverX, sparklinePoints, minPrice, maxPrice, PAD_X, INNER_W)
    : null;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x    = (e.clientX - rect.left) / rect.width;
    setHoverX(Math.max(0, Math.min(1, x)));
  }, []);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card",
        "border border-white/[0.025]",
       "aspect-[1/0.85] min-h-[180px] md:min-h-[420px] ring-1 ring-white/[0.04]",
        "cursor-crosshair"
      )}
      style={{ background: "rgb(var(--bg-card))" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverX(null)}
    >
      {/* Top rim */}
      <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.06), transparent)" }} />

      {/* Left accent bar */}
      <div aria-hidden className="absolute left-0 top-[50px] md:top-[100px] w-[3px] h-[28px] md:h-[44px] rounded-r-sm z-10"
        style={{ background: "rgb(var(--brand))", boxShadow: "0 0 14px 1px rgb(var(--brand-glow) / 0.7)" }} />

      {/* Chart — bottom 52% */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: "52%" }}>
        {!showSkeletons && (
          <SparklineChart
            data={sparklinePoints}
            trend={effectiveTrend}
            width={600}
            height={220}
            className="w-full h-full"
            hoverX={hoverX}
            hoverPrice={hoverPrice}
          />
        )}
      </div>

      {/* Fade */}
      <div aria-hidden className="absolute left-0 right-0 pointer-events-none"
        style={{ bottom: "52%", height: 60, background: "linear-gradient(180deg, rgb(var(--bg-card)) 0%, transparent 100%)" }} />

      {/* Card content */}
      <div className="relative h-full flex flex-col p-3 md:p-7 z-[1] pointer-events-none">

        {/* Header — icon scaled down on mobile via wrapper */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-7 h-7 md:w-[42px] md:h-[42px] shrink-0 flex items-center justify-center">
              <div className="scale-[0.65] md:scale-100 origin-center">
                <TokenIcon name={data.assetName} variant={tokenVariantFromName(data.assetName)} size={42} />
              </div>
            </div>
            <div className="leading-tight">
              <div className="text-[10px] md:text-[13px] text-fg-tertiary tabular-nums">{data.pair}</div>
              <div className="text-[11px] md:text-[16px] font-semibold text-gradient mt-0.5">{data.assetName}</div>
            </div>
          </div>
          <button
            aria-label="More options"
            className={cn(
              "shrink-0 grid place-items-center w-6 h-6 md:w-8 md:h-8 rounded-lg pointer-events-auto",
              "border border-white/[0.06] bg-bg-elevated/50",
              "text-fg-tertiary hover:text-fg-primary transition-colors"
            )}
          >
            <MoreVertical className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>

        <div className="mt-2 md:mt-7 text-[10px] md:text-[13px] text-fg-tertiary">Price</div>

        {showSkeletons ? (
          <div className="mt-1 flex items-baseline gap-2">
            <Skeleton className="h-7 md:h-[52px] w-[90px] md:w-[220px]" />
            <Skeleton className="h-4 md:h-7 w-[36px] md:w-[60px] rounded-md" />
          </div>
        ) : (
          <div className="mt-1 flex items-baseline gap-2 flex-wrap">
            <div className={cn(
              "font-display font-medium num-tabular leading-none",
              "text-[20px] md:text-[48px] tracking-[-0.02em]",
              "text-gradient transition-all duration-150"
            )}>
              {hoverPrice !== null ? formatPrice(hoverPrice) : formatPrice(effectivePrice)}
            </div>
            <span
              className={cn(
                "px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-md text-[10px] md:text-[14px] font-semibold tabular-nums",
                isUp ? "text-success" : "text-danger"
              )}
              style={{ backgroundColor: isUp ? "rgb(var(--success) / 0.16)" : "rgb(var(--danger) / 0.16)" }}
            >
              {isUp ? "+" : ""}{effectiveChange.toFixed(1)}%
            </span>
          </div>
        )}

        <div className="flex-1" />
      </div>
    </div>
  );
}