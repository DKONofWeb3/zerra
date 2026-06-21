interface DonutChartProps {
  segments: { value: number; color: string }[];
  centerLabel: string;
  centerSubLabel: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * Plain SVG donut — used for "Audience Demographics" (gender) and
 * "Traffic Sources" in the analytics view. Reference: ana.jpg.
 */
export function DonutChart({ segments, centerLabel, centerSubLabel, size = 144, strokeWidth = 16 }: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  let offsetAcc = 0;
  const arcs = segments.map((seg) => {
    const fraction = seg.value / total;
    const dash = fraction * circumference;
    const arc = { ...seg, dash, gap: circumference - dash, offset: -offsetAcc };
    offsetAcc += dash;
    return arc;
  });

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arc.dash} ${arc.gap}`}
              strokeDashoffset={arc.offset}
              strokeLinecap="butt"
            />
          ))}
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[20px] font-display font-medium text-fg-primary leading-none">{centerLabel}</span>
        <span className="text-[10.5px] text-fg-tertiary mt-1 text-center px-2 leading-tight">{centerSubLabel}</span>
      </div>
    </div>
  );
}
