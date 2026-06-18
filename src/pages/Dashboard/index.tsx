import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { UserActivityMarquee } from "@/components/dashboard/UserActivityMarquee";
import { PriceCard } from "@/components/dashboard/PriceCard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { InfluenceSection } from "@/components/dashboard/InfluenceSection";
import { useCryptoPrices } from "@/lib/useCryptoPrices";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api/client";
import type { CoinGeckoId } from "@/lib/crypto-api";
import type { InfluenceBountyItem, ActivityItem } from "@/lib/types";
import { priceCards } from "@/lib/mock-data";
import { usePageTitle } from "@/hooks/usePageTitle";

function EmptyBounties() {
  return (
    <div className={cn("relative overflow-hidden rounded-card", "border border-white/[0.06] shadow-card min-h-[220px]", "flex flex-col items-center justify-center gap-4")}
      style={{ background: "rgb(var(--bg-card))" }}>
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
      <div className="w-12 h-12 rounded-2xl border border-white/[0.06] bg-bg-elevated flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--fg-muted))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
      <div className="text-center px-8">
        <p className="text-[15px] font-medium text-fg-primary mb-1">No campaigns joined yet</p>
        <p className="text-[13px] text-fg-tertiary leading-relaxed">Join a campaign on the Explore page to start earning.</p>
      </div>
      <a href="/explore"
        className="px-5 py-2 rounded-xl text-[12.5px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors">
        Browse Campaigns →
      </a>
    </div>
  );
}

function EmptyProjectOverview() {
  return (
    <div className={cn("relative overflow-hidden rounded-card", "border border-white/[0.06] shadow-card min-h-[280px]", "flex flex-col items-center justify-center gap-4")}
      style={{ background: "rgb(var(--bg-card))" }}>
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
      <div className="w-12 h-12 rounded-2xl border border-white/[0.06] bg-bg-elevated flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--fg-muted))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
        </svg>
      </div>
      <div className="text-center px-8">
        <p className="text-[15px] font-medium text-fg-primary mb-1">No projects yet</p>
        <p className="text-[13px] text-fg-tertiary leading-relaxed">Projects you participate in will show up here.</p>
      </div>
      <div className="px-4 py-2 rounded-full border border-white/[0.06] bg-bg-elevated text-[12px] text-fg-tertiary">Coming soon</div>
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
  const liveIds = Array.from(
    new Set(priceCards.map((c) => c.coinGeckoId).filter((id): id is CoinGeckoId => Boolean(id)))
  );
  const { prices, loading } = useCryptoPrices(liveIds);

  // Load campaigns the user has actually joined instead of all bounties
  const [joinedCampaigns, setJoinedCampaigns] = useState<any[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);

  useEffect(() => {
    if (!session) { setCampaignsLoading(false); return; }
    apiGet<{ campaigns: any[] }>("/me/campaigns")
      .then((d) => setJoinedCampaigns(d.campaigns ?? []))
      .catch(() => setJoinedCampaigns([]))
      .finally(() => setCampaignsLoading(false));
  }, [session]);

  const mappedBounties: InfluenceBountyItem[] = joinedCampaigns.map(mapBounty);
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

      <div className="-mx-4 px-4 md:-mx-10 md:px-10 overflow-x-auto pb-2 scroll-smooth">
        <div className="flex gap-4 md:gap-6 w-max" style={{ paddingRight: 16 }}>
          {priceCards.map((card) => (
            <div key={card.id} className="w-[220px] md:w-[500px] shrink-0">
              <PriceCard
                data={card}
                live={card.coinGeckoId ? prices[card.coinGeckoId] : undefined}
                loading={loading}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-6 md:gap-8 pt-2 md:pt-4">
        <div>
          <SectionHeader label="Live Update" title="Influence Section" />
          {campaignsLoading ? (
            <div className={cn("relative overflow-hidden rounded-card border border-white/[0.06] shadow-card min-h-[220px]", "flex items-center justify-center")}
              style={{ background: "rgb(var(--bg-card))" }}>
              <p className="text-[13px] text-fg-tertiary">Loading campaigns...</p>
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