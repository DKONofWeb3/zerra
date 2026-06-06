import { useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.06]",
        "min-h-[280px] flex flex-col items-center justify-center gap-4 p-8"
      )}
      style={{ background: "rgb(var(--bg-card))" }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }}
      />
      <div className="w-12 h-12 rounded-2xl border border-white/[0.06] bg-bg-elevated flex items-center justify-center">
        {icon}
      </div>
      <div className="text-center">
        <p className="text-[15px] font-medium text-fg-primary mb-1">{title}</p>
        <p className="text-[13px] text-fg-tertiary leading-relaxed max-w-xs">{description}</p>
      </div>
      <div className="px-4 py-2 rounded-full border border-white/[0.06] bg-bg-elevated text-[12px] text-fg-tertiary">
        Coming soon
      </div>
    </div>
  );
}

// ── Stats card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6"
      style={{ background: "rgb(var(--bg-card))" }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }}
      />
      <p className="text-[12.5px] text-fg-tertiary mb-2">{label}</p>
      <p className="text-[36px] font-display font-medium text-gradient leading-none">{value}</p>
      {sub && <p className="text-[12px] text-fg-tertiary mt-2">{sub}</p>}
    </div>
  );
}

// ── Claim row ──────────────────────────────────────────────────────────────
function ClaimRow({ claim }: { claim: any }) {
  const statusColor: Record<string, string> = {
    pending:   "text-fg-tertiary border-white/[0.06]",
    submitted: "text-brand border-brand/30",
    approved:  "text-success border-success/30",
    paid:      "text-success border-success/30",
  };
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-medium text-fg-primary truncate">
          {claim.bounties?.project_name ?? "Unknown project"}
        </p>
        <p className="text-[12px] text-fg-tertiary mt-0.5">
          {claim.bounties?.reward_usdc ? `$${claim.bounties.reward_usdc} USDC` : "—"}
        </p>
      </div>
      <span className={cn(
        "px-2.5 py-0.5 rounded-full text-[11px] font-medium border capitalize",
        statusColor[claim.status] ?? "text-fg-tertiary border-white/[0.06]"
      )}>
        {claim.status}
      </span>
    </div>
  );
}

// ── Overview tab ───────────────────────────────────────────────────────────
function OverviewTab() {
  const { session } = useAuth();
  const [stats, setStats]   = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    Promise.all([
      apiGet<{ stats: any }>("/portfolio/stats"),
      apiGet<{ claims: any[] }>("/portfolio/claims"),
    ]).then(([s, c]) => {
      setStats(s.stats);
      setClaims(c.claims ?? []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {[1,2,3].map((i) => (
          <div key={i} className="h-[140px] rounded-2xl border border-white/[0.06] animate-pulse" style={{ background: "rgb(var(--bg-card))" }} />
        ))}
      </div>
    );
  }

  const totalEarned  = stats?.total_earned_usdc ?? 0;
  const thisMonth    = stats?.this_month_usdc ?? 0;
  const totalClaims  = stats?.claims?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Earned"
          value={totalEarned > 0 ? `$${totalEarned.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "$0.00"}
          sub="All time USDC earnings"
        />
        <StatCard
          label="This Month"
          value={thisMonth > 0 ? `$${thisMonth.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "$0.00"}
          sub="Current month earnings"
        />
        <StatCard
          label="Total Claims"
          value={String(totalClaims)}
          sub={`${stats?.claims?.pending ?? 0} pending · ${stats?.claims?.paid ?? 0} paid`}
        />
      </div>

      {/* Claims list */}
      {claims.length > 0 ? (
        <div
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6"
          style={{ background: "rgb(var(--bg-card))" }}
        >
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }}
          />
          <p className="text-[15px] font-semibold text-fg-primary mb-4">My Claims</p>
          <div className="relative">
            {claims.map((c) => <ClaimRow key={c.id} claim={c} />)}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--fg-muted))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          }
          title="No claims yet"
          description="Claim influence bounties to start earning USDC. Your claims will appear here."
        />
      )}
    </div>
  );
}

// ── Payments tab ───────────────────────────────────────────────────────────
function PaymentsTab() {
  return (
    <div className="space-y-6">
      <EmptyState
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--fg-muted))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        }
        title="No payment method connected"
        description="Connect a payment account to receive your USDC earnings directly."
      />
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  usePageTitle("Zerra · Portfolio");
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "payments" ? "payments" : "overview";

  return (
    <div className="pb-12 space-y-8">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">
            {tab === "overview" ? "Earnings & activity" : "Payment methods"}
          </span>
        </div>
        <h2 className={cn(
          "mt-4 font-display font-medium tracking-[-0.03em]",
          "text-[64px] leading-[0.95]",
          "bg-clip-text text-transparent",
          "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
        )}>
          {tab === "overview" ? "Overview" : "Payments"}
        </h2>
      </div>

      {tab === "overview" ? <OverviewTab /> : <PaymentsTab />}
    </div>
  );
}