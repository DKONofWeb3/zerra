import {
  Users,
  Clock,
  Presentation,
  BadgeCheck,
  Hash,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { earningsBreakdown } from "@/lib/mock-data";
import type { EarningsBreakdownItem } from "@/lib/types";

const ICON_MAP = {
  users: Users,
  clock: Clock,
  presentation: Presentation,
  "badge-check": BadgeCheck,
  hash: Hash,
} as const;

function BreakdownRow({ item }: { item: EarningsBreakdownItem }) {
  const Icon = ICON_MAP[item.iconName];
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-fg-tertiary" strokeWidth={1.75} />
        <span className="text-[14px] text-fg-primary">{item.label}</span>
      </div>
      <span className="text-[14px] text-fg-secondary tabular-nums">
        ${item.amount.toLocaleString("en-US", {
          minimumFractionDigits: item.amount % 1 === 0 ? 0 : 2,
          maximumFractionDigits: 2,
        })}
      </span>
    </div>
  );
}

export function ThisMonthCard() {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card",
        "border border-white/[0.05]"
      )}
      style={{ background: "rgb(var(--bg-card))" }}
    >
      {/* Top inner highlight */}
      <div
        className="absolute inset-x-0 top-0 h-1/5 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgb(255 255 255 / 0.025) 0%, transparent 100%)",
        }}
      />

      {/* Red glow tint spreading from bottom-right (the maroon atmosphere) */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          right: "-10%",
          bottom: "-10%",
          width: "85%",
          height: "65%",
          background:
            "radial-gradient(ellipse at 100% 100%, rgb(232 80 80 / 0.25), transparent 65%)",
          filter: "blur(20px)",
        }}
      />

      <div className="relative p-7">
        {/* This Month section */}
        <div>
          <div className="text-[13px] text-fg-tertiary">This Month</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[28px] font-medium text-brand leading-none">
              $
            </span>
            <span
              className={cn(
                "font-display font-medium num-tabular leading-none text-[34px] tracking-[-0.02em]",
                "bg-clip-text text-transparent",
                "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
              )}
            >
              200,68.96
            </span>
          </div>
          <div className="mt-2 text-[13px] text-fg-tertiary">Total Earnings</div>
        </div>

        {/* Breakdown list */}
        <div className="mt-6 divide-y divide-white/[0.04]">
          {earningsBreakdown.map((item) => (
            <BreakdownRow key={item.id} item={item} />
          ))}
        </div>

        {/* Let's Go Premium */}
        <div className="mt-8">
          <div className="flex items-center gap-3 flex-wrap">
            <h4
              className={cn(
                "font-display font-semibold text-[22px] tracking-[-0.015em] leading-tight",
                "text-gradient"
              )}
            >
              Let&apos;s Go Premium with
            </h4>
            <span
              className={cn(
                "inline-flex items-center justify-center px-3 py-1 rounded-md",
                "text-[14px] font-bold text-black",
                "shadow-[0_4px_14px_rgb(255_140_60_/_0.4)]"
              )}
              style={{
                background:
                  "linear-gradient(135deg, rgb(255 200 100), rgb(255 140 60))",
              }}
            >
              40%
            </span>
          </div>
          <p className="mt-2 text-[13px] text-fg-tertiary">
            This is your amazing chance!
          </p>

          <p className="mt-5 text-[12.5px] leading-[1.55] text-fg-tertiary">
            Our premium subscription elevates your experience and unlock a rankge
            of benefits tailored to your preferences
          </p>

          <button className="mt-3 flex items-center gap-1.5 text-[13px] text-fg-primary hover:text-brand transition-colors">
            <span>Learn more</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom row */}
        <div className="mt-7 pt-5 border-t border-white/[0.05] flex items-center justify-between gap-3">
          <button className="text-[13px] text-fg-tertiary hover:text-fg-secondary transition-colors">
            Don&apos;t Show again
          </button>
          <button
            className={cn(
              "h-10 px-5 rounded-full text-[13px] font-medium",
              "bg-white text-black hover:bg-white/90 transition-colors"
            )}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
