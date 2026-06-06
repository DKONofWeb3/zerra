import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api/client";

interface TikTokPost {
  id: string;
  post_id: string;
  title: string;
  cover_image_url: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  engagement_rate: number;
  fetched_at: string;
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function PostRow({ post, rank }: { post: TikTokPost; rank: number }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0">
      <span className="text-[13px] text-fg-muted tabular-nums w-6 text-center shrink-0">{rank}</span>

      <div className="w-12 h-12 rounded-xl overflow-hidden bg-bg-elevated border border-white/[0.06] shrink-0">
        {post.cover_image_url ? (
          <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--fg-muted))" strokeWidth="1.6">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-medium text-fg-primary truncate">
          {post.title || "Untitled post"}
        </p>
        <p className="text-[12px] text-fg-tertiary mt-0.5">
          {new Date(post.fetched_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <div className="text-right shrink-0 w-16">
        <p className="text-[13px] font-semibold text-fg-primary tabular-nums">{formatNum(post.view_count)}</p>
        <p className="text-[11px] text-fg-tertiary">Views</p>
      </div>

      <div className="text-right shrink-0 w-16">
        <p className="text-[13px] text-fg-secondary tabular-nums">{formatNum(post.like_count)}</p>
        <p className="text-[11px] text-fg-tertiary">Likes</p>
      </div>

      <div className="text-right shrink-0 w-20">
        <p className="text-[13px] text-fg-secondary tabular-nums">{post.engagement_rate.toFixed(1)}%</p>
        <p className="text-[11px] text-fg-tertiary">Eng. rate</p>
      </div>
    </div>
  );
}

export default function TopPerformingPage() {
  usePageTitle("Zerra · Top Performing");
  const { session } = useAuth();
  const [posts,   setPosts]   = useState<TikTokPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [noAccount, setNoAccount] = useState(false);

  const fetchAnalytics = () => {
    if (!session) return;
    setLoading(true);
    apiGet<{ analytics: { posts: TikTokPost[] } | null; message?: string }>("/analytics/tiktok")
      .then((d) => {
        if (d.analytics?.posts) {
          setPosts(d.analytics.posts);
        } else {
          setPosts([]);
        }
      })
      .catch((err) => {
        if (err.message?.includes("No TikTok")) setNoAccount(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAnalytics(); }, [session]);

  const handleSync = async () => {
    if (!session) return;
    setSyncing(true);
    try {
      await apiGet("/analytics/tiktok/sync");
      await fetchAnalytics();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="pb-12 space-y-8">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <Star className="w-3.5 h-3.5" />
          <span className="text-[12.5px]">Your TikTok analytics</span>
        </div>
        <div className="flex items-end justify-between gap-4">
          <h2 className={cn(
            "mt-4 font-display font-medium tracking-[-0.03em]",
            "text-[64px] leading-[0.95]",
            "bg-clip-text text-transparent",
            "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
          )}>
            Top Performing
          </h2>
          {!noAccount && !loading && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="mb-4 px-4 py-2 rounded-xl text-[13px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors disabled:opacity-50"
            >
              {syncing ? "Syncing..." : "Sync TikTok"}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-20 rounded-2xl border border-white/[0.06] animate-pulse" style={{ background: "rgb(var(--bg-card))" }} />
          ))}
        </div>
      ) : noAccount ? (
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-fg-muted">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.15a8.16 8.16 0 0 0 4.77 1.52V7.22a4.85 4.85 0 0 1-1-.53z"/>
            </svg>
          </div>
          <div className="text-center px-8">
            <p className="text-[15px] font-medium text-fg-primary mb-1">TikTok not connected</p>
            <p className="text-[13px] text-fg-tertiary leading-relaxed">
              Connect your TikTok account in Settings to track your post performance.
            </p>
          </div>
          <a
            href="/settings?tab=connected"
            className="px-5 py-2.5 rounded-xl text-[13px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors"
          >
            Connect TikTok
          </a>
        </div>
      ) : posts.length > 0 ? (
        <div
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] px-6 py-2"
          style={{ background: "rgb(var(--bg-card))" }}
        >
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }}
          />
          {posts.map((p, i) => (
            <PostRow key={p.id} post={p} rank={i + 1} />
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
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <div className="text-center px-8">
            <p className="text-[15px] font-medium text-fg-primary mb-1">No posts synced yet</p>
            <p className="text-[13px] text-fg-tertiary leading-relaxed">
              Click "Sync TikTok" above to pull your latest posts and analytics.
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-5 py-2.5 rounded-xl text-[13px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors disabled:opacity-50"
          >
            {syncing ? "Syncing..." : "Sync now"}
          </button>
        </div>
      )}
    </div>
  );
}