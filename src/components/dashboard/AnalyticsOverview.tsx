import { useEffect, useMemo, useState } from "react";
import { Eye, Heart, MessageCircle, Share2, Sparkles, Play, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { apiGet } from "@/lib/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { LockedCard } from "@/components/dashboard/LockedCard";
import type { TikTokAnalytics, TikTokPost } from "@/lib/types";

const TABS = ["Overview", "Audience", "Content", "Engagement", "Earnings", "Campaigns", "Comparison"] as const;

function fmt(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-card border border-white/[0.06] p-4 md:p-5", className)}
      style={{ background: "rgb(var(--bg-card))" }}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
      {children}
    </div>
  );
}

function ViewAllLink({ label = "View full report", onClick }: { label?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-[11.5px] text-fg-tertiary hover:text-fg-secondary transition-colors">
      {label}
      <ChevronRight className="w-3 h-3" />
    </button>
  );
}

/** Build a simple "views over time" series by bucketing posts by sync date. */
function buildPerformanceSeries(posts: TikTokPost[]) {
  if (!posts.length) return [];
  const byDate = new Map<string, number>();
  for (const p of posts) {
    const date = new Date(p.fetched_at);
    const key = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    byDate.set(key, (byDate.get(key) ?? 0) + Number(p.view_count ?? 0));
  }
  return Array.from(byDate.entries())
    .map(([month, value]) => ({ month, value: Math.round(value / 1000) })) // in thousands, to match chart's "$Nk"-style axis
    .slice(-12);
}

export function AnalyticsOverview() {
  const { session } = useAuth();
  const [tab, setTab] = useState<typeof TABS[number]>("Overview");
  const [analytics, setAnalytics] = useState<TikTokAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) { setLoading(false); return; }
    apiGet<{ analytics: TikTokAnalytics | null; message?: string }>("/analytics/tiktok")
      .then((d) => {
        setAnalytics(d.analytics ?? null);
        if (!d.analytics) setError(d.message ?? null);
      })
      .catch((e) => setError(e.message ?? "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [session]);

  const summary = analytics?.summary ?? null;
  const posts = analytics?.posts ?? [];
  const hasData = !loading && Boolean(summary && summary.total_posts > 0);

  const performanceSeries = useMemo(() => buildPerformanceSeries(posts), [posts]);

  const topPosts = useMemo(
    () => [...posts].sort((a, b) => Number(b.view_count) - Number(a.view_count)).slice(0, 5),
    [posts]
  );

  const statCards = summary
    ? [
        { key: "views",       label: "Total Views",     value: fmt(summary.total_views),    icon: Eye },
        { key: "engagement",  label: "Avg Engagement",   value: `${summary.avg_engagement_rate}%`, icon: Heart },
        { key: "comments",    label: "Total Comments",   value: fmt(summary.total_comments), icon: MessageCircle },
        { key: "shares",      label: "Total Shares",     value: fmt(summary.total_shares),   icon: Share2 },
      ]
    : [];

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display font-medium text-[26px] md:text-[32px] text-fg-primary tracking-[-0.02em]">
          Analytics
        </h2>
        <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-fg-tertiary">
          <Sparkles className="w-3.5 h-3.5 text-brand" />
          Track your TikTok performance in real-time.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-5 md:gap-6 overflow-x-auto pb-1 -mx-1 px-1 marquee-mask">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 text-[13.5px] font-medium pb-2 border-b-2 transition-colors whitespace-nowrap",
              tab === t ? "text-fg-primary border-brand" : "text-fg-muted border-transparent hover:text-fg-secondary"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab !== "Overview" ? (
        <Card className="min-h-[240px] flex items-center justify-center">
          <p className="text-[13px] text-fg-tertiary">{tab} view coming soon.</p>
        </Card>
      ) : loading ? (
        <Card className="min-h-[280px] flex items-center justify-center">
          <p className="text-[13px] text-fg-tertiary">Loading analytics...</p>
        </Card>
      ) : !hasData ? (
        <Card className="min-h-[280px] flex flex-col items-center justify-center gap-3 text-center px-8">
          <div className="w-12 h-12 rounded-2xl border border-white/[0.06] bg-bg-elevated flex items-center justify-center">
            <Eye className="w-5 h-5 text-fg-muted" strokeWidth={1.6} />
          </div>
          <p className="text-[15px] font-medium text-fg-primary">No analytics data yet</p>
          <p className="text-[13px] text-fg-tertiary leading-relaxed max-w-sm">
            {error ?? "Connect your TikTok and sync your posts to see analytics here."}
          </p>
        </Card>
      ) : (
        <>
          {/* Stat cards — real, from summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {statCards.map(({ key, label, value, icon: Icon }) => (
              <Card key={key} className="overflow-hidden">
                <div className="flex items-center gap-1.5 text-fg-tertiary">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[11.5px]">{label}</span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-display font-medium text-[22px] md:text-[26px] text-fg-primary tabular-nums">{value}</span>
                </div>
                <p className="text-[10.5px] text-fg-muted mt-1">{summary!.total_posts} posts synced</p>
              </Card>
            ))}
          </div>

          {/* Performance + Audience (locked) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[13.5px] font-medium text-fg-primary">Performance Over Time</p>
                  <p className="text-[11px] text-fg-muted mt-0.5">Views by sync date (thousands)</p>
                </div>
              </div>
              {performanceSeries.length > 1 ? (
                <div className="h-[220px] md:h-[260px]">
                  <PerformanceChart data={performanceSeries} />
                </div>
              ) : (
                <div className="h-[220px] md:h-[260px] flex items-center justify-center">
                  <p className="text-[12.5px] text-fg-tertiary">Sync more than once to see a trend.</p>
                </div>
              )}
            </Card>

            <LockedCard title="Audience Demographics" note="Coming soon" />
          </div>

          {/* Locked: Traffic Sources + Engagement by Platform / Real: Engagement Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <LockedCard title="Traffic Sources" note="Coming soon" />

            <Card>
              <p className="text-[13.5px] font-medium text-fg-primary mb-4">Engagement Breakdown</p>
              <div className="flex flex-col gap-4">
                {[
                  { label: "Likes",    value: summary!.total_likes,    max: summary!.total_likes },
                  { label: "Comments", value: summary!.total_comments, max: summary!.total_likes || 1 },
                  { label: "Shares",   value: summary!.total_shares,   max: summary!.total_likes || 1 },
                ].map((e) => (
                  <div key={e.label}>
                    <div className="flex items-center justify-between text-[12px] mb-1.5">
                      <span className="text-fg-secondary">{e.label}</span>
                      <span className="text-fg-muted tabular-nums">{fmt(e.value)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(100, (e.value / e.max) * 100)}%`, background: "rgb(74 125 255)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <LockedCard title="Engagement by Platform" note="Coming soon — TikTok only for now" />
          </div>

          {/* Top Performing Content — real */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13.5px] font-medium text-fg-primary">Top Performing Content</p>
              <ViewAllLink label="View all" />
            </div>
            {topPosts.length === 0 ? (
              <p className="text-[13px] text-fg-tertiary">No posts found.</p>
            ) : (
              <div className="flex flex-col">
                {topPosts.map((p, i) => (
                  <div key={p.post_id} className={cn("flex items-center gap-3 py-3", i !== topPosts.length - 1 && "border-b border-white/[0.04]")}>
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-bg-elevated border border-white/[0.06] flex items-center justify-center shrink-0">
                      {p.cover_image_url ? (
                        <img
                          src={p.cover_image_url}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-fg-muted" fill="currentColor" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium text-fg-primary truncate">{p.title || "Untitled post"}</p>
                      <p className="text-[11px] text-fg-tertiary mt-0.5">
                        {new Date(p.fetched_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {p.verification?.final_score != null && ` · ${p.verification.final_score} pts`}
                      </p>
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
        </>
      )}
    </div>
  );
}
