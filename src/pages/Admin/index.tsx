import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { apiGet } from "@/lib/api/client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "react-router-dom";

interface Metrics {
  totalUsers: number;
  totalCreators: number;
  activeCampaigns: number;
  totalVideosAnalyzed: number;
  avgAuthenticityScore: number;
  eligibleVideos: number;
  quarantinedVideos: number;
  failedVerifications: number;
  verificationPassRate: number;
}

function MetricCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: "success" | "danger" | "warning" }) {
  const accentColors: Record<string, string> = {
    success: "rgb(var(--success))",
    danger: "rgb(var(--danger))",
    warning: "rgb(var(--warning))",
  };
  const accentColor = accent ? accentColors[accent] : undefined;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-4 md:p-5"
      style={{ background: "rgb(var(--bg-card))" }}>
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
      <p className="text-[11px] md:text-[12px] text-fg-tertiary">{label}</p>
      <p className={cn("mt-1.5 font-display font-medium leading-none text-[26px] md:text-[32px]",
        accent ? "" : "text-gradient")}
        style={accentColor ? { color: accentColor } : undefined}>
        {value}
      </p>
      {sub && <p className="mt-1 text-[11px] text-fg-muted">{sub}</p>}
    </div>
  );
}

export default function AdminOverviewPage() {
  usePageTitle("Zerra Admin · Overview");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ metrics: Metrics }>("/admin/metrics")
      .then((d) => setMetrics(d.metrics))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-12 space-y-6 md:space-y-8">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">Platform-wide overview</span>
        </div>
        <h2 className={cn(
          "mt-4 font-display font-medium tracking-[-0.03em]",
          "text-[36px] md:text-[56px] leading-[0.95]",
          "bg-clip-text text-transparent",
          "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
        )}>
          Admin Overview
        </h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {[1,2,3,4,5,6,7,8].map((i) => (
            <div key={i} className="h-[100px] md:h-[120px] rounded-2xl border border-white/[0.06] animate-pulse" style={{ background: "rgb(var(--bg-card))" }} />
          ))}
        </div>
      ) : metrics ? (
        <>
          {/* Platform stats */}
          <div>
            <p className="text-[13px] font-semibold text-fg-primary mb-3">Platform</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              <MetricCard label="Total Users" value={metrics.totalUsers} />
              <MetricCard label="Creators" value={metrics.totalCreators} />
              <MetricCard label="Active Campaigns" value={metrics.activeCampaigns} />
              <MetricCard label="Videos Analyzed" value={metrics.totalVideosAnalyzed} />
            </div>
          </div>

          {/* AI Verification stats */}
          <div>
            <p className="text-[13px] font-semibold text-fg-primary mb-3">AI Verification</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              <MetricCard
                label="Avg Authenticity"
                value={`${metrics.avgAuthenticityScore}%`}
                accent={metrics.avgAuthenticityScore >= 60 ? "success" : "warning"}
              />
              <MetricCard
                label="Pass Rate"
                value={`${metrics.verificationPassRate}%`}
                sub={`${metrics.eligibleVideos} eligible`}
                accent={metrics.verificationPassRate >= 50 ? "success" : "warning"}
              />
              <MetricCard
                label="Quarantined"
                value={metrics.quarantinedVideos}
                sub="Suspicious engagement"
                accent={metrics.quarantinedVideos > 0 ? "danger" : undefined}
              />
              <MetricCard
                label="Failed"
                value={metrics.failedVerifications}
                sub="AI analysis errors"
                accent={metrics.failedVerifications > 0 ? "warning" : undefined}
              />
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <p className="text-[13px] font-semibold text-fg-primary mb-3">Quick actions</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link to="/admin/campaigns/new"
                className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-4 hover:border-white/[0.12] transition-colors"
                style={{ background: "rgb(var(--bg-card))" }}>
                <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
                <p className="text-[13.5px] font-semibold text-fg-primary">+ New Campaign</p>
                <p className="text-[12px] text-fg-tertiary mt-1">Create a campaign for a project</p>
              </Link>
              <Link to="/admin/users?status=restricted"
                className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-4 hover:border-white/[0.12] transition-colors"
                style={{ background: "rgb(var(--bg-card))" }}>
                <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
                <p className="text-[13.5px] font-semibold text-fg-primary">Review Restricted</p>
                <p className="text-[12px] text-fg-tertiary mt-1">Users flagged for review</p>
              </Link>
              <Link to="/admin/trending"
                className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-4 hover:border-white/[0.12] transition-colors"
                style={{ background: "rgb(var(--bg-card))" }}>
                <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
                <p className="text-[13.5px] font-semibold text-fg-primary">View Trending</p>
                <p className="text-[12px] text-fg-tertiary mt-1">Top verified content right now</p>
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] p-8 text-center" style={{ background: "rgb(var(--bg-card))" }}>
          <p className="text-[14px] text-fg-tertiary">Could not load metrics.</p>
        </div>
      )}
    </div>
  );
}