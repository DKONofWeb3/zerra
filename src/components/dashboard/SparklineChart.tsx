import { useId } from "react";

interface SparklinePoint {
  x: number;
  y: number;
  label?: string;
  /** Force a dot at this point even without a label (used for the neighbor of the labeled point). */
  dot?: boolean;
}

interface SparklineChartProps {
  data: SparklinePoint[];
  trend: "up" | "down" | "flat";
  width?: number;
  height?: number;
  className?: string;
  /** Index of the point next to the labeled one that should also get a dot. */
  neighborDotIndex?: number;
}

/**
 * Hand-rolled sparkline matching the Figma:
 *   - White crisp line with strong COLORED glow (violet for up, red for down)
 *   - Cloud-like soft area glow underneath the curve
 *   - Only the labeled point + one designated neighbor get visible dots
 *   - Floating "+0.5%" callout sits next to the labeled peak
 */
export function SparklineChart({
  data,
  trend,
  width = 600,
  height = 280,
  className,
  neighborDotIndex,
}: SparklineChartProps) {
  const id = useId().replace(/:/g, "");
  const filterId = `glow-${id}`;
  const cloudId = `cloud-${id}`;

  const padX = 12;
  const padTop = 30;
  const padBottom = 28;

  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;

  const xs = data.map((_, i) => (i / (data.length - 1)) * innerW + padX);
  const ys = data.map((d) => padTop + (1 - d.y) * innerH);

  // Smooth path with catmull-rom-style cubic bezier
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

  const isUp = trend === "up";
  // White line, COLORED glow
  const lineColor = "rgb(245 245 250)";
  // Violet/purple for up (matches the design), red for down
  const glowColor = isUp ? "rgb(150 130 230)" : "rgb(232 80 80)";
  const cloudColor = isUp ? "rgb(150 130 230)" : "rgb(232 80 80)";

  // Determine which points get dots: the labeled point + (optional) a neighbor
  const labeledIndex = data.findIndex((d) => d.label !== undefined);
  const dotIndices = new Set<number>();
  if (labeledIndex >= 0) dotIndices.add(labeledIndex);
  if (neighborDotIndex !== undefined) dotIndices.add(neighborDotIndex);
  data.forEach((d, i) => {
    if (d.dot) dotIndices.add(i);
  });

  // Find the labeled peak's surrounding region for the cloud glow placement
  const cloudCx = labeledIndex >= 0 ? xs[labeledIndex] : width / 2;
  const cloudCy = labeledIndex >= 0 ? ys[labeledIndex] + 30 : height / 2;

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
        {/* Heavy two-stage glow under the line */}
        <filter
          id={filterId}
          x="-10%"
          y="-50%"
          width="120%"
          height="200%"
          filterUnits="userSpaceOnUse"
        >
          <feGaussianBlur stdDeviation="6" result="b1" />
          <feGaussianBlur stdDeviation="14" result="b2" />
          <feMerge>
            <feMergeNode in="b2" />
            <feMergeNode in="b1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Cloud-like radial glow that sits beneath the highlighted area */}
        <radialGradient id={cloudId} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={cloudColor} stopOpacity="0.32" />
          <stop offset="0.5" stopColor={cloudColor} stopOpacity="0.10" />
          <stop offset="1" stopColor={cloudColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft cloud glow positioned beneath the labeled peak */}
      <ellipse
        cx={cloudCx}
        cy={cloudCy}
        rx={innerW * 0.35}
        ry={innerH * 0.55}
        fill={`url(#${cloudId})`}
      />

      {/* Wide blurred copy of the line — the COLORED glow */}
      <path
        d={linePath}
        fill="none"
        stroke={glowColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
        filter={`url(#${filterId})`}
      />

      {/* Crisp white main line */}
      <path
        d={linePath}
        fill="none"
        stroke={lineColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Only the labeled point + designated neighbor get dots */}
      {Array.from(dotIndices).map((i) => (
        <g key={i}>
          <circle
            cx={xs[i]}
            cy={ys[i]}
            r="4.5"
            fill={glowColor}
            opacity="0.45"
          />
          <circle cx={xs[i]} cy={ys[i]} r="2.5" fill="white" />
        </g>
      ))}

      {/* Floating callout label */}
      {data.map((d, i) =>
        d.label ? (
          <text
            key={`lbl-${i}`}
            x={xs[i] + 14}
            y={ys[i] - 16}
            fontSize="13"
            fontWeight="500"
            fill="rgb(245 245 247)"
            opacity="0.95"
          >
            {d.label}
          </text>
        ) : null
      )}
    </svg>
  );
}
