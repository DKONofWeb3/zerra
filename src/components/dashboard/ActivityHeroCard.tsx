import { BadgesPanel } from "@/components/dashboard/BadgesCard";
import { AttainedBadgePills } from "@/components/dashboard/AttainedBadgePills";
import type { BadgeState } from "@/lib/types";

interface ActivityHeroCardProps {
  tiktokLinked: boolean;
  loading: boolean;
  hasData: boolean;
  postsSynced: number;
  badges: BadgeState[];
  claimingId: string | null;
  onClaim: (id: string) => void;
}

// Settings is reachable from the sidebar, so no CTA link needed here.
export function ActivityHeroCard({
  tiktokLinked, loading, hasData, postsSynced,
  badges, claimingId, onClaim,
}: ActivityHeroCardProps) {
  const anyAttained = badges.some((b) => b.attained);

  return (
    <div
      className="relative overflow-hidden rounded-card border border-white/[0.06] p-5 md:p-8"
      style={{ background: "rgb(2 3 6)" }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: "85%",
          background: "linear-gradient(180deg, transparent 0%, rgb(35 48 88 / 0.55) 55%, rgb(58 78 132 / 0.85) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(120 150 255 / 0.5), transparent)" }}
      />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />

      <div className="relative">
        <p className="text-[12.5px] text-fg-tertiary">
          {tiktokLinked ? "TikTok account: Linked" : "Link your TikTok account."}
        </p>

        <h2 className="mt-2 font-display font-medium text-[28px] md:text-[36px] text-fg-primary tracking-[-0.02em] leading-tight">
          All Activity Update
        </h2>

        <div className="mt-3">
          <AttainedBadgePills badges={badges} />
          {!anyAttained && (
            <p className="text-[12px] text-fg-tertiary">
              {loading ? "…" : hasData ? `${postsSynced} posts synced` : "No posts synced yet"}
            </p>
          )}
        </div>

        {/* Mobile: hidden once attained — BadgeTilesRow takes over below the hero card. */}
        {!anyAttained && (
          <div className="md:hidden mt-5">
            <BadgesPanel badges={badges} claimingId={claimingId} onClaim={onClaim} />
          </div>
        )}

        <div className="hidden md:block mt-5">
          <BadgesPanel badges={badges} claimingId={claimingId} onClaim={onClaim} />
        </div>
      </div>
    </div>
  );
}
