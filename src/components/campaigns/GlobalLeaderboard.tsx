// src/components/campaigns/GlobalLeaderboard.tsx
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api/client";

interface LeaderboardEntry {
  creator_id: string;
  name: string | null;
  avatar: string | null;
  username: string | null;
  total_score: number;
  campaigns_count: number;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function GlobalLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ leaderboard: LeaderboardEntry[] }>("/leaderboard")
      .then((d) => setEntries(d.leaderboard ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1,2,3,4,5].map((i) => (
          <div key={i} className="h-16 rounded-xl border border-white/[0.06] animate-pulse"
            style={{ background: "rgb(var(--bg-card))" }} />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] p-10 text-center"
        style={{ background: "rgb(var(--bg-card))" }}>
        <p className="text-[14px] text-fg-tertiary">No verified creators yet.</p>
        <p className="text-[12px] text-fg-muted mt-1">
          Join a campaign and get verified to appear on the leaderboard.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] px-4 md:px-5 py-1"
      style={{ background: "rgb(var(--bg-card))" }}>
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
      {entries.map((entry, i) => (
        <div key={entry.creator_id}
          className="flex items-center gap-3 py-3.5 border-b border-white/[0.04] last:border-0">
          <span className="text-[16px] w-7 text-center shrink-0">
            {i < 3 ? MEDALS[i] : <span className="text-[13px] text-fg-muted tabular-nums">{i + 1}</span>}
          </span>
          <div className="w-9 h-9 rounded-full overflow-hidden bg-bg-elevated border border-white/[0.06] shrink-0">
            {entry.avatar ? (
              <img src={entry.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[13px] font-semibold text-fg-secondary">
                {(entry.name ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-medium text-fg-primary truncate">
              {entry.name ?? "Creator"}
            </p>
            <p className="text-[12px] text-fg-tertiary">
              {entry.username ? `@${entry.username}` : `${entry.campaigns_count} campaign${entry.campaigns_count !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[15px] font-semibold text-gradient tabular-nums">{entry.total_score.toLocaleString()}</p>
            <p className="text-[10.5px] text-fg-tertiary">Score</p>
          </div>
        </div>
      ))}
    </div>
  );
}