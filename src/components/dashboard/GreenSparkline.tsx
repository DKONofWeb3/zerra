interface GreenSparklineProps {
  points: { x: number; y: number }[]; // y expected 0–1
  width?: number;
  height?: number;
}

/**
 * Always-green sparkline for the "Verified Engagements" / "Profile
 * View" sub-cards. SparklineChart (used by PriceCard) colors its line
 * blue/red based on an "up"/"down" trend — that's the wrong semantic
 * here; the reference always shows pure green regardless of
 * direction, so this is a separate, simpler component rather than
 * repurposing SparklineChart's trend coloring.
 */
export function GreenSparkline({ points, width = 240, height = 56 }: GreenSparklineProps) {
  if (points.length < 2) return null;

  const padX = 2;
  const padY = 6;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const xs = points.map((_, i) => (i / (points.length - 1)) * innerW + padX);
  const ys = points.map((p) => padY + (1 - p.y) * innerH);

  let line = `M ${xs[0]} ${ys[0]}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const x0 = xs[Math.max(0, i - 1)], y0 = ys[Math.max(0, i - 1)];
    const x1 = xs[i], y1 = ys[i];
    const x2 = xs[i + 1], y2 = ys[i + 1];
    const x3 = xs[Math.min(xs.length - 1, i + 2)], y3 = ys[Math.min(ys.length - 1, i + 2)];
    const t = 0.18;
    line += ` C ${x1 + (x2 - x0) * t} ${y1 + (y2 - y0) * t} ${x2 - (x3 - x1) * t} ${y2 - (y3 - y1) * t} ${x2} ${y2}`;
  }
  const area = `${line} L ${xs[xs.length - 1]} ${height} L ${xs[0]} ${height} Z`;
  const green = "rgb(61 214 140)";

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="green-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={green} stopOpacity="0.25" />
          <stop offset="100%" stopColor={green} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#green-spark-fill)" />
      <path d={line} fill="none" stroke={green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}