import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { apiGet } from "@/lib/api/client";
import { usePageTitle } from "@/hooks/usePageTitle";

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

function StatRow({ label, value, note, color }: {
  label: string; value: string | number; note?: string;
  color?: "success" | "danger" | "warning";
}) {
  const colorMap: Record<string, string> = {
    success: "rgb(var(--success))",
    danger: "rgb(var(--danger))",
    warning: "rgb(var(--warning))",
  };
  const c = color ? colorMap[color] : "rgb(var(--fg-primary))";

  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-white/[0.04] last:border-0">
      <div>
        <p className="text-[13.5px] text-fg-primary">{label}</p>
        {note && <p className="text-[11.5px] text-fg-tertiary mt-0.5">{note}</p>}
      </div>
      <p className="text-[20px] font-display font-medium tabular-nums shrink-0" style={{ color: c }}>
        {value}
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-fg-primary mb-3">{title}</p>
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] px-5 py-1"
        style={{ background: "rgb(var(--bg-card))" }}>
        <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

export default function AdminMetricsPage() {
  usePageTitle("Zerra Admin · AI Metrics");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ metrics: Metrics }>("/admin/metrics")
      .then((d) => setMetrics(d.metrics))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="pb-12 space-y-6">
        <div className="pt-2 h-20 rounded-2xl animate-pulse" style={{ background: "rgb(var(--bg-card))" }} />
        {[1,2,3].map((i) => (
          <div key={i} className="h-[200px] rounded-2xl border border-white/[0.06] animate-pulse"
            style={{ background: "rgb(var(--bg-card))" }} />
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="rounded-2xl border border-white/[0.06] p-10 text-center" style={{ background: "rgb(var(--bg-card))" }}>
        <p className="text-[14px] text-fg-tertiary">Could not load metrics.</p>
      </div>
    );
  }

  const ineligibleVideos = metrics.totalVideosAnalyzed - metrics.eligibleVideos
    - metrics.quarantinedVideos - metrics.failedVerifications;

  return (
    <div className="pb-12 space-y-6 md:space-y-8">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">AI Verification Engine</span>
        </div>
        <h2 className={cn(
          "mt-4 font-display font-medium tracking-[-0.03em] leading-[0.95]",
          "text-[36px] md:text-[56px]",
          "bg-clip-text text-transparent",
          "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
        )}>
          AI Metrics
        </h2>
      </div>

      <Section title="Verification volume">
        <StatRow label="Total videos analyzed" value={metrics.totalVideosAnalyzed} note="All-time across all campaigns" />
        <StatRow label="Leaderboard eligible" value={metrics.eligibleVideos} note="Passed all checks. Keyword + authenticity" color="success" />
        <StatRow label="Ineligible" value={ineligibleVideos > 0 ? ineligibleVideos : 0} note="Failed keyword or authenticity threshold" />
        <StatRow label="Quarantined" value={metrics.quarantinedVideos} note="Suspicious engagement ratios. Held for review" color={metrics.quarantinedVideos > 0 ? "warning" : undefined} />
        <StatRow label="Failed (system error)" value={metrics.failedVerifications} note="AI analysis errors after retry" color={metrics.failedVerifications > 0 ? "danger" : undefined} />
      </Section>

      <Section title="Quality signals">
        <StatRow
          label="Avg authenticity score"
          value={`${metrics.avgAuthenticityScore}%`}
          note="Average Claude authenticity score across eligible videos"
          color={metrics.avgAuthenticityScore >= 70 ? "success" : metrics.avgAuthenticityScore >= 50 ? "warning" : "danger"}
        />
        <StatRow
          label="Verification pass rate"
          value={`${metrics.verificationPassRate}%`}
          note="Videos that passed all checks out of total analyzed"
          color={metrics.verificationPassRate >= 50 ? "success" : "warning"}
        />
      </Section>

      <Section title="Platform health">
        <StatRow label="Total users" value={metrics.totalUsers} />
        <StatRow label="Creators" value={metrics.totalCreators} note="Accounts with role = creator" />
        <StatRow label="Active campaigns" value={metrics.activeCampaigns} note="Currently running campaigns" color={metrics.activeCampaigns > 0 ? "success" : undefined} />
      </Section>
    </div>
  );
}