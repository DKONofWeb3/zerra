import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Play } from "lucide-react";
import { cn } from "@/lib/cn";
import { getCreatorProfile, getMe } from "@/lib/api";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { useBadges } from "@/hooks/useBadges";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { usePageTitle } from "@/hooks/usePageTitle";
import type { CreatorProfileResponse } from "@/lib/types";

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const ICONS = {
  verify: "/creator-profile/verify-badge.svg",
  location: "/creator-profile/location-icon.svg",
  ranking: "/creator-profile/ranking-icon.svg",
  arrowRight: "/creator-profile/arrow-right.svg",
  instagram: "/creator-profile/instagram-fill.svg",
  youtube: "/creator-profile/youtube-icon.svg",
  tiktok: "/creator-profile/tiktok-icon.svg",
  twitter: "/creator-profile/twitter-x.svg",
} as const;

// Real per-platform card treatment, confirmed via Figma design context
// (node 394:776): a brand-colored radial glow fading to near-black, with a
// matching border color. Approximated from the design's exact SVG gradients.
const PLATFORM_STYLE: Record<string, { border: string; bg: string; icon: string }> = {
  instagram: { border: "rgba(203,58,173,0.35)", bg: "radial-gradient(120% 120% at 15% 15%, rgba(203,58,173,0.35) 0%, rgba(8,10,16,0.9) 60%)", icon: ICONS.instagram },
  youtube:   { border: "#ff0b0b", bg: "radial-gradient(120% 120% at 15% 15%, rgba(255,18,18,0.35) 0%, rgba(8,10,16,0.9) 60%)", icon: ICONS.youtube },
  tiktok:    { border: "#0bfdf5", bg: "radial-gradient(120% 120% at 15% 15%, rgba(7,249,241,0.28) 0%, rgba(8,10,16,0.9) 60%)", icon: ICONS.tiktok },
  twitter:   { border: "#acacac", bg: "radial-gradient(120% 120% at 15% 15%, rgba(255,255,255,0.22) 0%, rgba(8,10,16,0.9) 60%)", icon: ICONS.twitter },
};

const PLATFORM_LABELS: Record<string, string> = { instagram: "Instagram", tiktok: "TikTok", twitter: "X (Twitter)", youtube: "YouTube" };

function Card({ className, style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-card border border-white/[0.06] p-5", className)}
      style={{ background: "rgb(var(--bg-card))", ...style }}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
      {children}
    </div>
  );
}

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
      // The reference design shows a number here, but no conversion-tracking
      // infrastructure exists anywhere in this app (no click-through /
      // real-world-action attribution). Showing a number would be fabricated
      // data, so this stays locked regardless of what the mock shows.
      case "conversion": return null;
    }
  };

  const value = valueFor(tab);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {SCORE_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors",
              tab === t.key ? "bg-brand text-white" : "bg-white/[0.04] text-fg-tertiary hover:text-fg-secondary"
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
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-fg-tertiary">{SCORE_TABS.find((t) => t.key === tab)?.label}</span>
          <span className="text-fg-primary font-medium">{value}</span>
        </div>
      )}
    </div>
  );
}

interface CreatorProfilePageProps {
  /** Renders the logged-in user's own profile instead of reading :username
   *  from the route — used to embed this as the Dashboard's Overview tab. */
  ownProfile?: boolean;
}

export default function CreatorProfilePage({ ownProfile = false }: CreatorProfilePageProps) {
  const { username: routeUsername } = useParams<{ username: string }>();
  const [ownUsername, setOwnUsername] = useState<string | null>(null);
  const username = ownProfile ? ownUsername : routeUsername;

  const { accounts: socialAccountsRaw } = useSocialAccounts();
  const tiktokFollowerCount = socialAccountsRaw.find((a) => a.platform === "tiktok")?.follower_count ?? null;
  const { badges } = useBadges(tiktokFollowerCount);
  const isVerified = ownProfile && badges.some((b) => b.id === "verified-influencer" && b.attained);

  usePageTitle(username ? `Zerra · @${username}` : ownProfile ? "Zerra · Overview" : "Zerra · Creator");

  const [profile, setProfile] = useState<CreatorProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  // Distinct from notFound: the account itself loaded fine, it just has no
  // username set yet — a real, expected state for older accounts, not an
  // error to hang on indefinitely.
  const [noUsername, setNoUsername] = useState(false);

  useEffect(() => {
    if (!ownProfile) return;
    getMe()
      .then((d) => {
        const u = d.user?.username ?? null;
        setOwnUsername(u);
        if (!u) { setNoUsername(true); setLoading(false); }
      })
      .catch(() => { setOwnUsername(null); setNoUsername(true); setLoading(false); });
  }, [ownProfile]);

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

  if (loading || (ownProfile && !username && !noUsername)) {
    return <div className="pt-12 text-center text-[13px] text-fg-tertiary">Loading profile...</div>;
  }

  if (ownProfile && noUsername) {
    return (
      <div className="pt-12 text-center">
        <p className="text-[15px] font-medium text-fg-primary mb-1">Set a username to see your profile</p>
        <p className="text-[13px] text-fg-tertiary mb-4">Your profile overview needs a username first.</p>
        <Link to="/settings" className="inline-block px-4 py-2 rounded-full text-[13px] font-medium bg-brand text-white hover:opacity-90 transition-opacity">
          Go to Settings
        </Link>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="pt-12 text-center">
        <p className="text-[15px] font-medium text-fg-primary mb-1">{ownProfile ? "Couldn't load your profile" : "Creator not found"}</p>
        <p className="text-[13px] text-fg-tertiary">{ownProfile ? "Try refreshing the page." : "No creator with that username exists."}</p>
      </div>
    );
  }

  const { creator, socialAccounts, scorecard, recentContent, highlights } = profile;
  const totalFollowers = socialAccounts.reduce((s, a) => s + (a.follower_count ?? 0), 0);
  const recentImpressions = recentContent.reduce((s, p) => s + Number(p.view_count || 0), 0);
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
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-[20px] font-display font-medium text-fg-primary">{creator.name}</h1>
              {isVerified && <img src={ICONS.verify} alt="Verified" className="w-5 h-5" />}
              <div className="flex gap-2 ml-auto">
                {ownProfile ? (
                  <Link to="/settings" className="px-4 py-1.5 rounded-full text-[12.5px] font-medium border border-white/[0.15] text-fg-secondary hover:text-fg-primary hover:border-white/25 transition-colors">
                    Edit Profile
                  </Link>
                ) : (
                  // Follow/Message — shown per the reference design, not a real
                  // feature yet (no follow-relationship or messaging system
                  // exists anywhere in the app).
                  <>
                    <button disabled className="px-4 py-1.5 rounded-full text-[12.5px] font-medium border border-white/[0.15] text-fg-muted cursor-not-allowed">Follow</button>
                    <button disabled className="px-4 py-1.5 rounded-full text-[12.5px] font-medium bg-brand/40 text-white/60 cursor-not-allowed">Message</button>
                  </>
                )}
              </div>
            </div>
            <p className="text-[14px] text-fg-tertiary">@{creator.username}</p>
            {creator.bio && <p className="text-[13px] text-fg-tertiary mt-1.5 max-w-xl">{creator.bio}</p>}
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[12px] text-fg-muted">
              {creator.niche && <span>{creator.niche}</span>}
              {creator.location && (
                <span className="flex items-center gap-1">
                  <img src={ICONS.location} alt="" className="w-3.5 h-3.5 opacity-70" />
                  {creator.location}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 max-w-lg">
              <div><p className="text-[18px] font-display font-medium text-fg-primary tabular-nums">{fmt(totalFollowers)}</p><p className="text-[11px] text-fg-tertiary">Total Followers</p></div>
              <div><p className="text-[18px] font-display font-medium text-fg-primary tabular-nums">{fmt(recentImpressions)}</p><p className="text-[11px] text-fg-tertiary">Recent Impressions</p></div>
              <div><p className="text-[18px] font-display font-medium text-fg-primary tabular-nums">{avgEngagement}%</p><p className="text-[11px] text-fg-tertiary">Engagement Rate</p></div>
            </div>

            <div className="flex flex-wrap gap-2.5 mt-4">
              {socialAccounts.map((a) => {
                const s = PLATFORM_STYLE[a.platform];
                return (
                  <div key={a.platform} className="flex items-center gap-2.5 px-3 py-2 rounded-xl border" style={{ background: s?.bg, borderColor: s?.border ?? "rgb(255 255 255 / 0.08)" }}>
                    {s && <img src={s.icon} alt="" className="w-5 h-5" />}
                    <div>
                      <p className="text-[13px] font-semibold text-fg-primary tabular-nums leading-tight">{fmt(a.follower_count ?? 0)}</p>
                      <p className="text-[10px] text-fg-muted leading-tight">Total Followers</p>
                    </div>
                  </div>
                );
              })}
              {/* YouTube — visible per the reference design, not a real
                  integration yet */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] opacity-40 cursor-not-allowed">
                <img src={ICONS.youtube} alt="" className="w-5 h-5" />
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
          {/* Creator Score — real gradient confirmed via Figma design context. */}
          <Card style={{ background: "linear-gradient(180deg, #070c18 27%, #253f7e 142%)" }}>
            {scorecard ? (
              <>
                {scorecard.niche_percentile != null && creator.niche && (
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#22426b" }}>
                        <img src={ICONS.ranking} alt="" className="w-4 h-4" />
                      </span>
                      <div>
                        <p className="text-[13px] font-medium text-fg-primary leading-tight">Top {Math.max(1, 100 - scorecard.niche_percentile)}%</p>
                        <p className="text-[11px] text-fg-tertiary leading-tight">in {creator.niche}</p>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-[12px] text-fg-tertiary mb-1">Creator Score</p>
                <div className="flex items-end gap-1.5 mb-3">
                  <span
                    className="text-[26px] font-semibold leading-none"
                    style={{ backgroundImage: "linear-gradient(125deg, #fff 26%, #999 98%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
                  >
                    {scorecard.overall_score}%
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: "#111e3b" }}>
                  <div className="h-full rounded-full" style={{ width: `${scorecard.overall_score}%`, background: "linear-gradient(90deg, #305e99, #509dff)" }} />
                </div>
                <div className="border-t border-white/[0.06] pt-3">
                  <ScoreBreakdown scorecard={scorecard} />
                </div>
              </>
            ) : (
              <p className="text-[12.5px] text-fg-tertiary">
                No Creator Score yet — connect a social account to get rated.
              </p>
            )}
          </Card>

          {/* Creator Highlights — real gradient confirmed via Figma design context. */}
          <Card style={{ background: "linear-gradient(180deg, #253f7e 65%, #070c18 84%)" }}>
            <p className="text-[15px] font-medium text-fg-primary mb-4">Creator Highlights</p>
            <div className="space-y-3.5 text-[12px]">
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
              {/* "Best Performing Niche" from the reference design — shown
                  using the creator's own declared niche paired with their
                  real best-engagement figure, since there's no per-post
                  niche-ranking data to compute a real leaderboard from. */}
              {creator.niche && highlights.mostEngagingContent && (
                <div>
                  <p className="text-fg-tertiary">Best Performing Niche</p>
                  <p className="text-fg-primary mt-0.5">{creator.niche} · {highlights.mostEngagingContent.engagementRate}% ER</p>
                </div>
              )}
              <div>
                <p className="text-fg-tertiary">Recent Campaigns</p>
                <p className="text-fg-primary mt-0.5">
                  {highlights.recentCampaigns.count} completed · ${highlights.recentCampaigns.totalEarnedUsdc.toLocaleString()} earned
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <p className="text-[15px] font-medium text-fg-primary mb-4">Verified Platforms</p>
            <div className="space-y-3">
              {["instagram", "tiktok", "twitter"].map((platform) => {
                const connected = socialAccounts.find((a) => a.platform === platform);
                const s = PLATFORM_STYLE[platform];
                return (
                  <div key={platform} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {s && <img src={s.icon} alt="" className="w-6 h-6" />}
                      <div>
                        <p className="text-[13px] text-fg-primary leading-tight">{PLATFORM_LABELS[platform]}</p>
                        {connected?.username && <p className="text-[11px] text-fg-tertiary leading-tight">@{connected.username}</p>}
                      </div>
                    </div>
                    {connected
                      ? <span className="text-[11px] text-success">Connected</span>
                      : <span className="text-[11px] text-fg-muted">Not connected</span>}
                  </div>
                );
              })}
              <div className="flex items-center justify-between opacity-40">
                <div className="flex items-center gap-2.5">
                  <img src={ICONS.youtube} alt="" className="w-6 h-6" />
                  <span className="text-[13px] text-fg-primary">YouTube</span>
                </div>
                <span className="text-[11px] text-fg-muted">Coming soon</span>
              </div>
            </div>

            {ownProfile && creator.username && (
              <Link
                to={`/creator/${creator.username}`}
                className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-[13px] font-medium text-white bg-black hover:bg-white/10 transition-colors"
              >
                View Full Profile
                <img src={ICONS.arrowRight} alt="" className="w-4 h-4" />
              </Link>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
