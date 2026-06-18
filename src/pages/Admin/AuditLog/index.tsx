import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { apiGet } from "@/lib/api/client";
import { usePageTitle } from "@/hooks/usePageTitle";

interface AuditAction {
  id: string;
  admin_id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  reason: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  users?: { name: string | null; email: string };
}

const ACTION_STYLE: Record<string, string> = {
  ban_user:        "text-danger border-danger/30 bg-[rgb(var(--danger)/0.08)]",
  restrict_user:   "text-warning border-warning/30 bg-[rgb(var(--warning)/0.08)]",
  unban_user:      "text-success border-success/30 bg-[rgb(var(--success)/0.08)]",
  pause_campaign:  "text-warning border-warning/30 bg-[rgb(var(--warning)/0.08)]",
  resume_campaign: "text-success border-success/30 bg-[rgb(var(--success)/0.08)]",
  delete_campaign: "text-danger border-danger/30 bg-[rgb(var(--danger)/0.08)]",
  create_campaign: "text-brand border-brand/30 bg-brand/10",
  create_project:  "text-brand border-brand/30 bg-brand/10",
};

function formatAction(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AdminAuditLogPage() {
  usePageTitle("Zerra Admin · Audit Log");
  const [actions, setActions] = useState<AuditAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ actions: AuditAction[] }>("/admin/audit-log")
      .then((d) => setActions(d.actions ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-12 space-y-6 md:space-y-8">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">All admin actions, newest first</span>
        </div>
        <h2 className={cn(
          "mt-4 font-display font-medium tracking-[-0.03em] leading-[0.95]",
          "text-[36px] md:text-[56px]",
          "bg-clip-text text-transparent",
          "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
        )}>
          Audit Log
        </h2>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-[72px] rounded-xl border border-white/[0.06] animate-pulse"
              style={{ background: "rgb(var(--bg-card))" }} />
          ))}
        </div>
      ) : actions.length > 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] px-4 md:px-5 py-1"
          style={{ background: "rgb(var(--bg-card))" }}>
          <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
          {actions.map((a) => (
            <div key={a.id} className="relative flex items-start gap-3 py-3.5 border-b border-white/[0.04] last:border-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[11px] font-medium border capitalize shrink-0",
                    ACTION_STYLE[a.action_type] ?? "text-fg-tertiary border-white/[0.08] bg-bg-elevated"
                  )}>
                    {formatAction(a.action_type)}
                  </span>
                  <span className="text-[12px] text-fg-tertiary capitalize">{a.target_type}</span>
                </div>
                {a.reason && (
                  <p className="text-[12px] text-fg-tertiary mt-1 truncate">Reason: {a.reason}</p>
                )}
                <p className="text-[11.5px] text-fg-muted mt-0.5">
                  By {a.users?.name ?? a.users?.email ?? "Admin"} · {timeAgo(a.created_at)}
                </p>
              </div>
              <p className="text-[11px] text-fg-muted tabular-nums shrink-0 hidden sm:block">
                {new Date(a.created_at).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] p-10 text-center"
          style={{ background: "rgb(var(--bg-card))" }}>
          <p className="text-[14px] text-fg-tertiary">No admin actions recorded yet.</p>
        </div>
      )}
    </div>
  );
}