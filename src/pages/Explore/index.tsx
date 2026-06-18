import { cn } from "@/lib/cn";
import { usePageTitle } from "@/hooks/usePageTitle";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { ExploreCampaigns } from "@/components/campaigns/ExploreCampaigns";

export default function ExplorePage() {
  usePageTitle("Zerra · Explore");

  return (
    <div className="pb-12 space-y-8">
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

      <div>
        <p className="text-[13px] font-semibold text-fg-primary mb-4">Active Campaigns</p>
        <ExploreCampaigns />
      </div>
    </div>
  );
}