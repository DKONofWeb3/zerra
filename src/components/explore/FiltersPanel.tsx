import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { RangeSlider } from "./RangeSlider";
import type { OpportunityType } from "@/lib/types";

const OPPORTUNITY_OPTIONS: { id: OpportunityType; label: string }[] = [
  { id: "campaigns",  label: "Campaigns" },
  { id: "branddeals", label: "Brand Deals" },
  { id: "projects",   label: "Projects" },
];

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group py-1">
      <span
        className={cn(
          "shrink-0 w-4 h-4 rounded grid place-items-center border transition-all",
          checked
            ? "bg-brand border-brand"
            : "bg-bg-base/50 border-white/[0.12] group-hover:border-white/[0.25]"
        )}
        onClick={() => onChange(!checked)}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </span>
      <span className="text-[13px] text-fg-secondary group-hover:text-fg-primary transition-colors">
        {label}
      </span>
    </label>
  );
}

function Select({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div>
      <div className="text-[12px] text-fg-tertiary mb-2">{label}</div>
      <button
        className={cn(
          "w-full h-11 px-4 rounded-xl flex items-center justify-between gap-2",
          "border border-white/[0.06] bg-bg-base/40",
          "text-[13px] text-fg-tertiary hover:text-fg-primary hover:border-white/[0.12] transition-colors"
        )}
      >
        <span>{placeholder}</span>
        <ChevronDown className="w-4 h-4 text-fg-tertiary" />
      </button>
    </div>
  );
}

export function FiltersPanel() {
  const [opportunities, setOpportunities] = useState<Record<OpportunityType, boolean>>({
    campaigns: false,
    branddeals: false,
    projects: false,
  });
  const [audience, setAudience] = useState<[number, number]>([10, 90]);

  const reset = () => {
    setOpportunities({ campaigns: false, branddeals: false, projects: false });
    setAudience([0, 100]);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card",
        "border border-white/[0.05]",
        "shadow-card"
      )}
      style={{ background: "rgb(var(--bg-card))" }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1/4 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgb(255 255 255 / 0.02) 0%, transparent 100%)",
        }}
      />

      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-medium text-fg-primary">Filters</h3>
          <button
            onClick={reset}
            className="text-[12.5px] text-fg-tertiary hover:text-fg-primary transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Opportunity Type — note design typo "Oppurtunity" */}
        <div>
          <div className="text-[12px] text-fg-tertiary mb-2">
            Oppurtunity Type
          </div>
          <div className="space-y-1">
            {OPPORTUNITY_OPTIONS.map((opt) => (
              <Checkbox
                key={opt.id}
                checked={opportunities[opt.id]}
                onChange={(v) =>
                  setOpportunities({ ...opportunities, [opt.id]: v })
                }
                label={opt.label}
              />
            ))}
          </div>
        </div>

        {/* Categories */}
        <Select label="Categories" placeholder="All Categories" />

        {/* Rewards + Platform side by side */}
        <div className="grid grid-cols-2 gap-3">
          <Select label="Rewards" placeholder="All Rewards" />
          <Select label="Platform" placeholder="All Platform" />
        </div>

        {/* Audience Size */}
        <div>
          <div className="text-[12px] text-fg-tertiary mb-3">Audience Size</div>
          <RangeSlider
            min={0}
            max={100}
            value={audience}
            onChange={setAudience}
            minLabel="1k"
            maxLabel="10M+"
          />
        </div>

        {/* Apply Filter */}
        <div className="flex justify-end pt-1">
          <button
            className={cn(
              "h-10 px-5 rounded-full text-[13px] font-medium",
              "bg-white text-black hover:bg-white/90 transition-colors"
            )}
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}
