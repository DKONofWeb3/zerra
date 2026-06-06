import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePageTitle } from "@/hooks/usePageTitle";
import { apiGetPublic } from "@/lib/api/client";

interface Creator {
  user_id: string;
  name: string | null;
  avatar: string | null;
  username: string | null;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  post_count: number;
  avg_engagement_rate: number;
}

function CreatorRow({ creator, rank }: { creator: Creator; rank: number }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0">
      <span className="text-[13px] text-fg-muted tabular-nums w-6 text-center">{rank}</span>

      <div className="w-9 h-9 rounded-full overflow-hidden bg-bg-elevated border border-white/[0.06] shrink-0">
        {creator.avatar ? (
          <img src={creator.avatar} alt={creator.name ?? ""} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[13px] font-semibold text-fg-secondary">
            {(creator.name ?? creator.username ?? "?").charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-medium text-fg-primary truncate">
          {creator.name ?? creator.username ?? "Unknown"}
        </p>
        {creator.username && (
          <p className="text-[12px] text-fg-tertiary truncate">@{creator.username}</p>
        )}
      </div>

      <div className="text-right shrink-0">
        <p className="text-[13px] font-semibold text-fg-primary tabular-nums">
          {creator.avg_engagement_rate.toFixed(1)}%
        </p>
        <p className="text-[11px] text-fg-tertiary">Eng. rate</p>
      </div>

      <div className="text-right shrink-0 w-20">
        <p className="text-[13px] text-fg-secondary tabular-nums">
          {creator.total_views >= 1_000_000
            ? `${(creator.total_views / 1_000_000).toFixed(1)}M`
            : creator.total_views >= 1_000
            ? `${(creator.total_views / 1_000).toFixed(0)}K`
            : String(creator.total_views)}
        </p>
        <p className="text-[11px] text-fg-tertiary">Views</p>
      </div>

      <div className="text-right shrink-0 w-16">
        <p className="text-[13px] text-fg-secondary tabular-nums">{creator.post_count}</p>
        <p className="text-[11px] text-fg-tertiary">Posts</p>
      </div>
    </div>
  );
}

export default function TopCreatorsPage() {
  usePageTitle("Zerra · Top Creators");
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    apiGetPublic<{ creators: Creator[] }>("/analytics/top-creators")
      .then((d) => setCreators(d.creators ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-12 space-y-8">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <Star className="w-3.5 h-3.5" />
          <span className="text-[12.5px]">Live leaderboard</span>
        </div>
        <h2 className={cn(
          "mt-4 font-display font-medium tracking-[-0.03em]",
          "text-[64px] leading-[0.95]",
          "bg-clip-text text-transparent",
          "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
        )}>
          Top Creators
        </h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-16 rounded-2xl border border-white/[0.06] animate-pulse" style={{ background: "rgb(var(--bg-card))" }} />
          ))}
        </div>
      ) : creators.length > 0 ? (
        <div
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] px-6 py-2"
          style={{ background: "rgb(var(--bg-card))" }}
        >
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }}
          />
          {creators.map((c, i) => (
            <CreatorRow key={c.user_id} creator={c} rank={i + 1} />
          ))}
        </div>
      ) : (
        <div
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] min-h-[360px] flex flex-col items-center justify-center gap-4"
          style={{ background: "rgb(var(--bg-card))" }}
        >
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }}
          />
          <div className="w-12 h-12 rounded-2xl border border-white/[0.06] bg-bg-elevated flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--fg-muted))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="text-center px-8">
            <p className="text-[15px] font-medium text-fg-primary mb-1">No creators ranked yet</p>
            <p className="text-[13px] text-fg-tertiary leading-relaxed">
              Connect your TikTok and sync your posts to appear on the leaderboard.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}