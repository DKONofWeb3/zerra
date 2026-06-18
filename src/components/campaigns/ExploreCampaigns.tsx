import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/api/client";
import { X, Users, Wallet, Hash, Mic } from "lucide-react";

interface Campaign {
  id: string;
  project_name: string;
  description: string;
  cover_image_url: string | null;
  token_icon: string | null;
  reward_usdc: number;
  total_budget_usdc: number;
  spent_usdc: number;
  required_hashtags: string[];
  required_keywords: string[];
  status: string;
  stats?: { participantCount: number };
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function TikTokGateModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgb(0 0 0 / 0.7)", backdropFilter: "blur(8px)" }}>
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/[0.08]"
        style={{ background: "rgb(var(--bg-card))" }}>
        <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-bg-elevated border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-fg-muted">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.15a8.16 8.16 0 0 0 4.77 1.52V7.22a4.85 4.85 0 0 1-1-.53z"/>
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-fg-primary mb-1">TikTok not connected</p>
          <p className="text-[13px] text-fg-tertiary leading-relaxed mb-5">
            You need to connect your TikTok account before joining a campaign.
          </p>
          <div className="flex flex-col gap-2">
            <a href="/settings?tab=connected"
              className="w-full py-2.5 rounded-xl text-[13.5px] font-semibold text-white text-center"
              style={{ background: "rgb(74 125 255)" }}>
              Connect TikTok
            </a>
            <button onClick={onClose}
              className="w-full py-2.5 rounded-xl text-[13px] text-fg-tertiary border border-white/[0.06] hover:border-white/[0.12] transition-colors">
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignModal({
  campaign, hasTikTok, alreadyJoined, onClose, onJoined,
}: {
  campaign: Campaign; hasTikTok: boolean; alreadyJoined: boolean;
  onClose: () => void; onJoined: (id: string) => void;
}) {
  const [joining,        setJoining]        = useState(false);
  const [joined,         setJoined]         = useState(alreadyJoined);
  const [joinError,      setJoinError]      = useState<string | null>(null);
  const [showTikTokGate, setShowTikTokGate] = useState(false);
  const [imgFailed,      setImgFailed]      = useState(false);

  const budgetPct = campaign.total_budget_usdc > 0
    ? Math.min(100, Math.round(((campaign.spent_usdc ?? 0) / campaign.total_budget_usdc) * 100))
    : 0;

  const handleJoin = async () => {
    if (!hasTikTok) { setShowTikTokGate(true); return; }
    setJoining(true); setJoinError(null);
    try {
      await apiPost(`/bounties/${campaign.id}/join`);
      setJoined(true);
      onJoined(campaign.id);
    } catch (err: any) {
      setJoinError(err.message ?? "Failed to join. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: "rgb(0 0 0 / 0.7)", backdropFilter: "blur(8px)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-white/[0.08]"
          style={{ background: "rgb(var(--bg-card))" }}>
          <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />

          {campaign.cover_image_url && !imgFailed ? (
            <div className="relative h-40 sm:h-48 overflow-hidden rounded-t-2xl">
              <img src={campaign.cover_image_url} alt="" className="w-full h-full object-cover"
                onError={() => setImgFailed(true)} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgb(var(--bg-card)))" }} />
              <button onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-end p-4">
              <button onClick={onClose} className="w-8 h-8 rounded-full border border-white/[0.08] bg-bg-elevated flex items-center justify-center text-fg-tertiary hover:text-fg-primary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="p-5 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-bg-elevated border border-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
                {campaign.token_icon ? (
                  <img src={campaign.token_icon} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[16px] font-bold text-fg-secondary">{campaign.project_name.charAt(0)}</span>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-[17px] font-semibold text-fg-primary">{campaign.project_name}</h3>
                <p className="text-[13px] text-fg-tertiary leading-relaxed mt-0.5">{campaign.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Wallet, label: "Reward",      value: fmt(campaign.reward_usdc ?? 0) + " USDC" },
                { icon: Users,  label: "Participants", value: String(campaign.stats?.participantCount ?? 0) },
                { icon: Wallet, label: "Prize Pool",   value: fmt(campaign.total_budget_usdc ?? 0) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl bg-bg-elevated border border-white/[0.06] p-3">
                  <Icon className="w-3.5 h-3.5 text-fg-tertiary mb-1.5" />
                  <p className="text-[14px] font-semibold text-fg-primary">{value}</p>
                  <p className="text-[10.5px] text-fg-tertiary">{label}</p>
                </div>
              ))}
            </div>

            {campaign.total_budget_usdc > 0 && (
              <div>
                <div className="flex justify-between text-[11.5px] text-fg-tertiary mb-1.5">
                  <span>{fmt(campaign.spent_usdc ?? 0)} distributed</span>
                  <span>{budgetPct}% filled</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${budgetPct}%` }} />
                </div>
              </div>
            )}

            {campaign.required_hashtags?.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-[12px] text-fg-tertiary mb-2">
                  <Hash className="w-3.5 h-3.5" />
                  <span>Required in caption</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {campaign.required_hashtags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full text-[12px] border border-brand/25 bg-brand/10 text-brand">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {campaign.required_keywords?.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-[12px] text-fg-tertiary mb-2">
                  <Mic className="w-3.5 h-3.5" />
                  <span>Must say in the video</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {campaign.required_keywords.map((kw) => (
                    <span key={kw} className="px-2.5 py-1 rounded-full text-[12px] border border-white/[0.08] bg-bg-elevated text-fg-secondary">{kw}</span>
                  ))}
                </div>
              </div>
            )}

            {joinError && (
              <p className="text-[12.5px] text-danger text-center">{joinError}</p>
            )}

            <button onClick={handleJoin} disabled={joining || joined}
              className={cn(
                "w-full py-3 rounded-xl text-[13.5px] font-semibold transition-all",
                joined
                  ? "border border-success/30 text-success"
                  : "text-white disabled:opacity-50"
              )}
              style={{
                background: joined ? "rgb(var(--success)/0.1)" : "rgb(74 125 255)",
              }}>
              {joined ? "✓ Joined Campaign" : joining ? "Joining..." : "Join Campaign"}
            </button>

            {!hasTikTok && !joined && (
              <p className="text-[12px] text-center text-warning">
                ⚠ Connect TikTok first to participate
              </p>
            )}
          </div>
        </div>
      </div>

      {showTikTokGate && <TikTokGateModal onClose={() => setShowTikTokGate(false)} />}
    </>
  );
}

function CampaignCard({ campaign, joined, onClick }: {
  campaign: Campaign; joined: boolean; onClick: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const budgetPct = campaign.total_budget_usdc > 0
    ? Math.min(100, Math.round(((campaign.spent_usdc ?? 0) / campaign.total_budget_usdc) * 100))
    : 0;

  return (
    <button onClick={onClick}
      className="relative w-full text-left overflow-hidden rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all group"
      style={{ background: "rgb(var(--bg-card))" }}>

      <div className="relative h-[140px] overflow-hidden">
        {campaign.cover_image_url && !imgFailed ? (
          <img src={campaign.cover_image_url} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            onError={() => setImgFailed(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgb(74 125 255 / 0.15), rgb(140 100 255 / 0.1))" }}>
            <span className="text-[32px] font-bold text-white/20">{campaign.project_name.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgb(var(--bg-card)))" }} />

        {/* Joined badge */}
        {joined && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-success/30 bg-[rgb(var(--success)/0.15)] text-success backdrop-blur-sm">
            ✓ Joined
          </div>
        )}

        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-black/60 border border-white/[0.15] flex items-center justify-center overflow-hidden backdrop-blur-sm">
            {campaign.token_icon ? (
              <img src={campaign.token_icon} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[12px] font-bold text-white">{campaign.project_name.charAt(0)}</span>
            )}
          </div>
          <span className="text-[13px] font-semibold text-white drop-shadow">{campaign.project_name}</span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-[12.5px] text-fg-tertiary line-clamp-2 min-h-[36px]">{campaign.description || "No description provided."}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
          <div>
            <p className="text-[15px] font-semibold text-fg-primary">{fmt(campaign.reward_usdc ?? 0)}</p>
            <p className="text-[10.5px] text-fg-tertiary">Per creator</p>
          </div>
          <div className="text-right">
            <p className="text-[15px] font-semibold text-fg-primary">{campaign.stats?.participantCount ?? 0}</p>
            <p className="text-[10.5px] text-fg-tertiary">Participants</p>
          </div>
          <div className="text-right">
            <p className="text-[15px] font-semibold text-gradient">{fmt(campaign.total_budget_usdc ?? 0)}</p>
            <p className="text-[10.5px] text-fg-tertiary">Prize pool</p>
          </div>
        </div>
        <div className="mt-3 h-1 rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-brand" style={{ width: `${budgetPct}%` }} />
        </div>
      </div>
    </button>
  );
}

// tab prop comes from the parent Explore page (Active / Past toggle)
export function ExploreCampaigns({ tab }: { tab: "active" | "past" }) {
  const { session } = useAuth();
  const [campaigns,    setCampaigns]    = useState<Campaign[]>([]);
  const [joinedIds,    setJoinedIds]    = useState<Set<string>>(new Set());
  const [loading,      setLoading]      = useState(true);
  const [selected,     setSelected]     = useState<Campaign | null>(null);
  const [hasTikTok,    setHasTikTok]    = useState(false);

  useEffect(() => {
    apiGet<{ campaigns: Campaign[] }>(`/bounties?tab=${tab}`)
      .then((d) => setCampaigns(d.campaigns ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));

    if (session) {
      apiGet<{ connected: boolean }>("/me/tiktok-status")
        .then((d) => setHasTikTok(d.connected))
        .catch(() => setHasTikTok(false));

      // Fetch campaigns this user has already joined
      apiGet<{ joinedIds: string[] }>("/me/joined-campaigns")
        .then((d) => setJoinedIds(new Set(d.joinedIds ?? [])))
        .catch(() => {});
    }
  }, [session, tab]);

  const handleJoined = (id: string) => {
    setJoinedIds((prev) => new Set([...prev, id]));
    // Update participant count optimistically
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, stats: { participantCount: (c.stats?.participantCount ?? 0) + 1 } }
          : c
      )
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3].map((i) => (
          <div key={i} className="h-[280px] rounded-2xl border border-white/[0.06] animate-pulse"
            style={{ background: "rgb(var(--bg-card))" }} />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] min-h-[200px] flex flex-col items-center justify-center gap-3"
        style={{ background: "rgb(var(--bg-card))" }}>
        <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
        <p className="text-[14px] font-medium text-fg-primary">
          {tab === "active" ? "No active campaigns" : "No past campaigns"}
        </p>
        <p className="text-[13px] text-fg-tertiary">
          {tab === "active" ? "New campaigns will appear here when they go live." : "Completed campaigns will appear here."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((c) => (
          <CampaignCard
            key={c.id} campaign={c}
            joined={joinedIds.has(c.id)}
            onClick={() => setSelected(c)}
          />
        ))}
      </div>

      {selected && (
        <CampaignModal
          campaign={selected}
          hasTikTok={hasTikTok}
          alreadyJoined={joinedIds.has(selected.id)}
          onClose={() => setSelected(null)}
          onJoined={handleJoined}
        />
      )}
    </>
  );
}