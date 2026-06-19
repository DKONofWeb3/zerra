import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { UserActivityMarquee } from "@/components/dashboard/UserActivityMarquee";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { InfluenceStatsCard } from "@/components/dashboard/InfluenceStatsCard";
import { CreatorCard } from "@/components/dashboard/CreatorCard";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api/client";
import type { ActivityItem } from "@/lib/types";
import { usePageTitle } from "@/hooks/usePageTitle";

function fmt(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function AnalyticsView() {
  const { session } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!session) { setLoading(false); return; }
    apiGet<{ analytics: any }>("/analytics/tiktok")
      .then((d) => {
        // Backend returns { analytics: { summary: {...}, posts: [...] } }
        setAnalytics(d.analytics ?? null);
      })
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, [session]);

  // analytics.summary holds the aggregated stats
  const summary = analytics?.summary;
  const posts   = analytics?.posts ?? [];
  const hasData = !loading && summary && (summary.total_posts > 0 || summary.total_views > 0);

  const stats = [
    { label: "Total Views",    value: loading ? "…" : hasData ? fmt(summary.total_views)    : "—", sub: "All time" },
    { label: "Avg Engagement", value: loading ? "…" : hasData ? `${summary.avg_engagement_rate}%` : "—", sub: "Last 30 days" },
    { label: "Posts Synced",   value: loading ? "…" : hasData ? String(summary.total_posts) : "—", sub: "TikTok posts" },
    { label: "Total Likes",    value: loading ? "…" : hasData ? fmt(summary.total_likes)    : "—", sub: "Across all posts" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {stats.map(({ label, value, sub }) => (
          <div key={label} className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-4 md:p-5"
            style={{ background: "rgb(var(--bg-card))" }}>
            <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
            <p className="text-[11px] md:text-[12px] text-fg-tertiary">{label}</p>
            <p className={cn("mt-1.5 font-display font-medium leading-none",
              loading ? "animate-pulse text-fg-muted text-[28px]" : "text-[28px] md:text-[32px] text-gradient")}>
              {value}
            </p>
            <p className="mt-1 text-[11px] text-fg-muted">{sub}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="relative overflow-hidden rounded-card border border-white/[0.06] min-h-[200px] flex items-center justify-center"
          style={{ background: "rgb(var(--bg-card))" }}>
          <p className="text-[13px] text-fg-tertiary">Loading analytics...</p>
        </div>

      ) : hasData ? (
        <div className="relative overflow-hidden rounded-card border border-white/[0.06] p-5 md:p-6"
          style={{ background: "rgb(var(--bg-card))" }}>
          <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
          <p className="text-[15px] font-semibold text-fg-primary mb-4">Top Posts</p>
          {posts.length > 0 ? (
            <div>
              {posts.slice(0, 5).map((post: any, i: number) => (
                <div key={post.post_id ?? i} className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0">
                  <span className="text-[12px] text-fg-muted tabular-nums w-4 shrink-0">{i + 1}</span>

                  {/* Thumbnail — use cover_image_url but fallback gracefully */}
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-bg-elevated border border-white/[0.06] shrink-0">
                    {post.cover_image_url ? (
                      <img
                        src={post.cover_image_url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--fg-muted))" strokeWidth="1.6">
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-fg-primary truncate">
                      {post.title || post.description || "No caption"}
                    </p>
                    <p className="text-[11.5px] text-fg-tertiary mt-0.5">
                      {fmt(post.view_count ?? 0)} views · {fmt(post.like_count ?? 0)} likes
                    </p>
                  </div>
                  <span className="text-[12px] font-semibold tabular-nums shrink-0"
                    style={{ color: (post.engagement_rate ?? 0) >= 5 ? "rgb(var(--success))" : "rgb(var(--fg-secondary))" }}>
                    {(post.engagement_rate ?? 0).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-fg-tertiary">No posts found.</p>
          )}
        </div>

      ) : (
        <div className="relative overflow-hidden rounded-card border border-white/[0.06] min-h-[280px] flex flex-col items-center justify-center gap-4"
          style={{ background: "rgb(var(--bg-card))" }}>
          <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
          <div className="w-12 h-12 rounded-2xl border border-white/[0.06] bg-bg-elevated flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--fg-muted))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
          </div>
          <div className="text-center px-8">
            <p className="text-[15px] font-medium text-fg-primary mb-1">No analytics data yet</p>
            <p className="text-[13px] text-fg-tertiary leading-relaxed max-w-sm">
              Connect your TikTok and sync your posts to see analytics here.
            </p>
          </div>
          <a href="/influence/top-performing"
            className="px-5 py-2.5 rounded-xl text-[13px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors">
            Go to Top Performing →
          </a>
        </div>
      )}
    </div>
  );
}

function OverviewView() {
  const { session } = useAuth();

  // Fetch profile + card stats for the shareable creator card
  const [profile, setProfile] = useState<{ name: string | null; avatar: string | null; username: string | null } | null>(null);
  const [cardStats, setCardStats] = useState({ totalScore: 0, campaignsJoined: 0 });

  // Influence Section stats (Yap-style card)
  const [influenceStats, setInfluenceStats] = useState({
    totalScore: 0, scoreChangePercent: 0,
    eligibleVideos: 0, eligibleChangePercent: 0,
    campaignsJoined: 0, campaignsChangePercent: 0,
  });
  const [influenceLoading, setInfluenceLoading] = useState(true);

  useEffect(() => {
    if (!session) { setInfluenceLoading(false); return; }

    apiGet<{ name: string | null; avatar: string | null; tiktok_username?: string | null }>("/me")
      .then((d) => setProfile({ name: d.name, avatar: d.avatar, username: d.tiktok_username ?? null }))
      .catch(() => {});

    apiGet<{ totalScore: number; campaignsJoined: number }>("/me/card-stats")
      .then((d) => setCardStats(d))
      .catch(() => {});

    apiGet<typeof influenceStats>("/me/influence-stats")
      .then((d) => setInfluenceStats(d))
      .catch(() => {})
      .finally(() => setInfluenceLoading(false));
  }, [session]);

  const activityItems: ActivityItem[] = [];

  const now = new Date();
  const formattedNow = now.toLocaleString("en-US", {
    hour: "numeric", minute: "2-digit", day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="space-y-6 md:space-y-8">
      {activityItems.length > 0 && <UserActivityMarquee items={activityItems} />}

      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">Last Update</span>
          <span className="text-[12.5px] text-fg-secondary ml-2 tabular-nums">{formattedNow}</span>
        </div>
        <h2 className={cn(
          "mt-4 font-display font-medium tracking-[-0.03em]",
          "text-[40px] md:text-[64px] leading-[0.95] max-w-[480px]",
          "bg-clip-text text-transparent",
          "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
        )}>
          All Activity<br />Update
        </h2>
      </div>

      {/* Shareable Zerra Creator Card — replaces crypto price cards, full width hero size */}
      <div className="w-full max-w-3xl">
        <CreatorCard
          name={profile?.name ?? session?.user.email?.split("@")[0] ?? "Creator"}
          username={profile?.username}
          avatar={profile?.avatar}
          totalScore={cardStats.totalScore}
          campaignsJoined={cardStats.campaignsJoined}
        />
      </div>

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
          <SectionHeader label="Live Update" title="Project Overview" />
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
    </div>
  );
}

export default function DashboardPage() {
  usePageTitle("Zerra · Overview");
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "analytics" ? "analytics" : "overview";

  return (
    <div>
      {tab === "overview" ? <OverviewView /> : <AnalyticsView />}
    </div>
  );
}