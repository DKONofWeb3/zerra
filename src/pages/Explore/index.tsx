import { cn } from "@/lib/cn";
import { usePageTitle } from "@/hooks/usePageTitle";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { ExploreCampaigns } from "@/components/campaigns/ExploreCampaigns";
import { useSearchParams } from "react-router-dom";

export default function ExplorePage() {
  usePageTitle("Zerra · Explore");
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "past" ? "past" : "active";

  return (
    <div className="pb-12 space-y-6">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">Live opportunities</span>
        </div>
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
        {(["active", "past"] as const).map((t) => (
          <button key={t} onClick={() => setSearchParams(t === "active" ? {} : { tab: t })}
            className={cn(
              "px-4 py-2.5 text-[13.5px] font-medium capitalize transition-colors border-b-2 -mb-px",
              tab === t
                ? "border-brand text-fg-primary"
                : "border-transparent text-fg-tertiary hover:text-fg-secondary"
            )}>
            {t === "active" ? "Active Campaigns" : "Past Campaigns"}
          </button>
        ))}
      </div>

      <ExploreCampaigns tab={tab} />
    </div>
  );
}