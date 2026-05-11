import { useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/cn";
import { EarningsLineChart } from "./EarningsLineChart";
import { earningsChart, earningsHighlightIndex } from "@/lib/mock-data";
import type { EarningsTab } from "@/lib/types";

const TABS: { id: EarningsTab; label: string }[] = [
  { id: "total",     label: "Total Earning" },
  { id: "avg",       label: "Avg per campaign" },
  { id: "completed", label: "Completed" },
  { id: "pending",   label: "Pending" },
];

export function OverviewChart() {
  const [active, setActive] = useState<EarningsTab>("total");

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card",
        "border border-white/[0.05]"
      )}
      style={{ background: "rgb(var(--bg-card))" }}
    >
      {/* Grid pattern background — subtle blue grid behind everything */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgb(120 145 200 / 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgb(120 145 200 / 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Dark blue atmospheric gradient at the bottom */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgb(15 28 60 / 0.35) 50%, rgb(25 50 110 / 0.55) 100%)",
        }}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[16px] font-semibold text-gradient">Overview</h3>
          <button
            aria-label="Info"
            className={cn(
              "shrink-0 grid place-items-center w-8 h-8 rounded-lg",
              "border border-white/[0.07] bg-white/[0.015]",
              "text-fg-tertiary hover:text-fg-primary transition-colors"
            )}
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Big price */}
        <div className="mt-3 flex items-baseline gap-2">
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

        {/* Two-column meta */}
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <div className="text-[11.5px] text-fg-tertiary">Yearly avg:</div>
            <div className="mt-1 text-[14px] text-fg-secondary font-medium tabular-nums">
              Yearly avg: $ 34,502.58
            </div>
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

        {/* Segmented tabs */}
        <div
          className={cn(
            "mt-5 p-1 rounded-2xl border border-white/[0.05] bg-bg-base/50",
            "flex items-center gap-1"
          )}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                "flex-1 h-9 rounded-xl text-[12.5px] font-medium transition-all",
                active === tab.id
                  ? "glass-strong text-fg-primary"
                  : "text-fg-tertiary hover:text-fg-secondary"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="mt-4">
          <EarningsLineChart
            data={earningsChart}
            highlightIndex={earningsHighlightIndex}
            width={720}
            height={280}
          />
        </div>

        {/* Bottom callout */}
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1 leading-none">
              <span className="text-[34px] font-medium text-success">+</span>
              <span
                className={cn(
                  "font-display font-medium num-tabular text-[34px] tracking-[-0.02em]",
                  "bg-clip-text text-transparent",
                  "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
                )}
              >
                19.23
              </span>
              <span className="text-[18px] font-medium text-fg-tertiary">%</span>
            </div>
          </div>
          <div className="text-right leading-tight">
            <div className="text-[11.5px] text-fg-tertiary">
              Compared to last month
            </div>
            <div className="text-[12px] text-fg-secondary tabular-nums">
              Compared to last month 37.16
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
