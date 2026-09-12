import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Play } from "lucide-react";
import { cn } from "@/lib/cn";
import { getCreatorProfile } from "@/lib/api";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { usePageTitle } from "@/hooks/usePageTitle";
import type { CreatorProfileResponse } from "@/lib/types";

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-card border border-white/[0.06] p-5", className)}
      style={{ background: "rgb(var(--bg-card))" }}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
      {children}
    </div>
  );
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
  tiktok: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.15a8.16 8.16 0 0 0 4.77 1.52V7.22a4.85 4.85 0 0 1-1-.53z"/>
    </svg>
  ),
  twitter: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.9 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
    </svg>
  ),
};

const PLATFORM_LABELS: Record<string, string> = { instagram: "Instagram", tiktok: "TikTok", twitter: "X (Twitter)" };

const SCORE_TABS = [
  { key: "influence",      label: "Influence" },
  { key: "contentQuality", label: "Content Quality" },
  { key: "engagement",     label: "Engagement" },
  { key: "conversion",     label: "Conversion" },
  { key: "reliability",    label: "Reliability" },
] as const;

function ScoreBreakdown({ scorecard }: { scorecard: CreatorProfileResponse["scorecard"] }) {
  const [tab, setTab] = useState<typeof SCORE_TABS[number]["key"]>("influence");

  const valueFor = (key: typeof tab): number | null => {
    if (!scorecard) return null;
    switch (key) {
      case "influence": return scorecard.influence_score;
      case "engagement": return scorecard.engagement_score;
      case "contentQuality": return scorecard.content_quality_score;
      case "reliability": return scorecard.reliability_score;
      case "conversion": return null; // no data source exists anywhere — always locked
    }
  };

  const value = valueFor(tab);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {SCORE_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors",
              tab === t.key ? "bg-brand text-white" : "bg-bg-elevated text-fg-tertiary hover:text-fg-secondary"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "conversion" ? (
        <p className="text-[12px] text-fg-tertiary leading-relaxed">
          Coming soon — conversion tracking (content → real-world action) isn't built yet.
        </p>
      ) : value === null ? (
        <p className="text-[12px] text-fg-tertiary leading-relaxed">Not enough data yet for this category.</p>
      ) : (
        <div>
          <div className="flex items-center justify-between text-[12px] text-fg-tertiary mb-1.5">
            <span>{SCORE_TABS.find((t) => t.key === tab)?.label}</span>
            <span className="text-fg-primary font-medium">{value}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full rounded-full bg-brand" style={{ width: `${value}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreatorProfilePage() {
  const { username } = useParams<{ username: string }>();
  usePageTitle(username ? `Zerra · @${username}` : "Zerra · Creator");

  const [profile, setProfile] = useState<CreatorProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setNotFound(false);
    getCreatorProfile(username)
      .then(setProfile)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  const performanceSeries = useMemo(() => {
    if (!profile) return [];
    const byDate = new Map<string, number>();
    for (const p of profile.recentContent) {
      const key = new Date(p.fetched_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      byDate.set(key, (byDate.get(key) ?? 0) + Number(p.view_count ?? 0));
    }
    return Array.from(byDate.entries()).map(([month, value]) => ({ month, value: Math.round(value / 1000) })).slice(-12);
  }, [profile]);

  if (loading) {
    return <div className="pt-12 text-center text-[13px] text-fg-tertiary">Loading profile...</div>;
  }

  if (notFound || !profile) {
    return (
      <div className="pt-12 text-center">
        <p className="text-[15px] font-medium text-fg-primary mb-1">Creator not found</p>
        <p className="text-[13px] text-fg-tertiary">No creator with that username exists.</p>
      </div>
    );
  }

  const { creator, socialAccounts, scorecard, recentContent, highlights } = profile;
  const totalFollowers = socialAccounts.reduce((s, a) => s + (a.follower_count ?? 0), 0);
  const avgEngagement = recentContent.length > 0
    ? (recentContent.reduce((s, p) => s + Number(p.engagement_rate || 0), 0) / recentContent.length).toFixed(1)
    : "0";

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-bg-elevated border border-white/10 grid place-items-center overflow-hidden shrink-0">
            {creator.avatar
              ? <img src={creator.avatar} alt={creator.name ?? ""} className="w-full h-full object-cover" />
              : <span className="text-[26px] font-semibold text-white">{(creator.name ?? "?").charAt(0).toUpperCase()}</span>}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <p className="text-[15px] text-fg-tertiary">@{creator.username}</p>
              {/* Follow/Message — shown per the reference design, not a real
                  feature yet (no follow-relationship or messaging system
                  exists anywhere in the app). */}
              <div className="flex gap-2 ml-auto">
                <button disabled className="px-4 py-1.5 rounded-full text-[12.5px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-muted cursor-not-allowed">Follow</button>
                <button disabled className="px-4 py-1.5 rounded-full text-[12.5px] font-medium bg-brand/40 text-white/60 cursor-not-allowed">Message</button>
              </div>
            </div>
            <h1 className="text-[24px] font-display font-medium text-fg-primary">{creator.name}</h1>
            {creator.bio && <p className="text-[13px] text-fg-tertiary mt-1.5 max-w-xl">{creator.bio}</p>}
            <div className="flex flex-wrap gap-3 mt-1.5 text-[12px] text-fg-muted">
              {creator.niche && <span>{creator.niche}</span>}
              {creator.location && <span>· {creator.location}</span>}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 max-w-lg">
              <div><p className="text-[18px] font-display font-medium text-fg-primary tabular-nums">{fmt(totalFollowers)}</p><p className="text-[11px] text-fg-tertiary">Total Followers</p></div>
              <div><p className="text-[18px] font-display font-medium text-fg-primary tabular-nums">{fmt(recentContent.reduce((s, p) => s + Number(p.view_count || 0), 0))}</p><p className="text-[11px] text-fg-tertiary">Recent Impressions</p></div>
              <div><p className="text-[18px] font-display font-medium text-fg-primary tabular-nums">{avgEngagement}%</p><p className="text-[11px] text-fg-tertiary">Engagement Rate</p></div>
            </div>

            <div className="flex flex-wrap gap-2.5 mt-4">
              {socialAccounts.map((a) => (
                <div key={a.platform} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bg-elevated border border-white/[0.06]">
                  <span className="text-fg-secondary">{PLATFORM_ICONS[a.platform]}</span>
                  <span className="text-[12px] text-fg-primary tabular-nums">{fmt(a.follower_count ?? 0)}</span>
                  <span className="text-[10.5px] text-fg-muted">Followers</span>
                </div>
              ))}
              {/* YouTube — visible per the reference design, not a real
                  integration yet */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bg-elevated border border-white/[0.06] opacity-40 cursor-not-allowed">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12Z"/></svg>
                <span className="text-[10.5px] text-fg-muted">Coming soon</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Main content */}
        <div className="space-y-6">
          <Card>
            <p className="text-[13.5px] font-medium text-fg-primary mb-4">Your Performance</p>
            {performanceSeries.length > 1 ? (
              <div className="h-[220px]"><PerformanceChart data={performanceSeries} unit="views" /></div>
            ) : (
              <p className="text-[12.5px] text-fg-tertiary py-8 text-center">Not enough synced content yet to chart performance.</p>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13.5px] font-medium text-fg-primary">Recent Content</p>
              <Link to="/dashboard?tab=analytics" className="text-[11.5px] text-fg-tertiary hover:text-fg-secondary">View All</Link>
            </div>
            {recentContent.length === 0 ? (
              <p className="text-[13px] text-fg-tertiary">No content synced yet.</p>
            ) : (
              <div className="flex flex-col">
                {recentContent.map((p, i) => (
                  <div key={p.post_id} className={cn("flex items-center gap-3 py-3", i !== recentContent.length - 1 && "border-b border-white/[0.04]")}>
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-bg-elevated border border-white/[0.06] flex items-center justify-center shrink-0">
                      {p.cover_image_url
                        ? <img src={p.cover_image_url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        : <Play className="w-3.5 h-3.5 text-fg-muted" fill="currentColor" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium text-fg-primary truncate">{p.title || "Untitled post"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[12.5px] font-medium text-fg-primary tabular-nums">{fmt(Number(p.view_count))}</p>
                      <p className="text-[10.5px] text-fg-muted mt-0.5">{p.engagement_rate}% engagement</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            {scorecard ? (
              <>
                {scorecard.niche_percentile != null && creator.niche && (
                  <p className="text-[12px] text-brand font-medium mb-3">
                    Top {Math.max(1, 100 - scorecard.niche_percentile)}% in {creator.niche}
                  </p>
                )}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] text-fg-tertiary">Creator Score</span>
                  <span className="text-[14px] font-medium text-fg-primary">{scorecard.overall_score}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-5">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${scorecard.overall_score}%` }} />
                </div>
                <ScoreBreakdown scorecard={scorecard} />
              </>
            ) : (
              <p className="text-[12.5px] text-fg-tertiary">
                No Creator Score yet — connect a social account to get rated.
              </p>
            )}
          </Card>

          <Card>
            <p className="text-[13px] font-medium text-fg-primary mb-4">Creator Highlights</p>
            <div className="space-y-3 text-[12px]">
              <div>
                <p className="text-fg-tertiary">Most Engaging Content</p>
                <p className="text-fg-primary mt-0.5">
                  {highlights.mostEngagingContent
                    ? `${highlights.mostEngagingContent.title || "Untitled"} · ${highlights.mostEngagingContent.engagementRate}% ER`
                    : "Not enough data yet"}
                </p>
              </div>
              <div>
                <p className="text-fg-tertiary">Top Performing Platform</p>
                <p className="text-fg-primary mt-0.5">{highlights.topPerformingPlatform ? PLATFORM_LABELS[highlights.topPerformingPlatform] ?? highlights.topPerformingPlatform : "Not enough data yet"}</p>
              </div>
              <div>
                <p className="text-fg-tertiary">Recent Campaigns</p>
                <p className="text-fg-primary mt-0.5">
                  {highlights.recentCampaigns.count} completed · ${highlights.recentCampaigns.totalEarnedUsdc.toLocaleString()} earned
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <p className="text-[13px] font-medium text-fg-primary mb-4">Verified Platforms</p>
            <div className="space-y-2.5">
              {["instagram", "tiktok", "twitter"].map((platform) => {
                const connected = socialAccounts.find((a) => a.platform === platform);
                return (
                  <div key={platform} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-fg-secondary">
                      {PLATFORM_ICONS[platform]}
                      <span className="text-[12.5px] text-fg-primary">{PLATFORM_LABELS[platform]}</span>
                    </div>
                    {connected
                      ? <span className="text-[11px] text-success">Connected</span>
                      : <span className="text-[11px] text-fg-muted">Not connected</span>}
                  </div>
                );
              })}
              <div className="flex items-center justify-between opacity-40">
                <div className="flex items-center gap-2 text-fg-secondary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12Z"/></svg>
                  <span className="text-[12.5px] text-fg-primary">YouTube</span>
                </div>
                <span className="text-[11px] text-fg-muted">Coming soon</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
