import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { apiGet, apiPut } from "@/lib/api/client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "react-router-dom";
import { MoreVertical, Pause, Play, Trash2, CheckCircle } from "lucide-react";

interface Campaign {
  id: string;
  project_name: string;
  description: string;
  status: "draft" | "active" | "paused" | "completed" | "deleted";
  required_hashtags: string[];
  required_keywords: string[];
  reward_usdc: number;
  total_budget_usdc: number;
  spent_usdc: number;
  created_at: string;
  projects?: { name: string; logo_url: string | null };
  stats: { participantCount: number; verifiedVideos: number; eligibleVideos: number };
}

const STATUS_STYLE: Record<string, string> = {
  draft:     "text-fg-tertiary border-white/[0.08] bg-bg-elevated",
  active:    "text-success border-success/30 bg-[rgb(var(--success)/0.08)]",
  paused:    "text-warning border-warning/30 bg-[rgb(var(--warning)/0.08)]",
  completed: "text-brand border-brand/30 bg-brand/10",
  deleted:   "text-danger border-danger/30 bg-[rgb(var(--danger)/0.08)]",
};

function CampaignActionsMenu({ campaign, onAction }: { campaign: Campaign; onAction: (id: string, status: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen((p) => !p)}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-fg-tertiary hover:text-fg-primary hover:bg-white/[0.04] transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl border border-white/[0.08] overflow-hidden"
            style={{ background: "rgb(10 12 20)" }}>
            {campaign.status !== "active" && (
              <button onClick={() => { onAction(campaign.id, "active"); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left text-[12.5px] text-fg-secondary hover:bg-white/[0.04] hover:text-fg-primary transition-colors">
                <Play className="w-3.5 h-3.5" /> Activate
              </button>
            )}
            {campaign.status === "active" && (
              <button onClick={() => { onAction(campaign.id, "paused"); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left text-[12.5px] text-fg-secondary hover:bg-white/[0.04] hover:text-fg-primary transition-colors">
                <Pause className="w-3.5 h-3.5" /> Pause
              </button>
            )}
            <button onClick={() => { onAction(campaign.id, "completed"); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left text-[12.5px] text-fg-secondary hover:bg-white/[0.04] hover:text-fg-primary transition-colors">
              <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
            </button>
            <button onClick={() => { if (confirm("Delete this campaign? This cannot be undone.")) { onAction(campaign.id, "deleted"); } setOpen(false); }}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left text-[12.5px] text-danger hover:bg-[rgb(var(--danger)/0.08)] transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CampaignCard({ campaign, onAction }: { campaign: Campaign; onAction: (id: string, status: string) => void }) {
  const spentPct = campaign.total_budget_usdc > 0
    ? Math.min(100, Math.round((campaign.spent_usdc / campaign.total_budget_usdc) * 100))
    : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-4 md:p-5" style={{ background: "rgb(var(--bg-card))" }}>
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
            {campaign.projects?.logo_url ? (
              <img src={campaign.projects.logo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[14px] font-bold text-fg-secondary">{campaign.project_name?.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-fg-primary truncate">{campaign.project_name}</p>
            <p className="text-[12px] text-fg-tertiary truncate">{campaign.description || "No description"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-medium border capitalize", STATUS_STYLE[campaign.status])}>
            {campaign.status}
          </span>
          <CampaignActionsMenu campaign={campaign} onAction={onAction} />
        </div>
      </div>

      {/* Hashtags */}
      <div className="relative flex flex-wrap gap-1.5 mt-3.5">
        {(campaign.required_hashtags ?? []).map((tag) => (
          <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full border border-brand/25 bg-brand/10 text-brand">{tag}</span>
        ))}
      </div>

      {/* Stats row */}
      <div className="relative grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/[0.04]">
        <div>
          <p className="text-[15px] font-semibold text-fg-primary">{campaign.stats.participantCount}</p>
          <p className="text-[10.5px] text-fg-tertiary">Participants</p>
        </div>
        <div>
          <p className="text-[15px] font-semibold text-fg-primary">{campaign.stats.eligibleVideos}</p>
          <p className="text-[10.5px] text-fg-tertiary">Eligible Videos</p>
        </div>
        <div>
          <p className="text-[15px] font-semibold text-fg-primary">${campaign.reward_usdc ?? 0}</p>
          <p className="text-[10.5px] text-fg-tertiary">Reward/Creator</p>
        </div>
      </div>

      {/* Budget bar */}
      {campaign.total_budget_usdc > 0 && (
        <div className="relative mt-3">
          <div className="flex items-center justify-between text-[11px] text-fg-tertiary mb-1.5">
            <span>${campaign.spent_usdc?.toFixed(0) ?? 0} spent</span>
            <span>${campaign.total_budget_usdc.toFixed(0)} budget</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${spentPct}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCampaignsPage() {
  usePageTitle("Zerra Admin · Campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchCampaigns = () => {
    setLoading(true);
    apiGet<{ campaigns: Campaign[] }>("/admin/campaigns")
      .then((d) => setCampaigns(d.campaigns ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleAction = async (id: string, status: string) => {
    try {
      await apiPut(`/admin/campaigns/${id}/status`, { status });
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = filter === "all" ? campaigns : campaigns.filter((c) => c.status === filter);

  return (
    <div className="pb-12 space-y-6 md:space-y-8">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">{campaigns.length} total campaigns</span>
        </div>
        <div className="flex items-center justify-between gap-3 mt-4">
          <h2 className={cn(
            "font-display font-medium tracking-[-0.03em] leading-[0.95]",
            "text-[36px] md:text-[56px]",
            "bg-clip-text text-transparent",
            "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
          )}>
            Campaigns
          </h2>
          <Link to="/admin/campaigns/new"
            className="shrink-0 px-3.5 md:px-5 py-2 md:py-2.5 rounded-xl text-[12.5px] md:text-[13.5px] font-semibold text-white whitespace-nowrap"
            style={{ background: "rgb(74 125 255)" }}>
            + New
          </Link>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {["all", "active", "paused", "draft", "completed"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn(
              "shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium border capitalize transition-colors",
              filter === s ? "border-brand/40 bg-brand/10 text-brand" : "border-white/[0.06] bg-bg-elevated text-fg-tertiary"
            )}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="h-[200px] rounded-2xl border border-white/[0.06] animate-pulse" style={{ background: "rgb(var(--bg-card))" }} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((c) => <CampaignCard key={c.id} campaign={c} onAction={handleAction} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] p-10 text-center" style={{ background: "rgb(var(--bg-card))" }}>
          <p className="text-[14px] text-fg-tertiary">No campaigns {filter !== "all" ? `with status "${filter}"` : "yet"}.</p>
        </div>
      )}
    </div>
  );
}