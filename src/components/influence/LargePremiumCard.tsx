import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Large promotional card with a rotated 40% gradient badge and a
 * "Get Premium" CTA. Used in the Top Performing featured row.
 *
 * The card itself is BLACK — the orange comes entirely from the chip.
 * The chip has stacked layered duplicates fanned out behind it for
 * depth, and a subtle orange glow leaks just around the chip itself.
 */
export function LargePremiumCard() {
  return (
    <button
      className={cn(
        "relative overflow-hidden rounded-card group",
        "border border-white/[0.06] h-[230px] w-full",
        "transition-all hover:border-white/[0.12]"
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

      {/* Tight orange glow contained around the chip area */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          left: "0%",
          top: "10%",
          width: "55%",
          height: "80%",
          background:
            "radial-gradient(ellipse at 35% 50%, rgb(255 160 60 / 0.25), transparent 55%)",
          filter: "blur(12px)",
        }}
      />

      <div className="relative h-full flex items-center gap-5 px-6">
        {/* Stacked rotated chip */}
        <div className="relative w-[150px] h-[110px] shrink-0">
          {/* Layer 3 (back, faded) */}
          <div
            aria-hidden
            className="absolute rounded-2xl"
            style={{
              left: 18, top: 22, width: 132, height: 78,
              background:
                "linear-gradient(135deg, rgb(255 200 100 / 0.35), rgb(255 140 60 / 0.30))",
              transform: "rotate(-14deg)",
              filter: "blur(2px)",
            }}
          />
          {/* Layer 2 */}
          <div
            aria-hidden
            className="absolute rounded-2xl"
            style={{
              left: 10, top: 14, width: 138, height: 84,
              background:
                "linear-gradient(135deg, rgb(255 200 100 / 0.7), rgb(255 140 60 / 0.6))",
              transform: "rotate(-10deg)",
            }}
          />
          {/* Layer 1 (front) */}
          <div
            className="absolute grid place-items-center rounded-2xl"
            style={{
              left: 0, top: 6, width: 145, height: 90,
              background:
                "linear-gradient(135deg, rgb(255 210 110), rgb(255 145 60))",
              transform: "rotate(-7deg)",
              boxShadow:
                "0 18px 40px -8px rgb(255 140 60 / 0.5), inset 0 1px 0 0 rgb(255 255 255 / 0.45)",
            }}
          >
            <span className="text-[44px] font-bold text-black leading-none tracking-tight">
              40<span className="text-[28px]">%</span>
            </span>
          </div>
        </div>

        <div className="flex-1 leading-tight text-left">
          <div className="text-[13px] text-fg-tertiary">Experience</div>
          <div className="text-[26px] font-semibold text-fg-primary mt-1 tracking-tight">
            Get Premium
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-fg-secondary group-hover:text-fg-primary transition-colors shrink-0" />
      </div>
    </button>
  );
}
