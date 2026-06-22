import { useMemo, useState } from "react";
import { ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { BadgesPanel } from "@/components/dashboard/BadgesCard";
import { AttainedBadgePills } from "@/components/dashboard/AttainedBadgePills";
import { SparklineChart } from "@/components/dashboard/SparklineChart";
import type { BadgeState, TikTokPost } from "@/lib/types";

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

function ChangePill({ percent }: { percent: number }) {
  const positive = percent >= 0;
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium",
      positive ? "text-success bg-[rgb(var(--success)/0.12)]" : "text-danger bg-[rgb(var(--danger)/0.12)]"
    )}>
      {positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {Math.abs(percent).toFixed(1)}%
    </span>
  );
}

/** Mobile/attained pattern — plain label/value/percent-pill, no chart, no individual border. Matches 441995.jpg / mobile.jpg. */
function SubStatRow({ label, value, link }: { label: string; value: string; link?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-fg-tertiary">
        <span className="text-[12px]">{label}</span>
        {link && <span className="text-fg-muted text-[12px]">›</span>}
      </div>
      <p className="mt-1.5 font-display font-medium text-[20px] md:text-[24px] text-fg-primary tabular-nums">
        {value}
      </p>
    </div>
  );
}

/** Desktop pattern — its own bordered rounded card with a real sparkline underneath. Matches dashboard.jpg. */
function SubStatChartCard({
  label, value, changePercent, trendPoints, link,
}: { label: string; value: string; changePercent: number | null; trendPoints: { x: number; y: number }[]; link?: boolean }) {
  const trend: "up" | "down" | "flat" =
    trendPoints.length < 2 ? "flat" : trendPoints[trendPoints.length - 1].y >= trendPoints[0].y ? "up" : "down";

  return (
    <div className="rounded-xl border border-white/[0.06] p-3.5" style={{ background: "rgb(10 13 22 / 0.7)" }}>
      <div className="flex items-center gap-1.5 text-fg-tertiary">
        <span className="text-[12px]">{label}</span>
        {link && <span className="text-fg-muted text-[12px]">›</span>}
      </div>
      <div className="flex items-center gap-2 mt-1.5">
        <span className="font-display font-medium text-[20px] text-fg-primary tabular-nums">{value}</span>
        {changePercent != null && <ChangePill percent={changePercent} />}
      </div>
      {trendPoints.length >= 2 && (
        <div className="h-10 mt-2 -mx-1 -mb-1">
          <SparklineChart data={trendPoints} trend={trend} width={260} height={64} />
        </div>
      )}
    </div>
  );
}

/** Builds real per-post chart points from chronological posts. Returns [] if fewer than 2 posts — nothing honest to plot. */
function buildTrendPoints(posts: TikTokPost[], pick: (p: TikTokPost) => number): { x: number; y: number }[] {
  const chronological = [...posts].sort((a, b) => new Date(a.fetched_at).getTime() - new Date(b.fetched_at).getTime());
  if (chronological.length < 2) return [];
  return chronological.map((p, i) => ({ x: i, y: pick(p) }));
}

interface ActivityHeroCardProps {
  tiktokLinked: boolean;
  loading: boolean;
  hasData: boolean;
  /** Real field: summary.total_views from /analytics/tiktok */
  totalReach: number;
  /** Real field: summary.avg_engagement_rate from /analytics/tiktok */
  engagementRate: number;
  /** Real field: summary.total_likes from /analytics/tiktok. Stands in for the design's "Profile views" slot —
   *  there's no real profile-view metric in our data model, so we use a real field instead of fabricating one. */
  totalLikes: number;
  /** Real field: summary.total_posts from /analytics/tiktok */
  postsSynced: number;
  /** Real per-post records, used ONLY to draw the desktop sub-stat charts. Empty/short arrays simply render no chart. */
  posts: TikTokPost[];
  badges: BadgeState[];
  claimingId: string | null;
  onClaim: (id: string) => void;
}

/**
 * The hero card.
 *
 * Desktop (dashboard.jpg): each sub-stat is its OWN bordered rounded
 * card with a real sparkline chart underneath, built from chronological
 * posts[] — engagement_rate for the first card, like_count for the
 * second. Both series are real, just min/max-scaled for chart display.
 *
 * Mobile (441995.jpg / mobile.jpg): plain label/value/percent-pill
 * rows, no individual card border, no chart — that's a genuinely
 * different layout at that breakpoint in the actual designs, not an
 * oversight.
 *
 * Badge panel: lives inside this card (two-column) only while nothing
 * is attained yet. Once a badge is attained, the parent (Dashboard)
 * renders bare tiles in a separate row below instead.
 */
export function ActivityHeroCard({
  tiktokLinked, loading, hasData, totalReach, engagementRate, totalLikes, postsSynced,
  posts, badges, claimingId, onClaim,
}: ActivityHeroCardProps) {
  const anyAttained = badges.some((b) => b.attained);

  const engagementTrend = useMemo(() => buildTrendPoints(posts, (p) => Number(p.engagement_rate) || 0), [posts]);
  const likesTrend = useMemo(() => buildTrendPoints(posts, (p) => Number(p.like_count) || 0), [posts]);

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

      <div className="relative">
        {/* Top row: status label + dropdowns */}
        <div className="flex items-start justify-between gap-3">
          <p className="text-[12.5px] text-fg-tertiary">
            {tiktokLinked ? "TikTok account: Linked" : "Link your TikTok account."}
          </p>
          <div className="hidden md:flex gap-2.5 shrink-0">
            <DropdownPill label="Wallet Balance" options={["Wallet Balance", "USDC", "Points"]} />
            <DropdownPill label="Linked Socials" options={["Linked Socials", "TikTok", "Instagram", "X"]} />
          </div>
        </div>

        <h2 className="mt-2 font-display font-medium text-[28px] md:text-[36px] text-fg-primary tracking-[-0.02em] leading-tight">
          All Activity Update
        </h2>

        <div className="flex md:hidden gap-2.5 mt-3">
          <DropdownPill label="Wallet Balance" options={["Wallet Balance", "USDC", "Points"]} />
          <DropdownPill label="Linked Socials" options={["Linked Socials", "TikTok", "Instagram", "X"]} />
        </div>

        {!tiktokLinked ? (
          <a
            href="/settings"
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-medium text-fg-secondary border border-white/[0.08] bg-bg-elevated hover:bg-white/[0.06] transition-colors"
          >
            Link TikTok <span className="text-fg-muted">›</span>
          </a>
        ) : (
          <div className="mt-3">
            <AttainedBadgePills badges={badges} />
            {!anyAttained && (
              <p className="text-[12px] text-fg-tertiary">
                {loading ? "…" : hasData ? `${postsSynced} posts synced` : "No posts synced yet"}
              </p>
            )}
          </div>
        )}

        <div className={cn("mt-5 grid gap-5", !anyAttained && "lg:grid-cols-[1.2fr_1fr] lg:items-start")}>
          {/* Nested stats card */}
          <div
            className="rounded-2xl border border-white/[0.06] p-4 md:p-5"
            style={{ background: "rgb(0 0 0 / 0.35)" }}
          >
            <p className="text-[12px] text-fg-tertiary mb-1">Total Reach</p>
            <div className="flex items-center gap-2.5 mb-4">
              <p className="font-display font-medium text-[28px] md:text-[34px] text-fg-primary tabular-nums leading-none">
                {loading ? "—" : hasData ? fmt(totalReach) : "0"}
              </p>
            </div>

            {/* Mobile: plain rows, shared bottom border */}
            <div className="md:hidden grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.05]">
              <SubStatRow
                label="Engagement Rate"
                value={loading ? "—" : hasData ? `${engagementRate}%` : "0%"}
                link
              />
              <SubStatRow
                label="Total Likes"
                value={loading ? "—" : hasData ? fmt(totalLikes) : "0"}
                link
              />
            </div>

            {/* Desktop: individually-bordered cards with charts */}
            <div className="hidden md:grid grid-cols-2 gap-4">
              <SubStatChartCard
                label="Engagement Rate"
                value={loading ? "—" : hasData ? `${engagementRate}%` : "0%"}
                changePercent={null}
                trendPoints={engagementTrend}
                link
              />
              <SubStatChartCard
                label="Total Likes"
                value={loading ? "—" : hasData ? fmt(totalLikes) : "0"}
                changePercent={null}
                trendPoints={likesTrend}
                link
              />
            </div>
          </div>

          {/* Badge panel — only rendered here, inside the card, while nothing is attained yet */}
          {!anyAttained && (
            <BadgesPanel badges={badges} claimingId={claimingId} onClaim={onClaim} />
          )}
        </div>
      </div>
    </div>
  );
}