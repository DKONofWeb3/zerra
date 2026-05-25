import { Info } from "lucide-react";
import { cn } from "@/lib/cn";

interface MyEarningsHeaderProps {
  title?: string;
  description?: string;
  ctaLabel?: string;
}

/**
 * The big "My Earnings" header above the Overview chart and PayPal cards.
 * Two of these sit side-by-side at the top of the Portfolio page.
 */
export function MyEarningsHeader({
  title = "My Earnings",
  description = "Track your earnings, payout and perfomance.",
  ctaLabel = "Learn more",
}: MyEarningsHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5">
      <div className="min-w-0 flex-1">
        <h2
          className={cn(
            "font-display font-medium text-[34px] leading-[1] tracking-[-0.02em] whitespace-nowrap",
            "bg-clip-text text-transparent",
            "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
          )}
        >
          {title}
        </h2>
        <p className="mt-2 text-[12.5px] text-fg-tertiary">{description}</p>
      </div>

      <button
        className={cn(
          "shrink-0 h-10 pl-4 pr-2.5 rounded-full flex items-center gap-2",
          "border border-white/[0.07] bg-white/[0.015]",
          "text-[12.5px] text-fg-secondary hover:text-fg-primary hover:border-white/[0.15] transition-colors"
        )}
      >
        <span>{ctaLabel}</span>
        <span
          className={cn(
            "grid place-items-center w-6 h-6 rounded-full",
            "bg-white/[0.04] border border-white/[0.05]"
          )}
        >
          <Info className="w-3 h-3 text-fg-tertiary" />
        </span>
      </button>
    </div>
  );
}
