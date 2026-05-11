import { useId } from "react";
import type { EarningsPoint } from "@/lib/types";

interface EarningsLineChartProps {
  data: EarningsPoint[];
  /** Index of the point to pin a tooltip on. */
  highlightIndex: number;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Big earnings line chart with a pinned tooltip on the highlighted point.
 *
 * Visual recipe:
 *  - Light dotted gridlines (subtle)
 *  - Red glowing line with cloud-like glow underneath
 *  - X-axis labels at first / mid / 3/4 / last points
 *  - Tooltip card with date, amount, % change pinned at highlightIndex
 */
export function EarningsLineChart({
  data,
  highlightIndex,
  width = 720,
  height = 280,
  className,
}: EarningsLineChartProps) {
  const id = useId().replace(/:/g, "");
  const filterId = `chartGlow-${id}`;
  const cloudId = `chartCloud-${id}`;
  const areaId = `chartArea-${id}`;

  const padX = 32;
  const padTop = 24;
  const padBottom = 40;

  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;

  // normalize y values
  const minV = Math.min(...data.map((d) => d.value));
  const maxV = Math.max(...data.map((d) => d.value));
  const range = maxV - minV || 1;

  const xs = data.map((_, i) => (i / (data.length - 1)) * innerW + padX);
  const ys = data.map(
    (d) => padTop + (1 - (d.value - minV) / range) * innerH
  );

  // smooth path (catmull-rom-ish)
  let linePath = `M ${xs[0]} ${ys[0]}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const x0 = xs[Math.max(0, i - 1)];
    const y0 = ys[Math.max(0, i - 1)];
    const x1 = xs[i];
    const y1 = ys[i];
    const x2 = xs[i + 1];
    const y2 = ys[i + 1];
    const x3 = xs[Math.min(xs.length - 1, i + 2)];
    const y3 = ys[Math.min(ys.length - 1, i + 2)];
    const t = 0.18;
    const c1x = x1 + (x2 - x0) * t;
    const c1y = y1 + (y2 - y0) * t;
    const c2x = x2 - (x3 - x1) * t;
    const c2y = y2 - (y3 - y1) * t;
    linePath += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}`;
  }

  // closed area path
  const areaPath = `${linePath} L ${xs[xs.length - 1]} ${height - padBottom} L ${xs[0]} ${height - padBottom} Z`;

  // x-axis label positions: first, ~1/3, ~2/3, last
  const labelIndices = [
    0,
    Math.floor(data.length / 3),
    Math.floor((data.length * 2) / 3),
    data.length - 1,
  ];

  // Tooltip dimensions
  const tipW = 130;
  const tipH = 64;
  const hx = xs[highlightIndex];
  const hy = ys[highlightIndex];
  const tipX = Math.min(width - tipW - 4, Math.max(4, hx - tipW / 2));
  const tipY = Math.max(4, hy - tipH - 16);

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-hidden
    >
      <defs>
        <filter
          id={filterId}
          x="-10%"
          y="-50%"
          width="120%"
          height="200%"
          filterUnits="userSpaceOnUse"
        >
          <feGaussianBlur stdDeviation="4" result="b1" />
          <feGaussianBlur stdDeviation="10" result="b2" />
          <feMerge>
            <feMergeNode in="b2" />
            <feMergeNode in="b1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={cloudId} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="rgb(232 80 80)" stopOpacity="0.30" />
          <stop offset="0.5" stopColor="rgb(232 80 80)" stopOpacity="0.10" />
          <stop offset="1" stopColor="rgb(232 80 80)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgb(232 80 80)" stopOpacity="0.18" />
          <stop offset="1" stopColor="rgb(232 80 80)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Subtle horizontal gridlines */}
      {[0.25, 0.5, 0.75].map((p) => (
        <line
          key={p}
          x1={padX}
          x2={width - padX}
          y1={padTop + innerH * p}
          y2={padTop + innerH * p}
          stroke="rgb(255 255 255)"
          strokeOpacity="0.04"
          strokeDasharray="2 4"
        />
      ))}

      {/* Soft cloud glow under highlighted region */}
      <ellipse
        cx={hx}
        cy={hy + 30}
        rx={innerW * 0.28}
        ry={innerH * 0.55}
        fill={`url(#${cloudId})`}
      />

      {/* Area fill */}
      <path d={areaPath} fill={`url(#${areaId})`} />

      {/* Wide blurred glow */}
      <path
        d={linePath}
        fill="none"
        stroke="rgb(232 80 80)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
        filter={`url(#${filterId})`}
      />

      {/* Crisp main line */}
      <path
        d={linePath}
        fill="none"
        stroke="rgb(255 200 200)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* X-axis labels */}
      {labelIndices.map((i) => (
        <text
          key={i}
          x={xs[i]}
          y={height - padBottom + 22}
          fontSize="11"
          fill="rgb(110 115 128)"
          textAnchor="middle"
        >
          {data[i].label}
        </text>
      ))}

      {/* Vertical guideline at the highlighted point */}
      <line
        x1={hx}
        x2={hx}
        y1={padTop}
        y2={height - padBottom}
        stroke="rgb(232 80 80)"
        strokeOpacity="0.15"
        strokeDasharray="2 4"
      />

      {/* Highlight dot */}
      <g>
        <circle cx={hx} cy={hy} r="8" fill="rgb(232 80 80)" opacity="0.25" />
        <circle cx={hx} cy={hy} r="4" fill="rgb(232 80 80)" />
        <circle cx={hx} cy={hy} r="2" fill="white" />
      </g>

      {/* Tooltip pin */}
      <g>
        <rect
          x={tipX}
          y={tipY}
          width={tipW}
          height={tipH}
          rx="10"
          fill="rgb(22 26 36)"
          stroke="rgb(255 255 255)"
          strokeOpacity="0.08"
        />
        <text
          x={tipX + 12}
          y={tipY + 18}
          fontSize="10"
          fill="rgb(158 162 175)"
        >
          {data[highlightIndex].label}
        </text>
        <text
          x={tipX + 12}
          y={tipY + 36}
          fontSize="13"
          fontWeight="500"
          fill="rgb(245 245 247)"
        >
          $ {data[highlightIndex].value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </text>
        <text
          x={tipX + 12}
          y={tipY + 54}
          fontSize="11"
          fill="rgb(232 80 80)"
        >
          - 9.10 %
        </text>
      </g>
    </svg>
  );
}
