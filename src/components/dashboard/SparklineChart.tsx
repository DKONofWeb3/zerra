import { useId, useRef, useState, useEffect } from "react";

interface SparklinePoint {
  x: number;
  y: number;
  label?: string;
  dot?: boolean;
}

interface SparklineChartProps {
  data: SparklinePoint[];
  trend: "up" | "down" | "flat";
  width?: number;
  height?: number;
  className?: string;
  neighborDotIndex?: number;
  /** Hover X position as 0–1 fraction of the card width, passed from PriceCard. */
  hoverX?: number | null;
  /** Raw price value to show in hover tooltip. */
  hoverPrice?: number | null;
}

export function SparklineChart({
  data,
  trend,
  width = 600,
  height = 280,
  className,
  neighborDotIndex,
  hoverX = null,
  hoverPrice = null,
}: SparklineChartProps) {
  const id = useId().replace(/:/g, "");
  const filterId  = `glow-${id}`;
  const cloudId   = `cloud-${id}`;
  const gradId    = `area-${id}`;
  const clipId    = `clip-${id}`;
  const pathRef   = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(2000);
  const [drawn,   setDrawn]   = useState(false);

  const padX      = 12;
  const padTop    = 30;
  const padBottom = 28;
  const innerW    = width  - padX * 2;
  const innerH    = height - padTop - padBottom;

  const xs = data.map((_, i) => (i / (data.length - 1)) * innerW + padX);
  const ys = data.map((d)    => padTop + (1 - d.y) * innerH);

  // Catmull-Rom smooth path
  let linePath = `M ${xs[0]} ${ys[0]}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const x0 = xs[Math.max(0, i - 1)],          y0 = ys[Math.max(0, i - 1)];
    const x1 = xs[i],                            y1 = ys[i];
    const x2 = xs[i + 1],                        y2 = ys[i + 1];
    const x3 = xs[Math.min(xs.length-1, i+2)],  y3 = ys[Math.min(ys.length-1, i+2)];
    const t  = 0.18;
    linePath += ` C ${x1+(x2-x0)*t} ${y1+(y2-y0)*t} ${x2-(x3-x1)*t} ${y2-(y3-y1)*t} ${x2} ${y2}`;
  }

  // Closed area path (line + drop to bottom)
  const areaPath = `${linePath} L ${xs[xs.length-1]} ${height} L ${xs[0]} ${height} Z`;

  // Measure path for draw animation
  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      setPathLen(len);
      // Trigger draw on next frame
      requestAnimationFrame(() => setDrawn(true));
    }
  }, [data]);

  const isUp       = trend === "up";
  const lineColor  = "rgb(245 245 250)";
  const glowColor  = isUp ? "rgb(74 125 255)"  : "rgb(232 80 80)";
  const areaTop    = isUp ? "rgba(74,125,255,0.22)"  : "rgba(232,80,80,0.18)";
  const areaBot    = isUp ? "rgba(74,125,255,0)"     : "rgba(232,80,80,0)";

  // Labeled peak
  const labeledIndex  = data.findIndex((d) => d.label !== undefined);
  const dotIndices    = new Set<number>();
  if (labeledIndex >= 0) dotIndices.add(labeledIndex);
  if (neighborDotIndex !== undefined) dotIndices.add(neighborDotIndex);
  data.forEach((d, i) => { if (d.dot) dotIndices.add(i); });

  const cloudCx = labeledIndex >= 0 ? xs[labeledIndex] : width / 2;
  const cloudCy = labeledIndex >= 0 ? ys[labeledIndex] + 30 : height / 2;

  // ── Hover crosshair ───────────────────────────────────────────────────────
  let hoverSvgX: number | null = null;
  let hoverSvgY: number | null = null;
  let nearestIdx = -1;

  if (hoverX !== null) {
    // Map 0-1 fraction to SVG x space
    hoverSvgX = padX + hoverX * innerW;

    // Find nearest data index
    let minDist = Infinity;
    xs.forEach((x, i) => {
      const d = Math.abs(x - hoverSvgX!);
      if (d < minDist) { minDist = d; nearestIdx = i; }
    });

    if (nearestIdx >= 0) {
      // Interpolate Y between two nearest points for smooth tracking
      const lo = xs.findIndex((x) => x >= hoverSvgX!);
      const hi = lo > 0 ? lo : 1;
      const loI = Math.max(0, hi - 1);
      const frac = xs[hi] !== xs[loI] ? (hoverSvgX - xs[loI]) / (xs[hi] - xs[loI]) : 0;
      hoverSvgY = ys[loI] + (ys[hi] - ys[loI]) * Math.min(1, Math.max(0, frac));
    }
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      role="img"
      aria-hidden
    >
      <defs>
        <filter id={filterId} x="-10%" y="-50%" width="120%" height="200%" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="6"  result="b1" />
          <feGaussianBlur stdDeviation="14" result="b2" />
          <feMerge>
            <feMergeNode in="b2" />
            <feMergeNode in="b1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id={cloudId} cx="50%" cy="50%" r="50%">
          <stop offset="0"   stopColor={glowColor} stopOpacity="0.28" />
          <stop offset="0.5" stopColor={glowColor} stopOpacity="0.08" />
          <stop offset="1"   stopColor={glowColor} stopOpacity="0" />
        </radialGradient>

        {/* Gradient fill under curve */}
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={areaTop} />
          <stop offset="100%" stopColor={areaBot} />
        </linearGradient>

        {/* Clip rect for draw animation */}
        <clipPath id={clipId}>
          <rect
            x="0" y="0"
            width={drawn ? width : 0}
            height={height}
            style={{ transition: "width 1.1s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </clipPath>
      </defs>

      {/* Cloud glow at peak */}
      <ellipse cx={cloudCx} cy={cloudCy} rx={innerW * 0.35} ry={innerH * 0.55} fill={`url(#${cloudId})`} />

      {/* Area fill — clipped to draw animation */}
      <g clipPath={`url(#${clipId})`}>
        <path d={areaPath} fill={`url(#${gradId})`} />
      </g>

      {/* Colored glow line */}
      <path
        d={linePath}
        fill="none"
        stroke={glowColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
        filter={`url(#${filterId})`}
        clipPath={`url(#${clipId})`}
      />

      {/* Crisp white main line — animated draw */}
      <path
        ref={pathRef}
        d={linePath}
        fill="none"
        stroke={lineColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLen}
        strokeDashoffset={drawn ? 0 : pathLen}
        style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1)" }}
      />

      {/* Static dots (labeled peak + neighbor) */}
      {Array.from(dotIndices).map((i) => (
        <g key={i}>
          <circle cx={xs[i]} cy={ys[i]} r="5" fill={glowColor} opacity="0.35" />
          <circle cx={xs[i]} cy={ys[i]} r="2.5" fill="white" />
        </g>
      ))}

      {/* Static callout label */}
      {data.map((d, i) =>
        d.label ? (
          <text key={`lbl-${i}`} x={xs[i] + 14} y={ys[i] - 16} fontSize="13" fontWeight="500" fill="rgb(245 245 247)" opacity="0.95">
            {d.label}
          </text>
        ) : null
      )}

      {/* ── Hover crosshair ── */}
      {hoverSvgX !== null && hoverSvgY !== null && (
        <g>
          {/* Vertical dashed line */}
          <line
            x1={hoverSvgX} y1={padTop}
            x2={hoverSvgX} y2={height - padBottom}
            stroke="rgb(255 255 255 / 0.15)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          {/* Glow ring */}
          <circle cx={hoverSvgX} cy={hoverSvgY} r="7" fill={glowColor} opacity="0.2" />
          {/* Dot */}
          <circle cx={hoverSvgX} cy={hoverSvgY} r="3.5" fill="white" />
          <circle cx={hoverSvgX} cy={hoverSvgY} r="3.5" fill={glowColor} opacity="0.5" />

          {/* Tooltip — flip to left side if too close to right edge */}
          {hoverPrice !== null && (() => {
            const tipW = 90;
            const tipH = 28;
            const tipX = hoverSvgX + 10 + tipW > width ? hoverSvgX - tipW - 10 : hoverSvgX + 10;
            const tipY = Math.max(padTop, hoverSvgY - tipH / 2);
            return (
              <g>
                <rect x={tipX} y={tipY} width={tipW} height={tipH} rx="6"
                  fill="rgb(8 10 16)" stroke="rgb(255 255 255 / 0.08)" strokeWidth="1" />
                <text x={tipX + tipW / 2} y={tipY + tipH / 2 + 4.5} textAnchor="middle"
                  fontSize="12" fontWeight="600" fill="rgb(245 245 247)">
                  {hoverPrice >= 1000
                    ? `$${hoverPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                    : `$${hoverPrice.toFixed(4)}`}
                </text>
              </g>
            );
          })()}
        </g>
      )}
    </svg>
  );
}