import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { BadgesCard } from "@/components/dashboard/BadgesCard";
import { SparklineChart } from "@/components/dashboard/SparklineChart";
import type { BadgeState } from "@/lib/types";

function fmt(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

interface DropdownPillProps {
  label: string;
  options: string[];
}

function DropdownPill({ label, options }: DropdownPillProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(label);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] text-fg-secondary border border-white/[0.08] bg-black/20 hover:bg-black/30 transition-colors whitespace-nowrap"
      >
        <span className="italic">{selected}</span>
        <ChevronDown className="w-3 h-3 shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1.5 z-20 min-w-[140px] rounded-lg border border-white/[0.08] bg-bg-elevated shadow-lg overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { setSelected(opt); setOpen(false); }}
                className="block w-full text-left px-3.5 py-2 text-[12px] text-fg-secondary hover:bg-white/[0.06] transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** A sparkline-backed sub-stat card — "Verified Engagements" / "Profile View" pattern from the design. */
function SparkStatCard({
  label, value, trendData, link,
}: { label: string; value: string; trendData: number[]; link?: boolean }) {
  const points = trendData.map((y, i) => ({ x: i, y }));
  const trend: "up" | "down" | "flat" =
    trendData.length < 2 ? "flat" : trendData[trendData.length - 1] >= trendData[0] ? "up" : "down";

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-4"
      style={{ background: "rgb(10 13 22 / 0.7)" }}
    >
      <div className="flex items-center gap-1.5 text-fg-tertiary">
        <span className="text-[12px]">{label}</span>
        {link && <span className="text-fg-muted text-[12px]">›</span>}
      </div>
      <p className="mt-1.5 font-display font-medium text-[22px] md:text-[26px] text-fg-primary tabular-nums">
        {value}
      </p>
      {trendData.length >= 2 && (
        <div className="h-12 mt-1 -mx-1 -mb-1">
          <SparklineChart data={points} trend={trend} width={260} height={70} />
        </div>
      )}
    </div>
  );
}

interface ActivityHeroCardProps {
  tiktokLinked: boolean;
  loading: boolean;
  hasData: boolean;
  /** Real field: summary.total_views from /analytics/tiktok */
  totalReach: number;
  /** Real field: summary.avg_engagement_rate from /analytics/tiktok */
  engagementRate: number;
  /** Real field: summary.total_likes from /analytics/tiktok */
  totalLikes: number;
  /** Real field: summary.total_posts from /analytics/tiktok */
  postsSynced: number;
  /** Real per-post view counts (chronological), used to draw the sparkline trends. Empty array renders no chart. */
  viewsTrend: number[];
  /** Real per-post engagement rates (chronological), used to draw the sparkline trend. Empty array renders no chart. */
  engagementTrend: number[];
  badges: BadgeState[];
  claimingId: string | null;
  onClaim: (id: string) => void;
}

/**
 * The merged hero card: "All Activity Update" heading + TikTok reach
 * stats on the left, "Verified Badge for Creators" claim panel on the
 * right. One outer card, matching dashboard.jpg.
 *
 * Visual notes from pixel-sampling the reference:
 * - The card has a blue glow anchored to the BOTTOM edge, fading to
 *   near-black at the top — not a top-down wash. Brightness ramps
 *   smoothly from ~rgb(1,1,3) at the top to ~rgb(58,72,119) at the
 *   bottom on both left and right edges.
 * - The two sub-stat cards (Verified Engagements / Profile View in
 *   the mock) are a distinct, slightly-lighter near-black surface
 *   with a small sparkline chart inside.
 *
 * Every number is real, from GET /analytics/tiktok's `summary` —
 * no fabricated change percentages, no metrics the backend doesn't
 * actually collect.
 */
export function ActivityHeroCard({
  tiktokLinked, loading, hasData, totalReach, engagementRate, totalLikes, postsSynced,
  viewsTrend, engagementTrend, badges, claimingId, onClaim,
}: ActivityHeroCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-card border border-white/[0.06] p-5 md:p-8"
      style={{ background: "rgb(2 3 6)" }}
    >
      {/* Bottom-anchored blue glow — matches the reference's brightness ramp */}
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

      <div className="relative grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 lg:gap-8">
        {/* Left: heading + stats */}
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12.5px] text-fg-tertiary">
                {tiktokLinked ? "TikTok account: Linked" : "Link your TikTok account."}
              </p>
              <h2 className="mt-2 font-display font-medium text-[28px] md:text-[36px] text-fg-primary tracking-[-0.02em] leading-tight">
                All Activity Update
              </h2>
            </div>
            {/* Dropdowns — desktop only, top-right of the whole card */}
            <div className="hidden lg:flex gap-2.5 shrink-0">
              <DropdownPill label="Wallet Balance" options={["Wallet Balance", "USDC", "Points"]} />
              <DropdownPill label="Linked Socials" options={["Linked Socials", "TikTok", "Instagram", "X"]} />
            </div>
          </div>

          {!tiktokLinked ? (
            <a
              href="/settings"
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-medium text-fg-secondary border border-white/[0.08] bg-bg-elevated hover:bg-white/[0.06] transition-colors"
            >
              Link TikTok <span className="text-fg-muted">›</span>
            </a>
          ) : (
            <p className="mt-3 text-[12px] text-fg-tertiary">
              {loading ? "…" : hasData ? `${postsSynced} posts synced` : "No posts synced yet"}
            </p>
          )}

          <div className="mt-5">
            <p className="text-[12px] text-fg-tertiary mb-1">Total Views</p>
            <p className="font-display font-medium text-[32px] md:text-[40px] text-fg-primary tabular-nums leading-none">
              {loading ? "—" : hasData ? fmt(totalReach) : "0"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            <SparkStatCard
              label="Avg Engagement Rate"
              value={loading ? "—" : hasData ? `${engagementRate}%` : "0%"}
              trendData={engagementTrend}
              link
            />
            <SparkStatCard
              label="Total Likes"
              value={loading ? "—" : hasData ? fmt(totalLikes) : "0"}
              trendData={viewsTrend}
              link
            />
          </div>
        </div>

        {/* Right: badge claim panel (dropdowns moved up top on desktop; shown here on mobile) */}
        <div className="flex flex-col gap-4 min-w-0">
          <div className="flex lg:hidden justify-end gap-2.5">
            <DropdownPill label="Wallet Balance" options={["Wallet Balance", "USDC", "Points"]} />
            <DropdownPill label="Linked Socials" options={["Linked Socials", "TikTok", "Instagram", "X"]} />
          </div>
          <BadgesCard badges={badges} claimingId={claimingId} onClaim={onClaim} />
        </div>
      </div>
    </div>
  );
}