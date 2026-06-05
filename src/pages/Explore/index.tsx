import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { CampaignCard } from "@/components/influence/CampaignCard";
import { ProjectsTalkAboutTable } from "@/components/explore/ProjectsTalkAboutTable";
import { FiltersPanel } from "@/components/explore/FiltersPanel";
import { campaigns, talkProjects } from "@/lib/mock-data";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function ExplorePage() {
  usePageTitle("Zerra · Explore");

  const featured = campaigns.slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">Last Update</span>
          <span className="text-[12.5px] text-fg-secondary ml-2 tabular-nums">
            10:00am 1st Jan 2026
          </span>
        </div>
        <h2
          className={cn(
            "mt-4 font-display font-medium tracking-[-0.03em]",
            "text-[64px] leading-[0.95]",
            "bg-clip-text text-transparent",
            "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
          )}
        >
          Explore
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {featured.map((c) => (
          <CampaignCard key={c.id} campaign={c} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
        <ProjectsTalkAboutTable rows={talkProjects} />
        <FiltersPanel />
      </div>
    </div>
  );
}