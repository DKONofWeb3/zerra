interface MiniSparklineProps {
  data: number[];        // 0..1 normalized values
  color: string;         // line/glow color, e.g. "rgb(61 214 140)"
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Tiny background sparkline for the analytics stat cards (Total Views,
 * Engagement Rate, Clicks, Conversions) — reference: ana.jpg top row.
 * Deliberately simple: smoothed line + soft area fill, no animation.
 */
export function MiniSparkline({ data, color, width = 240, height = 64, className }: MiniSparklineProps) {
  if (data.length < 2) return null;

  const padX = 2;
  const innerW = width - padX * 2;
  const xs = data.map((_, i) => (i / (data.length - 1)) * innerW + padX);
  const ys = data.map((v) => height - 6 - v * (height - 14));

  let path = `M ${xs[0]} ${ys[0]}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const x0 = xs[Math.max(0, i - 1)], y0 = ys[Math.max(0, i - 1)];
    const x1 = xs[i], y1 = ys[i];
    const x2 = xs[i + 1], y2 = ys[i + 1];
    const x3 = xs[Math.min(xs.length - 1, i + 2)], y3 = ys[Math.min(ys.length - 1, i + 2)];
    const t = 0.2;
    path += ` C ${x1 + (x2 - x0) * t} ${y1 + (y2 - y0) * t} ${x2 - (x3 - x1) * t} ${y2 - (y3 - y1) * t} ${x2} ${y2}`;
  }
  const areaPath = `${path} L ${xs[xs.length - 1]} ${height} L ${xs[0]} ${height} Z`;

  const gradId = `mini-grad-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={className} aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    </svg>
  );
}
