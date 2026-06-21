import { cn } from "@/lib/cn";
import { BadgeGlyph } from "@/components/icons/BadgeIcon";
import type { BadgeState } from "@/lib/types";

interface BadgeTileProps {
  badge: BadgeState;
  claiming: boolean;
  onClaim: (id: string) => void;
}

const THEME_RING: Record<BadgeState["theme"], string> = {
  ember: "rgb(232 80 64 / 0.18)",
  violet: "rgb(110 124 255 / 0.18)",
};

function BadgeTile({ badge, claiming, onClaim }: BadgeTileProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-4 md:p-5 flex items-center gap-4"
      style={{ background: "rgb(var(--bg-elevated))" }}
    >
      <div
        className="relative shrink-0 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full"
        style={{ background: THEME_RING[badge.theme] }}
      >
        <BadgeGlyph theme={badge.theme} size={34} glow={badge.attained} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-fg-primary truncate">{badge.name}</p>
        <p className="text-[11.5px] text-fg-tertiary mt-0.5 leading-snug line-clamp-2">{badge.description}</p>

        <div className="mt-2.5">
          {badge.attained ? (
            <span className="inline-flex items-center px-3 py-1 rounded-lg text-[11.5px] font-medium bg-white/[0.06] text-fg-secondary">
              Attained
            </span>
          ) : (
            <button
              onClick={() => onClaim(badge.id)}
              disabled={!badge.eligible || claiming}
              className={cn(
                "inline-flex items-center px-3 py-1.5 rounded-lg text-[11.5px] font-semibold transition-opacity",
                "bg-white text-[#0a0c12] disabled:opacity-40"
              )}
            >
              {claiming ? "Claiming..." : "Claim Badge"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface BadgesCardProps {
  badges: BadgeState[];
  claimingId: string | null;
  onClaim: (id: string) => void;
}

/**
 * "Verified Badge for Creators" panel — sits in the same slot the old
 * static badge cards occupied. Reference: IMG_0085 (desktop, unclaimed)
 * and IMG_3069 (mobile, attained state).
 */
export function BadgesCard({ badges, claimingId, onClaim }: BadgesCardProps) {
  const anyAttained = badges.some((b) => b.attained);

  return (
    <div
      className="relative overflow-hidden rounded-card border border-white/[0.06] p-5 md:p-6 h-full flex flex-col"
      style={{ background: "rgb(var(--bg-card))" }}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />

      <p className="text-[12.5px] text-fg-tertiary">
        {anyAttained ? "Claim your creator badge." : "Claim your creator badge."}
      </p>
      <h3 className="mt-1 font-display font-medium text-[20px] md:text-[22px] text-fg-primary tracking-[-0.01em]">
        Verified Badge for Creators
      </h3>

      <div className="mt-4 flex flex-col gap-3 flex-1">
        {badges.map((badge) => (
          <BadgeTile key={badge.id} badge={badge} claiming={claimingId === badge.id} onClaim={onClaim} />
        ))}
      </div>
    </div>
  );
}
