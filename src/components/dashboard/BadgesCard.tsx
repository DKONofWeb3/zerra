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

/** A single badge tile — icon, name, description, Claim/Attained state. Reused by both layout wrappers below. */
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
        <p className="text-[11.5px] text-fg-tertiary mt-0.5 leading-snug line-clamp-2">
          {badge.attained ? (badge.attainedDescription ?? badge.description) : badge.description}
        </p>

        <div className="mt-2.5">
          {badge.attained ? (
            <span className="inline-flex items-center px-3 py-1 rounded-lg text-[11.5px] font-medium bg-white/[0.06] text-fg-secondary">
              Attained
            </span>
          ) : badge.eligible ? (
            <button
              onClick={() => onClaim(badge.id)}
              disabled={claiming}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-[11.5px] font-semibold bg-white text-[#0a0c12] disabled:opacity-40 transition-opacity"
            >
              {claiming ? "Claiming..." : "Claim Badge"}
            </button>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-lg text-[11.5px] font-medium bg-white/[0.04] text-fg-muted">
              Locked
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface BadgesPanelProps {
  badges: BadgeState[];
  claimingId: string | null;
  onClaim: (id: string) => void;
}

/**
 * Wrapped "Verified Badge for Creators" panel — used ONLY while no badge
 * has been attained yet, rendered as the second column inside the hero
 * card. Reference: IMG_0085 (unclaimed state).
 */
export function BadgesPanel({ badges, claimingId, onClaim }: BadgesPanelProps) {
  return (
    <div
      className="relative overflow-hidden rounded-card border border-white/[0.06] p-5 md:p-6 h-full flex flex-col"
      style={{ background: "rgb(var(--bg-card))" }}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />

      <p className="text-[12.5px] text-fg-tertiary">Claim your creator badge.</p>
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

interface BadgeTilesRowProps {
  badges: BadgeState[];
  claimingId: string | null;
  onClaim: (id: string) => void;
}

/**
 * Bare side-by-side badge tiles, no wrapper panel — used once at least
 * one badge is attained, rendered as its own row BELOW the hero card.
 * Reference: 441995.jpg / mobile.jpg (attained state).
 */
export function BadgeTilesRow({ badges, claimingId, onClaim }: BadgeTilesRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
      {badges.map((badge) => (
        <BadgeTile key={badge.id} badge={badge} claiming={claimingId === badge.id} onClaim={onClaim} />
      ))}
    </div>
  );
}