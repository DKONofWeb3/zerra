import { useState } from "react";
import { cn } from "@/lib/cn";
import { usePageTitle } from "@/hooks/usePageTitle";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { ExploreCampaigns } from "@/components/campaigns/ExploreCampaigns";
import { GlobalLeaderboard } from "@/components/campaigns/GlobalLeaderboard";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, Check } from "lucide-react";

type CampaignsView = "active" | "past";
type LeaderboardView = "all-time" | "this-month" | "this-week";

const CAMPAIGNS_VIEW_OPTIONS: { value: CampaignsView; label: string }[] = [
  { value: "active", label: "Active Campaigns" },
  { value: "past",   label: "Past Campaigns" },
];

// Placeholder set — swap these once we know what GlobalLeaderboard actually
// supports filtering by (or drop this dropdown entirely if it doesn't apply).
const LEADERBOARD_VIEW_OPTIONS: { value: LeaderboardView; label: string }[] = [
  { value: "all-time",   label: "All-Time" },
  { value: "this-month", label: "This Month" },
  { value: "this-week",  label: "This Week" },
];

/**
 * EyebrowDropdown
 * -------------------------------------------------
 * The small diamond-icon label above the page title becomes a real
 * dropdown "toggle" — its options change depending on which main tab
 * (Active Campaigns / Leaderboard) is currently selected.
 */
function EyebrowDropdown<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 text-fg-tertiary hover:text-fg-secondary transition-colors"
      >
        <DiamondIcon size={14} />
        <span className="text-[12.5px]">{current?.label}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 z-20 w-44 rounded-xl border border-white/[0.08] overflow-hidden"
            style={{ background: "rgb(10 12 20)" }}>
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left text-[12.5px] text-fg-secondary hover:bg-white/[0.04] hover:text-fg-primary transition-colors"
              >
                {opt.label}
                {opt.value === value && <Check className="w-3.5 h-3.5 text-brand" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ExplorePage() {
  usePageTitle("Zerra · Explore");
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "leaderboard" ? "leaderboard" : "active";

  const [campaignsView, setCampaignsView] = useState<CampaignsView>("active");
  const [leaderboardView, setLeaderboardView] = useState<LeaderboardView>("all-time");

  return (
    <div className="pb-12 space-y-6">
      <div className="pt-2">
        {tab === "active" ? (
          <EyebrowDropdown
            options={CAMPAIGNS_VIEW_OPTIONS}
            value={campaignsView}
            onChange={setCampaignsView}
          />
        ) : (
          <EyebrowDropdown
            options={LEADERBOARD_VIEW_OPTIONS}
            value={leaderboardView}
            onChange={setLeaderboardView}
          />
        )}
        <h2 className={cn(
          "mt-4 font-display font-medium tracking-[-0.03em]",
          "text-[36px] md:text-[64px] leading-[0.95]",
          "bg-clip-text text-transparent",
          "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
        )}>
          Explore
        </h2>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 border-b border-white/[0.06]">
        {([
          { key: "active",      label: "Active Campaigns" },
          { key: "leaderboard", label: "Leaderboard" },
        ] as const).map(({ key, label }) => (
          <button key={key} onClick={() => setSearchParams(key === "active" ? {} : { tab: key })}
            className={cn(
              "px-4 py-2.5 text-[13.5px] font-medium transition-colors border-b-2 -mb-px",
              tab === key
                ? "border-brand text-fg-primary"
                : "border-transparent text-fg-tertiary hover:text-fg-secondary"
            )}>
            {label}
          </button>
        ))}
      </div>

      {tab === "active" ? (
        <ExploreCampaigns tab={campaignsView} />
      ) : (
        // TODO: wire `leaderboardView` into GlobalLeaderboard once it accepts
        // a time-range filter — leaving it selected-but-unused for now.
        <GlobalLeaderboard />
      )}
    </div>
  );
}