// src/pages/Project/Participants/index.tsx
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { apiGet } from "@/lib/api/client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useSearchParams, Link } from "react-router-dom";

interface Participant {
  created_at: string;
  users: { name: string | null; avatar: string | null; email: string } | null;
  social_accounts: { username: string | null }[] | null;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ProjectParticipantsPage() {
  usePageTitle("Zerra Project · Participants");
  const [params] = useSearchParams();
  const campaignId = params.get("campaignId");

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    if (!campaignId) { setLoading(false); return; }
    apiGet<{ participants: Participant[]; total: number }>(`/project/participants?campaignId=${campaignId}`)
      .then((d) => { setParticipants(d.participants ?? []); setTotal(d.total); })
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
          <span className="text-[12.5px]">{total} total joined</span>
        </div>
        <h2 className={cn(
          "mt-4 font-display font-medium tracking-[-0.03em] leading-[0.95]",
          "text-[32px] md:text-[52px]",
          "bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-[#7d8aa8]"
        )}>
          Participants
        </h2>
      </div>

      {/* Growth summary */}
      {participants.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {(() => {
            const now = Date.now();
            const last24h  = participants.filter(p => now - new Date(p.created_at).getTime() < 86400000).length;
            const last7d   = participants.filter(p => now - new Date(p.created_at).getTime() < 604800000).length;
            return [
              { label: "Last 24h",  value: last24h },
              { label: "Last 7 days", value: last7d },
              { label: "All time",  value: total },
            ];
          })().map(({ label, value }) => (
            <div key={label} className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-4"
              style={{ background: "rgb(var(--bg-card))" }}>
              <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
              <p className="text-[22px] font-display font-medium text-gradient">{value}</p>
              <p className="text-[11px] text-fg-tertiary mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-14 rounded-xl border border-white/[0.06] animate-pulse"
              style={{ background: "rgb(var(--bg-card))" }} />
          ))}
        </div>
      ) : participants.length > 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] px-4 md:px-5 py-1"
          style={{ background: "rgb(var(--bg-card))" }}>
          <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
          {participants.map((p, i) => {
            const handle = p.social_accounts?.[0]?.username;
            return (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-bg-elevated border border-white/[0.06] shrink-0">
                  {p.users?.avatar ? (
                    <img src={p.users.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[13px] font-semibold text-fg-secondary">
                      {(p.users?.name ?? "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-medium text-fg-primary truncate">
                    {p.users?.name ?? "Creator"}
                  </p>
                  {handle && <p className="text-[12px] text-fg-tertiary">@{handle}</p>}
                </div>
                <p className="text-[12px] text-fg-tertiary tabular-nums shrink-0">
                  {timeAgo(p.created_at)}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] p-10 text-center"
          style={{ background: "rgb(var(--bg-card))" }}>
          <p className="text-[14px] text-fg-tertiary">No participants yet.</p>
          <p className="text-[12px] text-fg-muted mt-1">Creators who join this campaign will appear here.</p>
        </div>
      )}
    </div>
  );
}