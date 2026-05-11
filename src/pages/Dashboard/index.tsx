import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { UserActivityMarquee } from "@/components/dashboard/UserActivityMarquee";
import { PriceCard } from "@/components/dashboard/PriceCard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { YapSection } from "@/components/dashboard/YapSection";
import { ProjectOverview } from "@/components/dashboard/ProjectOverview";
import { useCryptoPrices } from "@/lib/useCryptoPrices";
import type { CoinGeckoId } from "@/lib/crypto-api";
import {
  activityFeed,
  priceCards,
  yapBounties,
  projectRows,
} from "@/lib/mock-data";

export default function DashboardPage() {
  // Collect the CoinGecko ids needed by the live price cards
  const liveIds = Array.from(
    new Set(
      priceCards
        .map((c) => c.coinGeckoId)
        .filter((id): id is CoinGeckoId => Boolean(id))
    )
  );
  const { prices, loading } = useCryptoPrices(liveIds);

  return (
    <div className="space-y-8">
      {/* User activity marquee */}
      <UserActivityMarquee items={activityFeed} />

      {/* All Activity Update header */}
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

      {/* Price cards row */}
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

      {/* Bottom split — Yap Section + Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 pt-4">
        <div>
          <SectionHeader label="Live Update" title="Yap Section" />
          <YapSection bounties={yapBounties} />
        </div>
        <div>
          <SectionHeader label="Live Update" title="Project overview" />
          <ProjectOverview rows={projectRows} />
        </div>
      </div>
    </div>
  );
}
