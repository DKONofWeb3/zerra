// src/pages/Project/Videos/index.tsx
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { apiGet } from "@/lib/api/client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

interface VideoAnalysis {
  video_id: string;
  final_score: number;
  authenticity_score: number;
  engagement_score: number;
  leaderboard_eligible: boolean;
  status: string;
  transcript_text: string | null;
  caption_result: any;
  transcript_result: any;
  error_message: string | null;
  tiktok_posts: {
    title: string | null;
    cover_image_url: string | null;
    view_count: number;
    like_count: number;
    comment_count: number;
    share_count: number;
  } | null;
  users: { name: string | null; avatar: string | null } | null;
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const STATUS_STYLE: Record<string, string> = {
  completed:    "text-success border-success/30 bg-[rgb(var(--success)/0.08)]",
  quarantined:  "text-warning border-warning/30 bg-[rgb(var(--warning)/0.08)]",
  failed:       "text-danger border-danger/30 bg-[rgb(var(--danger)/0.08)]",
  processing:   "text-brand border-brand/30 bg-brand/10",
  pending:      "text-fg-tertiary border-white/[0.08] bg-bg-elevated",
};

function VideoRow({ video }: { video: VideoAnalysis }) {
  const [expanded, setExpanded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const post = video.tiktok_posts;

  return (
    <div className="border-b border-white/[0.04] last:border-0">
      <div className="flex items-center gap-3 py-3.5 cursor-pointer" onClick={() => setExpanded(p => !p)}>
        {/* Thumbnail */}
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-bg-elevated border border-white/[0.06] shrink-0">
          {post?.cover_image_url && !imgFailed ? (
            <img src={post.cover_image_url} alt="" className="w-full h-full object-cover"
              onError={() => setImgFailed(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-fg-muted">N/A</div>
          )}
        </div>

        {/* Creator + title */}
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
          <p className="text-[11.5px] text-fg-tertiary">{video.users?.name ?? "Unknown"}</p>
        </div>

        {/* Scores */}
        <div className="hidden sm:block text-right shrink-0 w-16">
          <p className="text-[12.5px] tabular-nums"
            style={{ color: video.authenticity_score >= 60 ? "rgb(var(--success))" : "rgb(var(--fg-secondary))" }}>
            {video.authenticity_score}%
          </p>
          <p className="text-[10.5px] text-fg-tertiary">Auth</p>
        </div>
        <div className="text-right shrink-0 w-14">
          <p className="text-[13px] font-bold text-gradient tabular-nums">{video.final_score}</p>
          <p className="text-[10.5px] text-fg-tertiary">Score</p>
        </div>
        <span className={cn("hidden sm:inline-block px-2 py-0.5 rounded-full text-[10.5px] font-medium border capitalize shrink-0",
          STATUS_STYLE[video.status] ?? STATUS_STYLE.pending)}>
          {video.leaderboard_eligible ? "Eligible" : video.status}
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-fg-tertiary shrink-0" /> : <ChevronDown className="w-4 h-4 text-fg-tertiary shrink-0" />}
      </div>

      {/* Expanded metrics */}
      {expanded && (
        <div className="pb-4 pl-4 space-y-4">
          {/* Engagement stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Views",    value: fmtNum(post?.view_count ?? 0) },
              { label: "Likes",    value: fmtNum(post?.like_count ?? 0) },
              { label: "Comments", value: fmtNum(post?.comment_count ?? 0) },
              { label: "Shares",   value: fmtNum(post?.share_count ?? 0) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-bg-elevated border border-white/[0.06] p-3">
                <p className="text-[14px] font-semibold text-fg-primary">{value}</p>
                <p className="text-[10.5px] text-fg-tertiary">{label}</p>
              </div>
            ))}
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Authenticity", value: `${video.authenticity_score}%` },
              { label: "Engagement",   value: `${video.engagement_score}%` },
              { label: "Final Score",  value: String(video.final_score) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-bg-elevated border border-white/[0.06] p-3">
                <p className="text-[14px] font-semibold text-fg-primary">{value}</p>
                <p className="text-[10.5px] text-fg-tertiary">{label}</p>
              </div>
            ))}
          </div>

          {/* Claude caption analysis */}
          {video.caption_result?.summary && (
            <div className="rounded-xl bg-bg-elevated border border-white/[0.06] p-3.5">
              <p className="text-[11px] text-fg-tertiary mb-1.5">Caption Analysis</p>
              <p className="text-[12.5px] text-fg-secondary leading-relaxed">{video.caption_result.summary}</p>
              {video.caption_result.verdict && (
                <span className={cn("inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium border",
                  video.caption_result.verdict === "Authentic" ? "text-success border-success/30 bg-[rgb(var(--success)/0.08)]"
                  : video.caption_result.verdict === "Suspicious" ? "text-danger border-danger/30 bg-[rgb(var(--danger)/0.08)]"
                  : "text-warning border-warning/30 bg-[rgb(var(--warning)/0.08)]")}>
                  {video.caption_result.verdict}
                </span>
              )}
            </div>
          )}

          {/* Keyword verification */}
          {video.transcript_result && (
            <div className="rounded-xl bg-bg-elevated border border-white/[0.06] p-3.5">
              <p className="text-[11px] text-fg-tertiary mb-2">Keyword Verification</p>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("text-[12px] font-semibold",
                  video.transcript_result.all_keywords_mentioned ? "text-success" : "text-danger")}>
                  {video.transcript_result.all_keywords_mentioned ? "✓ All keywords spoken" : "✗ Keywords missing"}
                </span>
                <span className="text-[11px] text-fg-tertiary">
                  ({video.transcript_result.keyword_coverage ?? 0}% coverage)
                </span>
              </div>
              {video.transcript_result.keywords_mentioned?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {video.transcript_result.keywords_mentioned.map((kw: string) => (
                    <span key={kw} className="px-2 py-0.5 rounded-full text-[11px] border border-success/30 bg-[rgb(var(--success)/0.08)] text-success">{kw}</span>
                  ))}
                </div>
              )}
              {video.transcript_result.summary && (
                <p className="text-[12px] text-fg-tertiary mt-2 leading-relaxed">{video.transcript_result.summary}</p>
              )}
            </div>
          )}

          {/* Error message if any */}
          {video.error_message && (
            <p className="text-[12px] text-warning">{video.error_message}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectVideosPage() {
  usePageTitle("Zerra Project · Videos");
  const [params] = useSearchParams();
  const campaignId = params.get("campaignId");
  const [videos,  setVideos]  = useState<VideoAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campaignId) { setLoading(false); return; }
    apiGet<{ videos: VideoAnalysis[] }>(`/project/videos?campaignId=${campaignId}`)
      .then((d) => setVideos(d.videos ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [campaignId]);

  if (!campaignId) {
    return (
      <div className="pb-12 pt-2">
        <p className="text-[13px] text-fg-tertiary">Select a campaign from Overview first.</p>
        <Link to="/project" className="text-brand text-[13px] mt-2 inline-block">← Back to Overview</Link>
      </div>
    );
  }

  return (
    <div className="pb-12 space-y-6 md:space-y-8">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">AI-verified content</span>
        </div>
        <h2 className={cn(
          "mt-4 font-display font-medium tracking-[-0.03em] leading-[0.95]",
          "text-[32px] md:text-[52px]",
          "bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-[#7d8aa8]"
        )}>
          Videos
        </h2>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map((i) => (
            <div key={i} className="h-16 rounded-xl border border-white/[0.06] animate-pulse"
              style={{ background: "rgb(var(--bg-card))" }} />
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] px-4 md:px-5 py-1"
          style={{ background: "rgb(var(--bg-card))" }}>
          <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
          {videos.map((v) => <VideoRow key={v.video_id} video={v} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] p-10 text-center"
          style={{ background: "rgb(var(--bg-card))" }}>
          <p className="text-[14px] text-fg-tertiary">No verified videos yet.</p>
          <p className="text-[12px] text-fg-muted mt-1">Videos appear here after creators sync their TikTok and the AI verification completes.</p>
        </div>
      )}
    </div>
  );
}