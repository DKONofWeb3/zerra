import { Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { StatsBar } from "@/components/yap/StatsBar";
import { CreatorsTable } from "@/components/yap/CreatorsTable";
import { topCreators, topCreatorsStats } from "@/lib/mock-data";

export default function TopCreatorsPage() {
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

      {/* Stats bar */}
      <StatsBar stats={topCreatorsStats} />

      {/* Leaderboard */}
      <CreatorsTable rows={topCreators} />
    </div>
  );
}
