import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/api/client";

interface CampaignVideo {
  video_id: string;
  final_score: number;
  authenticity_score: number;
  leaderboard_eligible: boolean;
  status: string;
  error_message: string | null;
  tiktok_posts: {
    title: string | null;
    cover_image_url: string | null;
    view_count: number;
    like_count: number;
    engagement_rate: number;
    fetched_at: string;
  } | null;
  bounties: {
    project_name: string;
    token_icon: string | null;
    required_hashtags: string[];
  } | null;
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  completed:   { text: "Eligible",   color: "rgb(var(--success))" },
  processing:  { text: "Verifying...", color: "rgb(var(--brand))" },
  pending:     { text: "Queued",     color: "rgb(var(--fg-tertiary))" },
  failed:      { text: "Failed",     color: "rgb(var(--danger))" },
  quarantined: { text: "Under review", color: "rgb(var(--warning))" },
};

function Thumbnail({ url, title }: { url: string | null; title: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return (
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden bg-bg-elevated border border-white/[0.06] shrink-0 flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--fg-muted))" strokeWidth="1.6">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden bg-bg-elevated border border-white/[0.06] shrink-0">
      <img src={url} alt={title ?? ""} className="w-full h-full object-cover" onError={() => setFailed(true)} />
    </div>
  );
}

function VideoRow({ video, rank }: { video: CampaignVideo; rank: number }) {
  const post = video.tiktok_posts;
  const statusInfo = STATUS_LABEL[video.status] ?? STATUS_LABEL.pending;

  return (
    <div className="flex items-center gap-2 md:gap-4 py-3 border-b border-white/[0.04] last:border-0">
      <span className="text-[12px] md:text-[13px] text-fg-muted tabular-nums w-5 md:w-6 text-center shrink-0">{rank}</span>

      <Thumbnail url={post?.cover_image_url ?? null} title={post?.title ?? null} />

      {/* Campaign icon */}
      <div className="w-6 h-6 rounded-lg overflow-hidden bg-bg-elevated border border-white/[0.06] shrink-0 hidden sm:block">
        {video.bounties?.token_icon ? (
          <img src={video.bounties.token_icon} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-fg-secondary">
            {video.bounties?.project_name?.charAt(0) ?? "?"}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] md:text-[13.5px] font-medium text-fg-primary truncate">
          {post?.title || "Untitled post"}
        </p>
        <p className="text-[11px] md:text-[12px] text-fg-tertiary mt-0.5 truncate">
          {video.bounties?.project_name ?? "Campaign"}
        </p>
      </div>

      <div className="text-right shrink-0 w-12 md:w-16">
        <p className="text-[12px] md:text-[13px] font-semibold text-fg-primary tabular-nums">
          {formatNum(post?.view_count ?? 0)}
        </p>
        <p className="text-[10px] md:text-[11px] text-fg-tertiary">Views</p>
      </div>

      <div className="hidden sm:block text-right shrink-0 w-14">
        <p className="text-[12px] md:text-[13px] tabular-nums"
          style={{ color: video.authenticity_score >= 60 ? "rgb(var(--success))" : "rgb(var(--fg-secondary))" }}>
          {video.authenticity_score}%
        </p>
        <p className="text-[10px] md:text-[11px] text-fg-tertiary">Auth.</p>
      </div>

      <div className="text-right shrink-0 w-16 md:w-20">
        <p className="text-[12px] md:text-[13px] font-medium tabular-nums" style={{ color: statusInfo.color }}>
          {statusInfo.text}
        </p>
        <p className="text-[10px] md:text-[11px] text-fg-tertiary">{video.final_score} pts</p>
      </div>
    </div>
  );
}

export default function TopPerformingPage() {
  usePageTitle("Zerra · Top Performing");
  const { session } = useAuth();
  const [videos,    setVideos]    = useState<CampaignVideo[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [syncing,   setSyncing]   = useState(false);
  const [noAccount, setNoAccount] = useState(false);

  const fetchVideos = () => {
    if (!session) return;
    setLoading(true);
    apiGet<{ posts: CampaignVideo[] }>("/analytics/tiktok/campaign-matched")
      .then((d) => setVideos(d.posts ?? []))
      .catch((err) => {
        if (err.message?.includes("No TikTok")) setNoAccount(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVideos(); }, [session]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await apiPost("/analytics/tiktok/sync");
      // Give the campaign-matched videos a moment to be queued, then refetch
      setTimeout(fetchVideos, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="pb-12 space-y-6 md:space-y-8">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <Star className="w-3.5 h-3.5" />
          <span className="text-[12.5px]">Your campaign performance</span>
        </div>

        <div className="flex items-center justify-between gap-3 mt-4">
          <h2 className={cn(
            "font-display font-medium tracking-[-0.03em] leading-[0.95]",
            "text-[36px] md:text-[64px]",
            "bg-clip-text text-transparent",
            "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
          )}>
            Top Performing
          </h2>

          {!noAccount && !loading && (
            <button onClick={handleSync} disabled={syncing}
              className="shrink-0 px-3 md:px-4 py-2 rounded-xl text-[12px] md:text-[13px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors disabled:opacity-50 whitespace-nowrap">
              {syncing ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border border-white/20 border-t-white/60 animate-spin" />
                  Syncing...
                </span>
              ) : "Sync TikTok"}
            </button>
          )}
        </div>
        <p className="text-[12.5px] text-fg-tertiary mt-2">
          Only posts that match a campaign's required hashtag appear here.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-16 md:h-20 rounded-2xl border border-white/[0.06] animate-pulse"
              style={{ background: "rgb(var(--bg-card))" }} />
          ))}
        </div>

      ) : noAccount ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] min-h-[300px] flex flex-col items-center justify-center gap-4"
          style={{ background: "rgb(var(--bg-card))" }}>
          <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
          <div className="w-12 h-12 rounded-2xl border border-white/[0.06] bg-bg-elevated flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-fg-muted">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.15a8.16 8.16 0 0 0 4.77 1.52V7.22a4.85 4.85 0 0 1-1-.53z"/>
            </svg>
          </div>
          <div className="text-center px-8">
            <p className="text-[15px] font-medium text-fg-primary mb-1">TikTok not connected</p>
            <p className="text-[13px] text-fg-tertiary leading-relaxed">
              Connect your TikTok account in Settings to track your campaign performance.
            </p>
          </div>
          <a href="/settings?tab=connected"
            className="px-5 py-2.5 rounded-xl text-[13px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors">
            Connect TikTok
          </a>
        </div>

      ) : videos.length > 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] px-3 md:px-6 py-2"
          style={{ background: "rgb(var(--bg-card))" }}>
          <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
          {videos.map((v, i) => <VideoRow key={v.video_id} video={v} rank={i + 1} />)}
        </div>

      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] min-h-[300px] flex flex-col items-center justify-center gap-4"
          style={{ background: "rgb(var(--bg-card))" }}>
          <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
          <div className="w-12 h-12 rounded-2xl border border-white/[0.06] bg-bg-elevated flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--fg-muted))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <div className="text-center px-8">
            <p className="text-[15px] font-medium text-fg-primary mb-1">No campaign posts yet</p>
            <p className="text-[13px] text-fg-tertiary leading-relaxed">
              Join a campaign on Explore, post with its required hashtag, then sync your TikTok to see it here.
            </p>
          </div>
          <a href="/explore"
            className="px-5 py-2.5 rounded-xl text-[13px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors">
            Browse Campaigns →
          </a>
        </div>
      )}
    </div>
  );
}