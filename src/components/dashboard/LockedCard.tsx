import { Lock } from "lucide-react";

interface LockedCardProps {
  title: string;
  note?: string;
}

/**
 * Honest empty state for analytics sections we can't back with real
 * data yet (no Instagram/YouTube connected, no audience-demographics
 * source from TikTok's API at our current integration level).
 * Shows "Coming soon" rather than fabricating numbers or pretending
 * a "Connect" flow exists when there's nothing to connect to.
 */
export function LockedCard({ title, note }: LockedCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-card border border-white/[0.06] p-5 flex flex-col items-center justify-center text-center gap-3 min-h-[220px]"
      style={{ background: "rgb(var(--bg-card))" }}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />

      <div className="w-10 h-10 rounded-xl border border-white/[0.06] bg-bg-elevated flex items-center justify-center">
        <Lock className="w-4 h-4 text-fg-muted" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-[13.5px] font-medium text-fg-secondary">{title}</p>
        <p className="text-[11.5px] text-fg-muted mt-1">{note ?? "Coming soon"}</p>
      </div>
    </div>
  );
}
