import { useState } from "react";
import { TrendingDown } from "lucide-react";
import { cn } from "@/lib/cn";

const EXTENSIONS = ["png", "jpg", "webp"] as const;

export function PaypalHeroCard() {
  const [extIndex, setExtIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card",
        "border border-white/[0.05]"
      )}
      style={{ background: "rgb(var(--bg-card))" }}
    >
      <div className="relative p-6">
        {/* Top row: big price | compared to last month */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[34px] font-medium text-brand leading-none">$</span>
            <span
              className={cn(
                "font-display font-medium num-tabular leading-none text-[40px] tracking-[-0.02em]",
                "bg-clip-text text-transparent",
                "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
              )}
            >
              200,68.96
            </span>
          </div>
          <div className="text-right">
            <div className="text-[11.5px] text-fg-tertiary">
              Compared to last month
            </div>
            <div className="mt-1 text-[14px] text-danger font-medium tabular-nums">
              - 37.16 %
            </div>
          </div>
        </div>

        {/* Yearly avg + How it works */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-[13px] text-fg-secondary tabular-nums">
              Yearly avg:{" "}
              <span className="text-fg-primary font-medium">$ 34,502.58</span>
            </div>
            <span
              className="grid place-items-center w-6 h-6 rounded-full"
              style={{ backgroundColor: "rgb(var(--danger) / 0.15)" }}
            >
              <TrendingDown
                className="w-3 h-3 text-danger"
                strokeWidth={2.5}
              />
            </span>
          </div>
          <button className="text-[13px] text-fg-secondary hover:text-fg-primary transition-colors">
            How it works?
          </button>
        </div>

        {/* Hero image */}
        <div className="mt-5 aspect-[16/11] w-full relative overflow-hidden rounded-2xl border border-white/[0.05] bg-bg-base">
          {failed ? (
            <div className="absolute inset-0 grid place-items-center p-8 text-center">
              <div>
                <div className="text-fg-muted text-[11px] uppercase tracking-wider mb-2">
                  Hero asset
                </div>
                <div className="text-fg-tertiary text-sm">
                  Drop{" "}
                  <code className="text-fg-secondary text-xs">
                    public/portfolio/paypal-hero.png
                  </code>
                </div>
              </div>
            </div>
          ) : (
            <img
              src={`/portfolio/paypal-hero.${EXTENSIONS[extIndex]}`}
              alt="PayPal earnings"
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => {
                if (extIndex < EXTENSIONS.length - 1) {
                  setExtIndex(extIndex + 1);
                } else {
                  setFailed(true);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
