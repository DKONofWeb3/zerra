import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { apiGet } from "@/lib/api/client";
import { usePageTitle } from "@/hooks/usePageTitle";

interface TrendingVideo {
  video_id: string;
  final_score: number;
  authenticity_score: number;
  campaign_id: string;
  tiktok_posts: { title: string; cover_image_url: string | null; view_count: number; like_count: number } | null;
  users: { name: string | null; avatar: string | null } | null;
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function VideoRow({ video, rank }: { video: TrendingVideo; rank: number }) {
  const [thumbFailed, setThumbFailed] = useState(false);
  const post = video.tiktok_posts;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0">
      <span className="text-[12px] text-fg-muted tabular-nums w-5 text-center shrink-0">{rank}</span>

      <div className="w-10 h-10 rounded-lg overflow-hidden bg-bg-elevated border border-white/[0.06] shrink-0">
        {post?.cover_image_url && !thumbFailed ? (
          <img src={post.cover_image_url} alt="" className="w-full h-full object-cover" onError={() => setThumbFailed(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-fg-muted">N/A</div>
        )}
      </div>

      <div className="w-7 h-7 rounded-full overflow-hidden bg-bg-elevated border border-white/[0.06] shrink-0">
        {video.users?.avatar ? (
          <img src={video.users.avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-semibold text-fg-secondary">
            {(video.users?.name ?? "?").charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-fg-primary truncate">{post?.title || "Untitled"}</p>
        <p className="text-[11.5px] text-fg-tertiary truncate">{video.users?.name ?? "Unknown creator"}</p>
      </div>

      <div className="hidden sm:block text-right shrink-0 w-16">
        <p className="text-[12.5px] text-fg-secondary tabular-nums">{post ? fmt(post.view_count) : "—"}</p>
        <p className="text-[10.5px] text-fg-tertiary">Views</p>
      </div>

      <div className="text-right shrink-0 w-16">
        <p className="text-[12.5px] font-semibold tabular-nums"
          style={{ color: video.authenticity_score >= 75 ? "rgb(var(--success))" : "rgb(var(--fg-secondary))" }}>
          {video.authenticity_score}%
        </p>
        <p className="text-[10.5px] text-fg-tertiary">Authentic</p>
      </div>

      <div className="text-right shrink-0 w-14">
        <p className="text-[13px] font-bold text-gradient tabular-nums">{video.final_score}</p>
        <p className="text-[10.5px] text-fg-tertiary">Score</p>
      </div>
    </div>
  );
}

export default function AdminTrendingPage() {
  usePageTitle("Zerra Admin · Trending");
  const [videos, setVideos] = useState<TrendingVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ videos: TrendingVideo[] }>("/admin/trending-videos")
      .then((d) => setVideos(d.videos ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-12 space-y-6 md:space-y-8">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">Top verified content, platform-wide</span>
        </div>
        <h2 className={cn(
          "mt-4 font-display font-medium tracking-[-0.03em] leading-[0.95]",
          "text-[36px] md:text-[56px]",
          "bg-clip-text text-transparent",
          "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
        )}>
          Trending
        </h2>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-16 rounded-xl border border-white/[0.06] animate-pulse" style={{ background: "rgb(var(--bg-card))" }} />
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] px-4 md:px-5 py-1" style={{ background: "rgb(var(--bg-card))" }}>
          <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
          {videos.map((v, i) => <VideoRow key={v.video_id} video={v} rank={i + 1} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] p-10 text-center" style={{ background: "rgb(var(--bg-card))" }}>
          <p className="text-[14px] text-fg-tertiary">No verified videos yet.</p>
        </div>
      )}
    </div>
  );
}