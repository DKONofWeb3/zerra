// src/pages/Project/index.tsx
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { apiGet } from "@/lib/api/client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Campaign {
  id: string;
  project_name: string;
  status: string;
  reward_usdc: number;
  total_budget_usdc: number;
  spent_usdc: number;
  required_hashtags: string[];
}

interface Metrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalParticipants: number;
  totalVideosAnalyzed: number;
  eligibleVideos: number;
  quarantinedVideos: number;
  avgAuthenticityScore: number;
  avgFinalScore: number;
  verificationPassRate: number;
}

const accentColors: Record<string, string> = {
  success: "rgb(var(--success))",
  danger:  "rgb(var(--danger))",
  warning: "rgb(var(--warning))",
};

function MetricCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: "success" | "danger" | "warning";
}) {
  const color = accent ? accentColors[accent] : undefined;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-4 md:p-5"
      style={{ background: "rgb(var(--bg-card))" }}>
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
      <p className="text-[11px] md:text-[12px] text-fg-tertiary">{label}</p>
      <p className={cn("mt-1.5 font-display font-medium leading-none text-[26px] md:text-[30px]",
        !accent && "text-gradient")} style={color ? { color } : undefined}>
        {value}
      </p>
      {sub && <p className="mt-1 text-[11px] text-fg-muted">{sub}</p>}
    </div>
  );
}

const STATUS_STYLE: Record<string, string> = {
  active:    "text-success border-success/30 bg-[rgb(var(--success)/0.08)]",
  paused:    "text-warning border-warning/30 bg-[rgb(var(--warning)/0.08)]",
  draft:     "text-fg-tertiary border-white/[0.08] bg-bg-elevated",
  completed: "text-brand border-brand/30 bg-brand/10",
};

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function ProjectOverviewPage() {
  usePageTitle("Zerra Project · Overview");
  const { session } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [metrics,   setMetrics]   = useState<Metrics | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [name,      setName]      = useState("");

  useEffect(() => {
    if (!session) return;
    setName(session.user.email?.split("@")[0] ?? "Project");
    apiGet<{ campaigns: Campaign[]; metrics: Metrics }>("/project/overview")
      .then((d) => { setCampaigns(d.campaigns ?? []); setMetrics(d.metrics); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <div className="pb-12 space-y-6 md:space-y-8">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">Project dashboard</span>
        </div>
        <h2 className={cn(
          "mt-4 font-display font-medium tracking-[-0.03em] leading-[0.95]",
          "text-[32px] md:text-[52px]",
          "bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-[#7d8aa8]"
        )}>
          Welcome, {name}
        </h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-[100px] rounded-2xl border border-white/[0.06]"
              style={{ background: "rgb(var(--bg-card))" }} />
          ))}
        </div>
      ) : metrics && (
        <>
          <div>
            <p className="text-[13px] font-semibold text-fg-primary mb-3">Campaign Performance</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              <MetricCard label="Participants" value={metrics.totalParticipants} />
              <MetricCard label="Active Campaigns" value={metrics.activeCampaigns} accent={metrics.activeCampaigns > 0 ? "success" : undefined} />
              <MetricCard label="Eligible Videos" value={metrics.eligibleVideos} sub="Passed verification" accent="success" />
              <MetricCard label="Pass Rate" value={`${metrics.verificationPassRate}%`} accent={metrics.verificationPassRate >= 50 ? "success" : "warning"} />
            </div>
          </div>

          <div>
            <p className="text-[13px] font-semibold text-fg-primary mb-3">AI Verification</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              <MetricCard label="Videos Analyzed" value={metrics.totalVideosAnalyzed} />
              <MetricCard label="Avg Authenticity" value={`${metrics.avgAuthenticityScore}%`} accent={metrics.avgAuthenticityScore >= 60 ? "success" : "warning"} />
              <MetricCard label="Avg Score" value={metrics.avgFinalScore} sub="Out of 1000" />
              <MetricCard label="Quarantined" value={metrics.quarantinedVideos} sub="Suspicious engagement" accent={metrics.quarantinedVideos > 0 ? "danger" : undefined} />
            </div>
          </div>
        </>
      )}

      {/* Campaign list */}
      <div>
        <p className="text-[13px] font-semibold text-fg-primary mb-3">Your Campaigns</p>
        {campaigns.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] p-8 text-center" style={{ background: "rgb(var(--bg-card))" }}>
            <p className="text-[14px] text-fg-tertiary">No campaigns yet. Contact your Zerra account manager to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => {
              const pct = c.total_budget_usdc > 0
                ? Math.min(100, Math.round(((c.spent_usdc ?? 0) / c.total_budget_usdc) * 100))
                : 0;
              return (
                <div key={c.id} className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-4 md:p-5"
                  style={{ background: "rgb(var(--bg-card))" }}>
                  <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
                    style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
                  <div className="relative flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-fg-primary truncate">{c.project_name}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {(c.required_hashtags ?? []).slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full border border-brand/25 bg-brand/10 text-brand">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-medium border capitalize", STATUS_STYLE[c.status] ?? STATUS_STYLE.draft)}>
                        {c.status}
                      </span>
                      <Link to={`/project/leaderboard?campaignId=${c.id}`}
                        className="px-3 py-1.5 rounded-lg text-[12px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors">
                        View →
                      </Link>
                    </div>
                  </div>
                  <div className="relative mt-3">
                    <div className="flex justify-between text-[11px] text-fg-tertiary mb-1.5">
                      <span>{fmt(c.spent_usdc ?? 0)} distributed</span>
                      <span>{fmt(c.total_budget_usdc ?? 0)} budget</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}