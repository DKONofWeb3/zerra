import { useId } from "react";
import { cn } from "@/lib/cn";
import { CreatorAvatar } from "./CreatorAvatar";
import type { FeaturedCreator } from "@/lib/types";

interface FeaturedCreatorCardProps {
  creator: FeaturedCreator;
  /** Sample data points for the chart line. */
  data: number[];
}

const TREND_COLORS = {
  red:   { line: "rgb(232 80 80)",  glow: "rgb(232 80 80 / 0.7)",  mist: "rgb(232 80 80 / 0.20)",  haloA: "rgb(232 80 80 / 0.6)",  haloB: "rgb(232 80 80 / 0.0)" },
  green: { line: "rgb(80 220 130)", glow: "rgb(80 220 130 / 0.7)", mist: "rgb(80 220 130 / 0.20)", haloA: "rgb(180 130 240 / 0.55)", haloB: "rgb(180 130 240 / 0.0)" },
} as const;

/**
 * Featured creator card on Top Performing.
 *
 * Visual recipe (matching Figma exactly):
 *  - Black card with subtle border + top rim
 *  - 4 vertical dotted gridlines running top-to-bottom across the card
 *  - Avatar (rounded-square) on the left with a STRONG colored halo glow
 *    behind it — the avatar is the visual anchor and the chart "starts" from it
 *  - Single thin colored chart line with neon glow + mist gradient mass
 *    underneath (the mist sits in the middle/right of the card)
 *  - A single bright dot indicator on the chart line near the avatar
 *  - Sharp peaks (no over-smoothed curves)
 */
export function FeaturedCreatorCard({ creator, data }: FeaturedCreatorCardProps) {
  const id = useId().replace(/:/g, "");
  const filterId = `featGlow-${id}`;
  const mistId = `featMist-${id}`;
  const haloId = `featHalo-${id}`;

  const colors = TREND_COLORS[creator.trend];

  // Chart geometry — full card dimensions
  const w = 700;
  const h = 220;
  const padTop = 30;
  const padBottom = 30;
  const innerH = h - padTop - padBottom;

  // Chart starts roughly where the avatar ends (~22% in) and runs to the right edge
  const startX = 0.22 * w;
  const endX = w;
  const innerW = endX - startX;

  const minV = Math.min(...data);
  const maxV = Math.max(...data);
  const range = maxV - minV || 1;
  const xs = data.map((_, i) => startX + (i / (data.length - 1)) * innerW);
  const ys = data.map((v) => padTop + (1 - (v - minV) / range) * innerH);

  // Sharper path with light smoothing
  let path = `M ${xs[0]} ${ys[0]}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const x0 = xs[Math.max(0, i - 1)];
    const y0 = ys[Math.max(0, i - 1)];
    const x1 = xs[i];
    const y1 = ys[i];
    const x2 = xs[i + 1];
    const y2 = ys[i + 1];
    const x3 = xs[Math.min(xs.length - 1, i + 2)];
    const y3 = ys[Math.min(ys.length - 1, i + 2)];
    const t = 0.13;
    const c1x = x1 + (x2 - x0) * t;
    const c1y = y1 + (y2 - y0) * t;
    const c2x = x2 - (x3 - x1) * t;
    const c2y = y2 - (y3 - y1) * t;
    path += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}`;
  }

  // First dot indicator — at the very first chart point
  const dotX = xs[0];
  const dotY = ys[0];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card",
        "border border-white/[0.06]",
        "h-[230px]"
      )}
      style={{ background: "rgb(8 10 16)" }}
    >
      {/* Top rim */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.12), transparent)",
        }}
      />

      {/* Vertical dotted gridlines — 4 evenly spaced across the card */}
      <div aria-hidden className="absolute inset-0 pointer-events-none flex">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0"
            style={{
              left: `${(i / 5) * 100}%`,
              width: 0,
              borderLeft: "1px dashed rgb(255 255 255 / 0.08)",
            }}
          />
        ))}
      </div>

      {/* Chart layer */}
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        aria-hidden
      >
        <defs>
          <filter
            id={filterId}
            x="-2%"
            y="-50%"
            width="104%"
            height="200%"
            filterUnits="userSpaceOnUse"
          >
            <feGaussianBlur stdDeviation="3" result="b1" />
            <feGaussianBlur stdDeviation="8" result="b2" />
            <feMerge>
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Mist gradient — colored cloud underneath the line */}
          <radialGradient id={mistId} cx="55%" cy="60%" r="50%">
            <stop offset="0" stopColor={colors.mist} />
            <stop offset="1" stopColor={colors.mist.replace("0.20", "0")} />
          </radialGradient>
          {/* Avatar halo — large colored glow behind the avatar */}
          <radialGradient id={haloId} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor={colors.haloA} />
            <stop offset="0.6" stopColor={colors.haloB} />
            <stop offset="1" stopColor={colors.haloB} />
          </radialGradient>
        </defs>

        {/* Avatar halo — sits behind avatar, large soft colored bloom */}
        <ellipse cx={120} cy={h / 2} rx={130} ry={110} fill={`url(#${haloId})`} />

        {/* Mist underneath the chart */}
        <ellipse cx={w * 0.55} cy={h * 0.65} rx={w * 0.35} ry={h * 0.4} fill={`url(#${mistId})`} />

        {/* Wide blurred glow line */}
        <path
          d={path}
          fill="none"
          stroke={colors.line}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${filterId})`}
          opacity="0.95"
        />
        {/* Crisp center line */}
        <path
          d={path}
          fill="none"
          stroke="rgb(255 255 255 / 0.95)"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bright dot indicator near the avatar (start of line) */}
        <circle cx={dotX} cy={dotY} r="9" fill={colors.line} opacity="0.3" />
        <circle cx={dotX} cy={dotY} r="5" fill="white" />
      </svg>

      {/* Foreground content */}
      <div className="relative p-6 flex items-start gap-5 h-full">
        <CreatorAvatar
          id={creator.id}
          name={creator.name}
          size={72}
          shape="square"
          className="!rounded-2xl shadow-[0_0_30px_rgb(255_255_255_/_0.15)]"
        />
        <div className="leading-tight pt-1">
          <div className="text-[14px] text-fg-tertiary">{creator.name}</div>
          <div className="text-[22px] text-fg-primary font-semibold mt-1.5 tracking-tight">
            {creator.caption}
          </div>
          <span
            className={cn(
              "inline-block mt-3 px-2.5 py-1 rounded text-[10.5px] font-medium",
              "border border-white/[0.07] bg-white/[0.03] text-fg-secondary"
            )}
          >
            {creator.tierLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
