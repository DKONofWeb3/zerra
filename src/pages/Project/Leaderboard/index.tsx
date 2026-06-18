// src/pages/Project/Leaderboard/index.tsx
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { apiGet } from "@/lib/api/client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useSearchParams, Link } from "react-router-dom";

interface LeaderboardEntry {
  creator_id: string;
  total_score: number;
  rank: number | null;
  users: { name: string | null; avatar: string | null; email: string } | null;
  social_accounts: { username: string | null }[] | null;
}

interface Campaign {
  id: string; project_name: string;
  reward_usdc: number; total_budget_usdc: number; spent_usdc: number;
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function ProjectLeaderboardPage() {
  usePageTitle("Zerra Project · Leaderboard");
  const [params] = useSearchParams();
  const campaignId = params.get("campaignId");

  const [entries,  setEntries]  = useState<LeaderboardEntry[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!campaignId) { setLoading(false); return; }
    apiGet<{ campaign: Campaign; leaderboard: LeaderboardEntry[] }>(`/project/leaderboard?campaignId=${campaignId}`)
      .then((d) => { setCampaign(d.campaign); setEntries(d.leaderboard ?? []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [campaignId]);

  if (!campaignId) {
    return (
      <div className="pb-12 pt-2 space-y-6">
        <p className="text-[13px] text-fg-tertiary">Select a campaign from Overview to view its leaderboard.</p>
        <Link to="/project" className="text-brand text-[13px]">← Back to Overview</Link>
      </div>
    );
  }

  return (
    <div className="pb-12 space-y-6 md:space-y-8">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">{campaign?.project_name ?? "Campaign"} · Top creators</span>
        </div>
        <div className="flex items-center justify-between gap-4 mt-4">
          <h2 className={cn(
            "font-display font-medium tracking-[-0.03em] leading-[0.95]",
            "text-[32px] md:text-[52px]",
            "bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-[#7d8aa8]"
          )}>
            Leaderboard
          </h2>
          {campaign && (
            <div className="text-right shrink-0">
              <p className="text-[15px] font-semibold text-fg-primary">{fmt(campaign.reward_usdc)}</p>
              <p className="text-[11px] text-fg-tertiary">Per creator</p>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-16 rounded-xl border border-white/[0.06] animate-pulse"
              style={{ background: "rgb(var(--bg-card))" }} />
          ))}
        </div>
      ) : entries.length > 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] px-4 md:px-5 py-1"
          style={{ background: "rgb(var(--bg-card))" }}>
          <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
          {entries.map((entry, i) => {
            const handle = entry.social_accounts?.[0]?.username;
            return (
              <div key={entry.creator_id}
                className="flex items-center gap-3 py-3.5 border-b border-white/[0.04] last:border-0">
                <span className="text-[16px] w-7 text-center shrink-0">
                  {i < 3 ? MEDALS[i] : <span className="text-[13px] text-fg-muted tabular-nums">{i + 1}</span>}
                </span>
                <div className="w-9 h-9 rounded-full overflow-hidden bg-bg-elevated border border-white/[0.06] shrink-0">
                  {entry.users?.avatar ? (
                    <img src={entry.users.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[13px] font-semibold text-fg-secondary">
                      {(entry.users?.name ?? "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-medium text-fg-primary truncate">
                    {entry.users?.name ?? "Creator"}
                  </p>
                  {handle && <p className="text-[12px] text-fg-tertiary">@{handle}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[15px] font-semibold text-gradient tabular-nums">{entry.total_score}</p>
                  <p className="text-[10.5px] text-fg-tertiary">Score</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] p-10 text-center"
          style={{ background: "rgb(var(--bg-card))" }}>
          <p className="text-[14px] text-fg-tertiary">No eligible creators yet.</p>
          <p className="text-[12px] text-fg-muted mt-1">
            Creators must post with the required hashtag and have it verified to appear here.
          </p>
        </div>
      )}
    </div>
  );
}