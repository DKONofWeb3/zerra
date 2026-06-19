// src/components/admin/AdminUserDetail.tsx
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { apiGet } from "@/lib/api/client";
import { X, Wallet, Eye, Heart, MessageCircle, Share2, Trophy, Video } from "lucide-react";

interface FullUserData {
  user: {
    id: string; name: string | null; email: string; avatar: string | null;
    role: string; account_status: string; created_at: string; restricted_reason: string | null;
  };
  socialAccounts: { platform: string; username: string | null; created_at: string; expires_at: string | null }[];
  wallet: { address: string | null; chain: string | null };
  socialStats: { totalViews: number; totalLikes: number; totalComments: number; totalShares: number; totalPosts: number };
  scoring: { totalScore: number; campaigns: { campaignId: string; name: string; count: number; eligible: number }[] };
  recentVideos: { videoId: string; campaignName: string; finalScore: number; authenticityScore: number; status: string; eligible: boolean; createdAt: string }[];
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function StatBlock({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-bg-elevated border border-white/[0.06] p-3">
      <Icon className="w-3.5 h-3.5 text-fg-tertiary mb-1.5" />
      <p className="text-[15px] font-semibold text-fg-primary">{value}</p>
      <p className="text-[10.5px] text-fg-tertiary">{label}</p>
    </div>
  );
}

export function AdminUserDetailModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [data,    setData]    = useState<FullUserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<FullUserData>(`/admin/users/${userId}/full`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgb(0 0 0 / 0.75)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-white/[0.08]"
        style={{ background: "rgb(var(--bg-card))" }}>
        <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />

        <div className="sticky top-0 z-10 flex justify-end p-4" style={{ background: "rgb(var(--bg-card))" }}>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-white/[0.08] bg-bg-elevated flex items-center justify-center text-fg-tertiary hover:text-fg-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center">
            <p className="text-[13px] text-fg-tertiary">Loading user data...</p>
          </div>
        ) : !data ? (
          <div className="p-10 text-center">
            <p className="text-[13px] text-fg-tertiary">Could not load user data.</p>
          </div>
        ) : (
          <div className="px-5 pb-6 space-y-6 -mt-4">
            {/* Profile header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-bg-elevated border border-white/[0.06] shrink-0">
                {data.user.avatar ? (
                  <img src={data.user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[22px] font-semibold text-fg-secondary">
                    {(data.user.name ?? "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[18px] font-semibold text-fg-primary truncate">{data.user.name ?? "Unnamed"}</h3>
                <p className="text-[13px] text-fg-tertiary truncate">{data.user.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-tertiary capitalize">
                    {data.user.role}
                  </span>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10.5px] font-medium border capitalize",
                    data.user.account_status === "active" ? "text-success border-success/30 bg-[rgb(var(--success)/0.08)]" :
                    data.user.account_status === "restricted" ? "text-warning border-warning/30 bg-[rgb(var(--warning)/0.08)]" :
                    "text-danger border-danger/30 bg-[rgb(var(--danger)/0.08)]")}>
                    {data.user.account_status}
                  </span>
                </div>
              </div>
            </div>

            {data.user.restricted_reason && (
              <p className="text-[12.5px] text-warning bg-[rgb(var(--warning)/0.08)] border border-warning/20 rounded-xl p-3">
                Restriction reason: {data.user.restricted_reason}
              </p>
            )}

            {/* Connected accounts */}
            <div>
              <p className="text-[13px] font-semibold text-fg-primary mb-2.5">Connected Accounts</p>
              {data.socialAccounts.length > 0 ? (
                <div className="space-y-2">
                  {data.socialAccounts.map((acc, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-bg-elevated border border-white/[0.06] p-3">
                      <div>
                        <p className="text-[13px] font-medium text-fg-primary capitalize">{acc.platform}</p>
                        <p className="text-[12px] text-fg-tertiary">@{acc.username ?? "unknown"}</p>
                      </div>
                      <p className="text-[11px] text-fg-muted">
                        Connected {new Date(acc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12.5px] text-fg-muted">No connected social accounts.</p>
              )}
            </div>

            {/* Wallet */}
            <div>
              <p className="text-[13px] font-semibold text-fg-primary mb-2.5">Connected Wallet</p>
              {data.wallet.address ? (
                <div className="flex items-center gap-3 rounded-xl bg-bg-elevated border border-white/[0.06] p-3">
                  <Wallet className="w-4 h-4 text-fg-tertiary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-mono text-fg-primary truncate">{data.wallet.address}</p>
                    <p className="text-[11px] text-fg-tertiary uppercase">{data.wallet.chain}</p>
                  </div>
                </div>
              ) : (
                <p className="text-[12.5px] text-fg-muted">No wallet connected.</p>
              )}
            </div>

            {/* Social impressions / engagement */}
            <div>
              <p className="text-[13px] font-semibold text-fg-primary mb-2.5">Social Impressions</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <StatBlock icon={Video}         label="Posts"    value={data.socialStats.totalPosts} />
                <StatBlock icon={Eye}           label="Views"    value={fmtNum(data.socialStats.totalViews)} />
                <StatBlock icon={Heart}         label="Likes"    value={fmtNum(data.socialStats.totalLikes)} />
                <StatBlock icon={MessageCircle} label="Comments" value={fmtNum(data.socialStats.totalComments)} />
                <StatBlock icon={Share2}        label="Shares"   value={fmtNum(data.socialStats.totalShares)} />
              </div>
            </div>

            {/* Scoring / bolts */}
            <div>
              <p className="text-[13px] font-semibold text-fg-primary mb-2.5">Scoring & Campaigns</p>
              <div className="rounded-xl bg-bg-elevated border border-white/[0.06] p-3 mb-2.5 flex items-center gap-3">
                <Trophy className="w-4 h-4 text-fg-tertiary shrink-0" />
                <div>
                  <p className="text-[18px] font-semibold text-gradient">{data.scoring.totalScore.toLocaleString()}</p>
                  <p className="text-[11px] text-fg-tertiary">Total Score (all campaigns)</p>
                </div>
              </div>
              {data.scoring.campaigns.length > 0 ? (
                <div className="space-y-2">
                  {data.scoring.campaigns.map((c) => (
                    <div key={c.campaignId} className="flex items-center justify-between rounded-xl bg-bg-elevated border border-white/[0.06] p-3">
                      <p className="text-[13px] font-medium text-fg-primary">{c.name}</p>
                      <p className="text-[12px] text-fg-tertiary">{c.count} posts · {c.eligible} eligible</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12.5px] text-fg-muted">Not part of any campaigns yet.</p>
              )}
            </div>

            {/* Recent verified videos */}
            <div>
              <p className="text-[13px] font-semibold text-fg-primary mb-2.5">Recent Posts</p>
              {data.recentVideos.length > 0 ? (
                <div className="space-y-1.5">
                  {data.recentVideos.map((v) => (
                    <div key={v.videoId} className="flex items-center justify-between rounded-xl bg-bg-elevated border border-white/[0.06] p-3">
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-medium text-fg-primary truncate">{v.campaignName}</p>
                        <p className="text-[11px] text-fg-tertiary capitalize">{v.status} · {v.authenticityScore}% authentic</p>
                      </div>
                      <p className="text-[13px] font-semibold text-gradient shrink-0">{v.finalScore}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12.5px] text-fg-muted">No posts recorded yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}