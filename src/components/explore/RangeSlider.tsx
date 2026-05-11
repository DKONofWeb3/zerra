import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface RangeSliderProps {
  min: number;
  max: number;
  /** Current values [low, high] */
  value: [number, number];
  onChange: (value: [number, number]) => void;
  /** Min/max labels shown beneath the track. */
  minLabel?: string;
  maxLabel?: string;
  className?: string;
}

/**
 * Two-handle range slider.
 *
 * Pure pointer-event implementation — no third-party deps. Both handles
 * can be dragged independently; the active fill between them shows the
 * selected range.
 */
export function RangeSlider({
  min,
  max,
  value,
  onChange,
  minLabel,
  maxLabel,
  className,
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"low" | "high" | null>(null);

  const range = max - min;
  const lowPct = ((value[0] - min) / range) * 100;
  const highPct = ((value[1] - min) / range) * 100;

  const positionToValue = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track) return min;
      const rect = track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(min + pct * range);
    },
    [min, range]
  );

  const onPointerDown = useCallback(
    (handle: "low" | "high") => (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(handle);
    },
    []
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const next = positionToValue(e.clientX);
      if (dragging === "low") {
        onChange([Math.min(next, value[1] - 1), value[1]]);
      } else {
        onChange([value[0], Math.max(next, value[0] + 1)]);
      }
    },
    [dragging, positionToValue, onChange, value]
  );

  const onPointerUp = useCallback(() => setDragging(null), []);

  return (
    <div className={cn("select-none", className)}>
      <div
        ref={trackRef}
        className="relative h-7 flex items-center"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Track */}
        <div className="absolute inset-x-0 h-1 rounded-full bg-white/[0.08]" />

        {/* Active range */}
        <div
          className="absolute h-1 rounded-full"
          style={{
            left: `${lowPct}%`,
            right: `${100 - highPct}%`,
            background: "rgb(var(--brand))",
            boxShadow: "0 0 8px rgb(var(--brand-glow) / 0.5)",
          }}
        />

        {/* Low handle */}
        <button
          type="button"
          onPointerDown={onPointerDown("low")}
          className={cn(
            "absolute w-4 h-4 rounded-full -translate-x-1/2 cursor-grab active:cursor-grabbing",
            "bg-white border-2 border-brand",
            "shadow-[0_0_12px_rgb(var(--brand-glow)/0.6)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          )}
          style={{ left: `${lowPct}%` }}
          aria-label={`Minimum: ${value[0]}`}
        />

        {/* High handle */}
        <button
          type="button"
          onPointerDown={onPointerDown("high")}
          className={cn(
            "absolute w-4 h-4 rounded-full -translate-x-1/2 cursor-grab active:cursor-grabbing",
            "bg-white border-2 border-brand",
            "shadow-[0_0_12px_rgb(var(--brand-glow)/0.6)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          )}
          style={{ left: `${highPct}%` }}
          aria-label={`Maximum: ${value[1]}`}
        />
      </div>

      {(minLabel || maxLabel) && (
        <div className="mt-2 flex justify-between text-[11.5px] text-fg-tertiary tabular-nums">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}
