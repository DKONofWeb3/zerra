import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { BadgesPanel } from "@/components/dashboard/BadgesCard";
import { AttainedBadgePills } from "@/components/dashboard/AttainedBadgePills";
import { GreenSparkline } from "@/components/dashboard/GreenSparkline";
import type { BadgeState, TikTokPost } from "@/lib/types";

function fmt(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

/** Shared dark-blue gradient surface used by the two medium-level containers (stats / badges). */
const MEDIUM_CONTAINER_BG = "linear-gradient(165deg, rgb(15 21 46) 0%, rgb(8 12 28) 100%)";
/** Shared matte-black surface used by the small cards nested inside each medium container. */
const MATTE_CARD_BG = "rgb(15 16 20)";

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

/** Mobile/attained pattern — plain label/value/percent-pill, no chart, no individual border.
 *  UNTOUCHED — mobile layout is out of scope for this fix. */
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

/** Desktop pattern — small matte-black card, label+value above, pure-green chart below. Matches fic.jpg exactly. */
function SubStatChartCard({
  label, value, trendPoints, link,
}: { label: string; value: string; trendPoints: { x: number; y: number }[]; link?: boolean }) {
  return (
    <div className="rounded-xl p-3.5" style={{ background: MATTE_CARD_BG }}>
      <div className="flex items-center gap-1.5 text-fg-tertiary">
        <span className="text-[12px]">{label}</span>
        {link && <span className="text-fg-muted text-[12px]">›</span>}
      </div>
      <p className="mt-1.5 font-display font-medium text-[18px] text-fg-primary tabular-nums">{value}</p>
      {trendPoints.length >= 2 && (
        <div className="h-9 mt-2 -mx-0.5 -mb-0.5">
          <GreenSparkline points={trendPoints} />
        </div>
      )}
    </div>
  );
}

/** Builds real per-post chart points from chronological posts. Returns [] if fewer than 2 posts — nothing honest to plot. */
function buildTrendPoints(posts: TikTokPost[], pick: (p: TikTokPost) => number): { x: number; y: number }[] {
  const chronological = [...posts].sort((a, b) => new Date(a.fetched_at).getTime() - new Date(b.fetched_at).getTime());
  if (chronological.length < 2) return [];
  const values = chronological.map(pick);
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map((_, i) => ({ x: i, y: 0.5 }));
  return values.map((v, i) => ({ x: i, y: (v - min) / (max - min) }));
}

interface ActivityHeroCardProps {
  tiktokLinked: boolean;
  loading: boolean;
  hasData: boolean;
  totalReach: number;
  engagementRate: number;
  totalLikes: number;
  postsSynced: number;
  posts: TikTokPost[];
  badges: BadgeState[];
  claimingId: string | null;
  onClaim: (id: string) => void;
}

/**
 * The hero card. Desktop structure (fic.jpg) — FIXED this round:
 *
 * Outer card (dark, blue glow at bottom edge)
 *  └─ Header row, heading, attained-badge pills, followers line
 *  └─ ONE row, two MEDIUM containers side by side, ALWAYS — regardless
 *     of whether any badge is attained. Badges never move below the
 *     hero card on desktop; they live permanently in the right column:
 *       - Left: "Total Reach" + big number, then two SMALL matte-black
 *         cards side by side, each with its own green sparkline
 *       - Right: "Verified Badge for Creators" + two SMALL matte-black
 *         badge tiles side by side (compact layout)
 *
 * Mobile (md:hidden branch) is completely untouched — same conditional
 * stacking behavior as before.
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

        {/* ============ MOBILE — UNCHANGED, badges still move below once attained ============ */}
        <div className="md:hidden mt-5">
          <div className={cn("grid gap-5", !anyAttained && "lg:grid-cols-[1.2fr_1fr] lg:items-start")}>
            <div
              className="rounded-2xl border border-white/[0.06] p-4"
              style={{ background: "rgb(0 0 0 / 0.35)" }}
            >
              <p className="text-[12px] text-fg-tertiary mb-1">Total Reach</p>
              <p className="font-display font-medium text-[28px] text-fg-primary tabular-nums leading-none mb-4">
                {loading ? "—" : hasData ? fmt(totalReach) : "0"}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.05]">
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
            </div>
            {!anyAttained && (
              <BadgesPanel badges={badges} claimingId={claimingId} onClaim={onClaim} />
            )}
          </div>
        </div>

        {/* ============ DESKTOP — FIXED this round ============
            Always two columns, stats left / badges right. Badges
            NEVER leave this row regardless of attained state — that
            was the bug. The `!anyAttained` gate that used to hide the
            right column entirely has been removed. */}
        <div className="hidden md:grid grid-cols-[1.2fr_1fr] items-start gap-5 mt-5">
          {/* Medium container: stats */}
          <div className="rounded-2xl p-4 md:p-5" style={{ background: MEDIUM_CONTAINER_BG }}>
            <p className="text-[12px] text-fg-tertiary mb-1">Total Reach</p>
            <p className="font-display font-medium text-[30px] text-fg-primary tabular-nums leading-none mb-4">
              {loading ? "—" : hasData ? fmt(totalReach) : "0"}
            </p>
            <div className="grid grid-cols-2 gap-3.5">
              <SubStatChartCard
                label="Engagement Rate"
                value={loading ? "—" : hasData ? `${engagementRate}%` : "0%"}
                trendPoints={engagementTrend}
                link
              />
              <SubStatChartCard
                label="Total Likes"
                value={loading ? "—" : hasData ? fmt(totalLikes) : "0"}
                trendPoints={likesTrend}
                link
              />
            </div>
          </div>

          {/* Medium container: badges — always rendered, regardless of attained state */}
          <BadgesPanel badges={badges} claimingId={claimingId} onClaim={onClaim} variant="desktop-paired" />
        </div>
      </div>
    </div>
  );
}