import { useState } from "react";
import { cn } from "@/lib/cn";

const PAYPAL_LOGO_EXTENSIONS = ["png", "jpg", "webp"] as const;

function PaypalLogo() {
  const [extIndex, setExtIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  if (failed) {
    // Fallback CSS rendering
    return (
      <div
        className="grid place-items-center w-11 h-11 rounded-xl border border-white/10 shrink-0 overflow-hidden"
        style={{ background: "rgb(0 60 130)" }}
      >
        <span className="font-bold text-white text-[16px] italic">
          <span style={{ color: "rgb(50 165 220)" }}>P</span>
          <span style={{ color: "rgb(120 200 255)" }}>P</span>
        </span>
      </div>
    );
  }

  return (
    <div className="w-11 h-11 rounded-xl border border-white/10 shrink-0 overflow-hidden">
      <img
        src={`/portfolio/paypal-logo.${PAYPAL_LOGO_EXTENSIONS[extIndex]}`}
        alt="PayPal"
        className="w-full h-full object-cover"
        onError={() => {
          if (extIndex < PAYPAL_LOGO_EXTENSIONS.length - 1) {
            setExtIndex(extIndex + 1);
          } else {
            setFailed(true);
          }
        }}
      />
    </div>
  );
}

export function PaymentAccountCard() {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card",
        "border border-white/[0.05]"
      )}
      style={{ background: "rgb(var(--bg-card))" }}
    >
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-[15px] font-semibold text-gradient">
            Payment account
          </div>
          <button
            className={cn(
              "h-9 px-4 rounded-full text-[12.5px]",
              "border border-white/[0.07] bg-white/[0.015] text-fg-secondary",
              "hover:text-fg-primary hover:border-white/[0.15] transition-colors"
            )}
          >
            Manage
          </button>
        </div>

        {/* Account row */}
        <div className="mt-5 flex items-center gap-3">
          <PaypalLogo />
          <div className="flex-1 min-w-0 leading-tight">
            <div className="text-[15px] font-semibold text-gradient">
              Paypal
            </div>
            <div className="text-[12.5px] text-fg-tertiary truncate">
              abc@creatorfi.com
            </div>
          </div>
          <span
            className={cn(
              "px-3 py-1 rounded-full text-[11.5px] font-medium",
              "border"
            )}
            style={{
              backgroundColor: "rgb(var(--success) / 0.15)",
              borderColor: "rgb(var(--success) / 0.25)",
              color: "rgb(var(--success))",
            }}
          >
            Linked
          </span>
        </div>

        {/* Bottom totals */}
        <div className="mt-7 grid grid-cols-2 gap-4">
          <div>
            <div className="text-[12px] text-fg-tertiary">Total Earning</div>
            <div
              className={cn(
                "mt-1 font-display font-medium num-tabular text-[28px] tracking-[-0.02em] leading-none",
                "bg-clip-text text-transparent",
                "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
              )}
            >
              $2,685.9
            </div>
          </div>
          <div className="text-right">
            <div className="text-[12px] text-fg-tertiary">Next Payout</div>
            <div
              className={cn(
                "mt-1 font-display font-medium num-tabular text-[28px] tracking-[-0.02em] leading-none",
                "bg-clip-text text-transparent",
                "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
              )}
            >
              Mar 30,{" "}
              <span className="text-fg-tertiary">2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
