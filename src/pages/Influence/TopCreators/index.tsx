import { useEffect, useState } from "react";
import { Star, ChevronDown } from "lucide-react";
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

const NICHES = [
  "All",
  "DeFi",
  "NFT",
  "Trading",
  "Gaming",
  "Memecoins",
  "Layer 2",
  "AI & Crypto",
];

function CreatorRow({ creator, rank }: { creator: Creator; rank: number }) {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[13px] text-fg-muted tabular-nums w-6 text-center shrink-0">{rank}</span>

      <div className="w-10 h-10 rounded-full overflow-hidden bg-bg-elevated border border-white/[0.06] shrink-0">
        {creator.avatar ? (
          <img src={creator.avatar} alt={creator.name ?? ""} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[14px] font-semibold text-fg-secondary">
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

      <div className="text-right shrink-0 w-20">
        <p className="text-[13px] font-semibold text-fg-primary tabular-nums">
          {creator.avg_engagement_rate.toFixed(1)}%
        </p>
        <p className="text-[11px] text-fg-tertiary">Engagement</p>
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

      <div className="text-right shrink-0 w-14">
        <p className="text-[13px] text-fg-secondary tabular-nums">{creator.post_count}</p>
        <p className="text-[11px] text-fg-tertiary">Posts</p>
      </div>
    </div>
  );
}

export default function TopCreatorsPage() {
  usePageTitle("Zerra · Top Creators");
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [niche,    setNiche]    = useState("All");
  const [open,     setOpen]     = useState(false);

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
        <div className="flex items-end justify-between gap-4 mt-4">
          <h2 className={cn(
            "font-display font-medium tracking-[-0.03em]",
            "text-[64px] leading-[0.95]",
            "bg-clip-text text-transparent",
            "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
          )}>
            Top Creators
          </h2>

          {/* Niche dropdown */}
          <div className="relative mb-2">
            <button
              onClick={() => setOpen((p) => !p)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-bg-elevated text-[13px] font-medium text-fg-primary hover:border-white/[0.15] transition-colors"
            >
              {niche}
              <ChevronDown className={cn("w-4 h-4 text-fg-tertiary transition-transform", open && "rotate-180")} />
            </button>

            {open && (
              <div
                className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-white/[0.08] overflow-hidden z-20"
                style={{ background: "rgb(8 10 16)" }}
              >
                {NICHES.map((n) => (
                  <button
                    key={n}
                    onClick={() => { setNiche(n); setOpen(false); }}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-[13px] transition-colors",
                      niche === n
                        ? "bg-brand/10 text-brand font-medium"
                        : "text-fg-secondary hover:bg-white/[0.03] hover:text-fg-primary"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Niche note */}
      {niche !== "All" && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand/20 bg-brand/5 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-brand" />
          <span className="text-[12.5px] text-brand">Showing creators in {niche}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-16 rounded-2xl border border-white/[0.06] animate-pulse" style={{ background: "rgb(var(--bg-card))" }} />
          ))}
        </div>
      ) : creators.length > 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] px-6 py-2"
          style={{ background: "rgb(var(--bg-card))" }}>
          <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
          {creators.map((c, i) => (
            <CreatorRow key={c.user_id} creator={c} rank={i + 1} />
          ))}
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] min-h-[360px] flex flex-col items-center justify-center gap-4"
          style={{ background: "rgb(var(--bg-card))" }}>
          <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
          <div className="w-12 h-12 rounded-2xl border border-white/[0.06] bg-bg-elevated flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--fg-muted))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
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