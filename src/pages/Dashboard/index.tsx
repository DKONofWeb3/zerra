import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { UserActivityMarquee } from "@/components/dashboard/UserActivityMarquee";
import { PriceCard } from "@/components/dashboard/PriceCard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { InfluenceSection } from "@/components/dashboard/InfluenceSection";
import { useCryptoPrices } from "@/lib/useCryptoPrices";
import { useBounties } from "@/hooks/useBounties";
import type { CoinGeckoId } from "@/lib/crypto-api";
import type { InfluenceBountyItem, ActivityItem } from "@/lib/types";
import { priceCards } from "@/lib/mock-data";
import { usePageTitle } from "@/hooks/usePageTitle";

function EmptyBounties() {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card",
        "border border-white/[0.06] shadow-card min-h-[420px]",
        "flex flex-col items-center justify-center gap-4"
      )}
      style={{ background: "rgb(var(--bg-card))" }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)",
        }}
      />
      <div className="w-12 h-12 rounded-2xl border border-white/[0.06] bg-bg-elevated flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--fg-muted))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
      <div className="text-center px-8">
        <p className="text-[15px] font-medium text-fg-primary mb-1">No active bounties</p>
        <p className="text-[13px] text-fg-tertiary leading-relaxed">
          Influence bounties will appear here once campaigns go live.
        </p>
      </div>
      <div className="px-4 py-2 rounded-full border border-white/[0.06] bg-bg-elevated text-[12px] text-fg-tertiary">
        Coming soon
      </div>
    </div>
  );
}

function EmptyProjectOverview() {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card",
        "border border-white/[0.06] shadow-card min-h-[420px]",
        "flex flex-col items-center justify-center gap-4"
      )}
      style={{ background: "rgb(var(--bg-card))" }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)",
        }}
      />
      <div className="w-12 h-12 rounded-2xl border border-white/[0.06] bg-bg-elevated flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--fg-muted))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      </div>
      <div className="text-center px-8">
        <p className="text-[15px] font-medium text-fg-primary mb-1">No projects yet</p>
        <p className="text-[13px] text-fg-tertiary leading-relaxed">
          Projects you participate in will show up here.
        </p>
      </div>
      <div className="px-4 py-2 rounded-full border border-white/[0.06] bg-bg-elevated text-[12px] text-fg-tertiary">
        Coming soon
      </div>
    </div>
  );
}

function mapBounty(b: any): InfluenceBountyItem {
  return {
    id: b.id,
    projectName: b.project_name,
    tokenIconUrl: b.token_icon ?? "",
    bountyUsdc: Number(b.reward_usdc),
    description: b.description ?? "",
  };
}

export default function DashboardPage() {
  usePageTitle("Zerra · Overview");

  const liveIds = Array.from(
    new Set(
      priceCards
        .map((c) => c.coinGeckoId)
        .filter((id): id is CoinGeckoId => Boolean(id))
    )
  );
  const { prices, loading } = useCryptoPrices(liveIds);
  const { bounties, loading: bountiesLoading } = useBounties();

  const mappedBounties: InfluenceBountyItem[] = bounties.map(mapBounty);
  const activityItems: ActivityItem[] = [];

  const now = new Date();
  const formattedNow = now.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      {activityItems.length > 0 && (
        <UserActivityMarquee items={activityItems} />
      )}

      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">Last Update</span>
          <span className="text-[12.5px] text-fg-secondary ml-2 tabular-nums">
            {formattedNow}
          </span>
        </div>
        <h2
          className={cn(
            "mt-4 font-display font-medium tracking-[-0.03em]",
            "text-[64px] leading-[0.95] max-w-[480px]",
            "bg-clip-text text-transparent",
            "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
          )}
        >
          All Activity
          <br />
          Update
        </h2>
      </div>

      <div className="-mx-10 px-10 overflow-x-auto pb-2 scroll-smooth">
        <div className="flex gap-6 min-w-max">
          {priceCards.map((card) => (
            <div key={card.id} className="w-[480px] shrink-0">
              <PriceCard
                data={card}
                live={card.coinGeckoId ? prices[card.coinGeckoId] : undefined}
                loading={loading}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 pt-4">
        <div>
          <SectionHeader label="Live Update" title="Influence Section" />
          {bountiesLoading ? (
            <div
              className={cn(
                "relative overflow-hidden rounded-card border border-white/[0.06] shadow-card min-h-[420px]",
                "flex items-center justify-center"
              )}
              style={{ background: "rgb(var(--bg-card))" }}
            >
              <p className="text-[13px] text-fg-tertiary">Loading bounties...</p>
            </div>
          ) : mappedBounties.length > 0 ? (
            <InfluenceSection bounties={mappedBounties} />
          ) : (
            <EmptyBounties />
          )}
        </div>

        <div>
          <SectionHeader label="Live Update" title="Project overview" />
          <EmptyProjectOverview />
        </div>
      </div>
    </div>
  );
}