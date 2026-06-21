import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { UserActivityMarquee } from "@/components/dashboard/UserActivityMarquee";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { InfluenceStatsCard } from "@/components/dashboard/InfluenceStatsCard";
import { ActivityHeroCard } from "@/components/dashboard/ActivityHeroCard";
import { BadgeClaimModal } from "@/components/dashboard/BadgeClaimModal";
import { AttainedBadgePills } from "@/components/dashboard/AttainedBadgePills";
import { AnalyticsOverview } from "@/components/dashboard/AnalyticsOverview";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api/client";
import { useBadges } from "@/hooks/useBadges";
import type { ActivityItem, TikTokAnalytics } from "@/lib/types";
import { usePageTitle } from "@/hooks/usePageTitle";

/** Normalize a numeric series to 0–1 for sparkline rendering. Returns [] if fewer than 2 points (nothing to plot a trend with). */
function normalizeTrend(values: number[]): number[] {
  if (values.length < 2) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0.5);
  return values.map((v) => (v - min) / (max - min));
}

function OverviewView() {
  const { session } = useAuth();
  const { badges, claim, claimingId } = useBadges();
  const [claimModalId, setClaimModalId] = useState<string | null>(null);

  // TikTok analytics summary — powers the hero card's reach/engagement stats
  const [analytics, setAnalytics] = useState<TikTokAnalytics | null>(null);
  const [tiktokLinked, setTiktokLinked] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Influence Section stats (Zerra platform score — unrelated to TikTok analytics)
  const [influenceStats, setInfluenceStats] = useState({
    totalScore: 0, scoreChangePercent: 0,
    eligibleVideos: 0, eligibleChangePercent: 0,
    campaignsJoined: 0, campaignsChangePercent: 0,
  });
  const [influenceLoading, setInfluenceLoading] = useState(true);

  useEffect(() => {
    if (!session) { setAnalyticsLoading(false); setInfluenceLoading(false); return; }

    apiGet<{ tiktok_username?: string | null }>("/me")
      .then((d) => setTiktokLinked(Boolean(d.tiktok_username)))
      .catch(() => {});

    apiGet<{ analytics: TikTokAnalytics | null }>("/analytics/tiktok")
      .then((d) => setAnalytics(d.analytics ?? null))
      .catch(() => setAnalytics(null))
      .finally(() => setAnalyticsLoading(false));

    apiGet<typeof influenceStats>("/me/influence-stats")
      .then((d) => setInfluenceStats(d))
      .catch(() => {})
      .finally(() => setInfluenceLoading(false));
  }, [session]);

  const summary = analytics?.summary;
  const hasAnalyticsData = !analyticsLoading && Boolean(summary && summary.total_posts > 0);

  // Real chronological trends from the synced posts — empty array if fewer than 2 posts to plot.
  const { viewsTrend, engagementTrend } = useMemo(() => {
    const posts = analytics?.posts ?? [];
    const chronological = [...posts].sort(
      (a, b) => new Date(a.fetched_at).getTime() - new Date(b.fetched_at).getTime()
    );
    return {
      viewsTrend: normalizeTrend(chronological.map((p) => Number(p.view_count) || 0)),
      engagementTrend: normalizeTrend(chronological.map((p) => Number(p.engagement_rate) || 0)),
    };
  }, [analytics]);

  const activityItems: ActivityItem[] = [];

  const claimedBadge = badges.find((b) => b.id === claimModalId) ?? null;

  const handleClaim = async (id: string) => {
    await claim(id);
    setClaimModalId(id); // open the reveal modal regardless of network outcome — claim() always settles attained locally
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {activityItems.length > 0 && <UserActivityMarquee items={activityItems} />}

      <div className="pt-2 flex items-center gap-2.5 text-fg-tertiary">
        <DiamondIcon size={14} />
        <span className="text-[12.5px]">Last Update</span>
        <span className="text-[12.5px] text-fg-secondary ml-2 tabular-nums">
          {new Date().toLocaleString("en-US", { hour: "numeric", minute: "2-digit", day: "numeric", month: "short", year: "numeric" })}
        </span>
      </div>

      <AttainedBadgePills badges={badges} />

      <ActivityHeroCard
        tiktokLinked={tiktokLinked}
        loading={analyticsLoading}
        hasData={hasAnalyticsData}
        totalReach={summary?.total_views ?? 0}
        engagementRate={summary?.avg_engagement_rate ?? 0}
        totalLikes={summary?.total_likes ?? 0}
        postsSynced={summary?.total_posts ?? 0}
        viewsTrend={viewsTrend}
        engagementTrend={engagementTrend}
        badges={badges}
        claimingId={claimingId}
        onClaim={handleClaim}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 pt-2 md:pt-4">
        <div>
          <SectionHeader label="Live Update" title="Influence Section" />
          {influenceLoading ? (
            <div className={cn("relative overflow-hidden rounded-card border border-white/[0.06] shadow-card min-h-[220px]", "flex items-center justify-center")}
              style={{ background: "rgb(var(--bg-card))" }}>
              <p className="text-[13px] text-fg-tertiary">Loading stats...</p>
            </div>
          ) : (
            <InfluenceStatsCard
              totalScore={influenceStats.totalScore}
              scoreChangePercent={influenceStats.scoreChangePercent}
              eligibleVideos={influenceStats.eligibleVideos}
              eligibleChangePercent={influenceStats.eligibleChangePercent}
              campaignsJoined={influenceStats.campaignsJoined}
              campaignsChangePercent={influenceStats.campaignsChangePercent}
            />
          )}
        </div>
        <div>
          <SectionHeader label="Live Update" title="Campaign Overview" />
          <div className="relative overflow-hidden rounded-card border border-white/[0.06] shadow-card min-h-[220px] flex flex-col items-center justify-center gap-4 p-6"
            style={{ background: "rgb(var(--bg-card))" }}>
            <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
            <div className="w-12 h-12 rounded-2xl border border-white/[0.06] bg-bg-elevated flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--fg-muted))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <div className="text-center px-4">
              <p className="text-[15px] font-medium text-fg-primary mb-1">Discover new campaigns</p>
              <p className="text-[13px] text-fg-tertiary leading-relaxed">
                Browse live opportunities from top crypto projects and start earning.
              </p>
            </div>
            <a href="/explore"
              className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white text-center"
              style={{ background: "rgb(74 125 255)" }}>
              Browse Campaigns →
            </a>
          </div>
        </div>
      </div>

      <BadgeClaimModal badge={claimedBadge} onClose={() => setClaimModalId(null)} />
    </div>
  );
}

export default function DashboardPage() {
  usePageTitle("Zerra · Overview");
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "analytics" ? "analytics" : "overview";

  return (
    <div>
      {tab === "overview" ? <OverviewView /> : <AnalyticsOverview />}
    </div>
  );
}