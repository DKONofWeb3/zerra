import { cn } from "@/lib/cn";
import { BadgeGlyph } from "@/components/icons/BadgeIcon";
import type { BadgeState } from "@/lib/types";

interface BadgeTileProps {
  badge: BadgeState;
  claiming: boolean;
  onClaim: (id: string) => void;
  /** "compact" stacks icon-above-text in a narrower card, for the desktop side-by-side pair inside BadgesPanel.
   *  Default ("row") keeps the existing icon-left/text-right horizontal layout — unchanged for BadgeTilesRow. */
  layout?: "row" | "compact";
}

const THEME_RING: Record<BadgeState["theme"], string> = {
  ember: "rgb(232 80 64 / 0.18)",
  violet: "rgb(110 124 255 / 0.18)",
};

/** A single badge tile — icon, name, description, Claim/Attained state. Reused by both layout wrappers below. */
function BadgeTile({ badge, claiming, onClaim, layout = "row" }: BadgeTileProps) {
  if (layout === "compact") {
    return (
      <div
        className="relative overflow-hidden rounded-xl p-3.5 flex items-center gap-3"
        style={{ background: "rgb(15 16 20)" }}
      >
        <div
          className="relative shrink-0 w-11 h-11 flex items-center justify-center rounded-full"
          style={{ background: THEME_RING[badge.theme] }}
        >
          <BadgeGlyph theme={badge.theme} size={28} glow={badge.attained} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[12.5px] font-medium text-fg-primary leading-snug truncate">{badge.name}</p>
          <p className="text-[10.5px] text-fg-tertiary mt-0.5 leading-snug line-clamp-2">
            {badge.attained ? (badge.attainedDescription ?? badge.description) : badge.description}
          </p>

          <div className="mt-2">
            {badge.attained ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10.5px] font-medium bg-white/[0.06] text-fg-secondary">
                Attained
              </span>
            ) : badge.eligible ? (
              <button
                onClick={() => onClaim(badge.id)}
                disabled={claiming}
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10.5px] font-semibold bg-white text-[#0a0c12] disabled:opacity-40 transition-opacity"
              >
                {claiming ? "Claiming..." : "Claim Badge"}
              </button>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10.5px] font-medium bg-white/[0.04] text-fg-muted">
                Locked
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

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
  /** "desktop-paired": dark-blue gradient surface, two compact tiles side by side (fic.jpg).
   *  Default: flat surface, tiles stacked full-width (original mobile/unclaimed behavior — unchanged). */
  variant?: "default" | "desktop-paired";
}

/**
 * Wrapped "Verified Badge for Creators" panel — used ONLY while no badge
 * has been attained yet, rendered as the second column inside the hero
 * card. Reference: IMG_0085 (unclaimed state, default variant) and
 * fic.jpg (desktop-paired variant: dark-blue gradient surface, two
 * compact tiles side by side instead of stacked).
 */
export function BadgesPanel({ badges, claimingId, onClaim, variant = "default" }: BadgesPanelProps) {
  const paired = variant === "desktop-paired";

  return (
    <div
      className="relative overflow-hidden rounded-card p-5 md:p-6 h-full flex flex-col"
      style={{
        background: paired
          ? "linear-gradient(165deg, rgb(15 21 46) 0%, rgb(8 12 28) 100%)"
          : "rgb(var(--bg-card))",
        border: paired ? "none" : "1px solid rgb(255 255 255 / 0.06)",
      }}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />

      <p className="text-[12.5px] text-fg-tertiary">Claim your creator badge.</p>
      <h3 className="mt-1 font-display font-medium text-[20px] md:text-[22px] text-fg-primary tracking-[-0.01em]">
        Verified Badge for Creators
      </h3>

      <div className={cn("mt-4 flex-1", paired ? "grid grid-cols-2 gap-3.5" : "flex flex-col gap-3")}>
        {badges.map((badge) => (
          <BadgeTile
            key={badge.id}
            badge={badge}
            claiming={claimingId === badge.id}
            onClaim={onClaim}
            layout={paired ? "compact" : "row"}
          />
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
 * Reference: 441995.jpg / mobile.jpg (attained state). UNCHANGED this
 * round — uses the default "row" BadgeTile layout exactly as before.
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