import { Info } from "lucide-react";
import { cn } from "@/lib/cn";
import type { DonutSegment } from "@/lib/types";

interface DonutChartProps {
  title?: string;
  segments: DonutSegment[];
}

/**
 * Donut chart panel — title at top, ring on the left, legend on the right.
 * Used in the right column of the Top Performing page.
 */
export function DonutChart({ title = "Top Performing Content", segments }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = 50;
  const stroke = 16;
  const C = 2 * Math.PI * radius;

  let cumulative = 0;
  const arcs = segments.map((s, i) => {
    const len = (s.value / total) * C;
    const off = -cumulative;
    cumulative += len;
    return { ...s, len, off, i };
  });

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card",
        "border border-white/[0.06] p-5"
      )}
      style={{ background: "rgb(var(--bg-card))" }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)",
        }}
      />

      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-[14px] font-semibold text-gradient">{title}</h3>
        <Info className="w-3.5 h-3.5 text-fg-tertiary" />
      </div>

      <div className="flex items-center gap-5">
        {/* Donut */}
        <svg width="140" height="140" viewBox="-70 -70 140 140" className="shrink-0">
          {/* Track */}
          <circle
            r={radius}
            fill="none"
            stroke="rgb(255 255 255 / 0.06)"
            strokeWidth={stroke}
          />
          {/* Segments */}
          {arcs.map((arc) => (
            <circle
              key={arc.i}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={stroke}
              strokeDasharray={`${arc.len} ${C}`}
              strokeDashoffset={arc.off}
              transform="rotate(-90)"
              style={{
                filter: `drop-shadow(0 0 6px ${arc.color})`,
              }}
            />
          ))}
        </svg>

        {/* Legend */}
        <div className="flex-1 space-y-2 min-w-0">
          {segments.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="shrink-0 grid place-items-center w-4 h-4 rounded"
                style={{ background: s.color }}
              />
              <span className="text-[12px] text-fg-secondary truncate">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
