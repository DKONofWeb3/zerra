import { Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { FeaturedCreatorCard } from "@/components/yap/FeaturedCreatorCard";
import { LargePremiumCard } from "@/components/yap/LargePremiumCard";
import { ContentTable } from "@/components/yap/ContentTable";
import { DonutChart } from "@/components/yap/DonutChart";
import {
  featuredCreators,
  topPerformingContent,
  topPerformingDonut,
} from "@/lib/mock-data";

// Sample chart data — wavy curves rising on the right
const ADAM_DATA = [22, 18, 24, 20, 32, 24, 36, 28, 42, 30, 50, 36, 64, 42];
const SARAH_DATA = [20, 24, 28, 22, 32, 26, 38, 30, 40, 28, 48, 34, 58, 38];

export default function TopPerformingPage() {
  return (
    <div className="pb-12 space-y-8">
      {/* Header */}
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <Star className="w-3.5 h-3.5" />
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
          Top Creators
        </h2>
      </div>

      {/* Featured row — 2 wide creator cards, smaller premium pill */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_1.3fr] gap-5">
        <FeaturedCreatorCard creator={featuredCreators[0]} data={ADAM_DATA} />
        <FeaturedCreatorCard creator={featuredCreators[1]} data={SARAH_DATA} />
        <LargePremiumCard />
      </div>

      {/* Bottom: content table + donuts */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <ContentTable rows={topPerformingContent} />
        <div className="space-y-5">
          <DonutChart segments={topPerformingDonut} />
          <DonutChart segments={topPerformingDonut} />
        </div>
      </div>
    </div>
  );
}
