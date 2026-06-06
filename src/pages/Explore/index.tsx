import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { CampaignCard } from "@/components/influence/CampaignCard";
import { ProjectsTalkAboutTable } from "@/components/explore/ProjectsTalkAboutTable";
import { FiltersPanel } from "@/components/explore/FiltersPanel";
import { campaigns, talkProjects } from "@/lib/mock-data";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useSearchParams } from "react-router-dom";

const activeCampaigns = campaigns.slice(0, 4);
const pastCampaigns   = campaigns.slice(4);

export default function ExplorePage() {
  usePageTitle("Zerra · Explore");
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "past" ? "past" : "active";
  const displayed = tab === "active" ? activeCampaigns : pastCampaigns;

  return (
    <div className="space-y-8 pb-12">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">
            {tab === "active" ? "Live now" : "Ended campaigns"}
          </span>
        </div>
        <h2 className={cn(
          "mt-4 font-display font-medium tracking-[-0.03em]",
          "text-[64px] leading-[0.95]",
          "bg-clip-text text-transparent",
          "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
        )}>
          {tab === "active" ? "Active Campaigns" : "Past Campaigns"}
        </h2>
      </div>

      {displayed.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {displayed.map((c) => (
            <div key={c.id} className="relative">
              <CampaignCard campaign={c} />
              {tab === "past" && (
                <div className="absolute inset-0 rounded-card bg-black/40 flex items-center justify-center pointer-events-none">
                  <span className="px-3 py-1.5 rounded-full text-[11px] font-semibold border border-white/[0.12] bg-bg-card/80 text-fg-tertiary uppercase tracking-wider">
                    Ended
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={cn(
          "relative overflow-hidden rounded-card border border-white/[0.06]",
          "min-h-[280px] flex flex-col items-center justify-center gap-4"
        )} style={{ background: "rgb(var(--bg-card))" }}>
          <div className="w-12 h-12 rounded-2xl border border-white/[0.06] bg-bg-elevated flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--fg-muted))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div className="text-center px-8">
            <p className="text-[15px] font-medium text-fg-primary mb-1">No past campaigns yet</p>
            <p className="text-[13px] text-fg-tertiary">Ended campaigns will appear here.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
        <ProjectsTalkAboutTable rows={talkProjects} />
        <FiltersPanel />
      </div>
    </div>
  );
}