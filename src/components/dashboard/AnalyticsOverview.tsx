import { useEffect, useMemo, useState } from "react";
import { Eye, Sparkles, Play, ChevronRight, ChevronDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";
import { apiGet } from "@/lib/api/client";
import { syncTikTok, getAnalyticsInsights } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { LockedCard } from "@/components/dashboard/LockedCard";
import type { TikTokAnalytics, TikTokPost, AnalyticsInsights } from "@/lib/types";

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

/** A label/value row for the Performance card — "—" whenever the value isn't real yet. */
function StatRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <span className="text-[13px] text-fg-tertiary">{label}</span>
      <span className="text-[13px] font-medium text-fg-primary">{value ?? "—"}</span>
    </div>
  );
}

/** Builds a "views over time" series, keyed by created_time where available (falls back to fetched_at). */
function buildPerformanceSeries(posts: TikTokPost[]) {
  if (!posts.length) return [];
  const byDate = new Map<string, number>();
  for (const p of posts) {
    const date = new Date(p.created_time ?? p.fetched_at);
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
  const [insights, setInsights] = useState<AnalyticsInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = () => {
    if (!session) { setLoading(false); return; }
    setLoading(true);
    apiGet<{ analytics: TikTokAnalytics | null; message?: string }>("/analytics/tiktok")
      .then((d) => {
        setAnalytics(d.analytics ?? null);
        setError(d.analytics ? null : d.message ?? null);
      })
      .catch((e) => setError(e.message ?? "Failed to load analytics"))
      .finally(() => setLoading(false));

    getAnalyticsInsights().then(setInsights).catch(() => setInsights(null));
  };

  useEffect(fetchAnalytics, [session]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncTikTok();
      fetchAnalytics();
    } catch (e: any) {
      setError(e.message ?? "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const summary = analytics?.summary ?? null;
  const posts = analytics?.posts ?? [];
  const hasData = !loading && Boolean(summary && summary.total_posts > 0);

  const performanceSeries = useMemo(() => buildPerformanceSeries(posts), [posts]);

  const topPosts = useMemo(
    () => [...posts].sort((a, b) => Number(b.view_count) - Number(a.view_count)).slice(0, 5),
    [posts]
  );

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-medium text-[26px] md:text-[32px] text-fg-primary tracking-[-0.02em]">
            Analytics
          </h2>
          <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-fg-tertiary">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            Track your TikTok performance in real-time.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-medium text-fg-secondary border border-white/[0.08] bg-bg-elevated hover:bg-white/[0.06] disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", syncing && "animate-spin")} />
          {syncing ? "Syncing..." : "Sync"}
        </button>
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
          <button
            onClick={handleSync}
            disabled={syncing}
            className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold text-white disabled:opacity-50 transition-opacity"
            style={{ background: "rgb(74 125 255)" }}
          >
            <RefreshCw className={cn("w-3.5 h-3.5", syncing && "animate-spin")} />
            {syncing ? "Syncing..." : "Sync Now"}
          </button>
        </Card>
      ) : (
        <>
          {/* Your Performance + Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-fg-tertiary">Your Performance</p>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11.5px] text-fg-secondary border border-white/[0.08] bg-black/20">
                  Last 30 days <ChevronDown className="w-3 h-3" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-display font-medium text-[30px] md:text-[36px] text-fg-primary tabular-nums">
                  {fmt(summary!.total_views)}
                </span>
              </div>
              <p className="text-[12px] text-fg-tertiary mt-0.5">Total Impressions</p>
              {performanceSeries.length > 1 ? (
                <div className="h-[160px] md:h-[190px] mt-3">
                  <PerformanceChart data={performanceSeries} />
                </div>
              ) : (
                <div className="h-[160px] md:h-[190px] mt-3 flex items-center justify-center">
                  <p className="text-[12.5px] text-fg-tertiary">Sync more than once to see a trend.</p>
                </div>
              )}
            </Card>

            <Card>
              <p className="text-[13.5px] font-medium text-fg-primary mb-1">Performance</p>
              <div className="mt-3">
                <StatRow label="Best Platform" value={insights?.bestPlatform ?? null} />
                <StatRow label="Best Content" value={null} />
                <StatRow label="Best Format" value={insights?.bestFormat ?? null} />
                <StatRow label="Best Time" value={insights?.bestTime ?? null} />
              </div>
            </Card>
          </div>

          {/* Zerra Insight */}
          {insights?.performanceInsight ? (
            <div className="relative overflow-hidden rounded-card p-5 md:p-6"
              style={{ background: "linear-gradient(135deg, rgb(15 21 46) 0%, rgb(8 12 28) 100%)" }}>
              <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
              <div className="flex items-center gap-1.5 text-brand">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[12px] font-medium">Zerra Insight</span>
              </div>
              <p className="mt-2 text-[16px] md:text-[18px] font-medium text-fg-primary leading-snug max-w-2xl">
                {insights.performanceInsight.headline}
              </p>
              <p className="mt-3 text-[11.5px] text-fg-muted">Recommendation:</p>
              <p className="text-[12.5px] text-fg-secondary">{insights.performanceInsight.recommendation}</p>
            </div>
          ) : (
            <LockedCard title="Zerra Insight" note="Still analyzing your content — check back after a few more posts." />
          )}

          {/* Where Your Influence Fit + Top Performing content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {insights?.influenceFit ? (
              <Card>
                <p className="text-[15px] font-medium text-fg-primary">Where Your Influence Fit</p>
                <p className="text-[12px] text-fg-tertiary mt-1 mb-4">
                  A campaign matching your best-performing content, based on your real engagement.
                </p>
                <div className="rounded-xl overflow-hidden border border-white/[0.06]">
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-white/[0.04] text-[11px] text-fg-muted">
                    <span>Potential Fit</span>
                    <span>Why</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-3.5 py-3">
                    <span className="text-[12.5px] font-medium text-fg-primary shrink-0">{insights.influenceFit.campaignName}</span>
                    <span className="text-[11.5px] text-fg-tertiary text-right">{insights.influenceFit.why}</span>
                  </div>
                </div>
                <a href="/explore"
                  className="mt-4 block text-center px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white"
                  style={{ background: "rgb(74 125 255)" }}>
                  Explore potential matches
                </a>
              </Card>
            ) : (
              <LockedCard title="Where Your Influence Fit" note="Still finding your best-fit campaigns — check back after a few more posts." />
            )}

            <Card>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13.5px] font-medium text-fg-primary">Top Performing content</p>
                <ViewAllLink label="View all" />
              </div>
              {topPosts.length === 0 ? (
                <p className="text-[13px] text-fg-tertiary">No posts found.</p>
              ) : (
                <div className="flex flex-col">
                  <div className="flex items-center justify-between text-[11px] text-fg-muted pb-2 border-b border-white/[0.04]">
                    <span>Content</span>
                    <span>Impressions</span>
                  </div>
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
                        <p className="text-[11px] text-fg-tertiary mt-0.5">TikTok</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[12.5px] font-medium text-fg-primary tabular-nums">{fmt(Number(p.view_count))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
