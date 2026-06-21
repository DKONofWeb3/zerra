import { BadgeGlyph } from "@/components/icons/BadgeIcon";
import type { BadgeState } from "@/lib/types";

const THEME_TEXT: Record<BadgeState["theme"], string> = {
  ember: "rgb(255 150 130)",
  violet: "rgb(150 160 255)",
};
const THEME_BG: Record<BadgeState["theme"], string> = {
  ember: "rgb(232 80 64 / 0.12)",
  violet: "rgb(110 124 255 / 0.12)",
};

/**
 * Small attained-badge pills shown beside "All Activity Update" once a
 * user has claimed at least one badge — reference: IMG_3069 / IMG_0085
 * top header row ("Early Adopter" / "Verified Influencer" chips).
 */
export function AttainedBadgePills({ badges }: { badges: BadgeState[] }) {
  const attained = badges.filter((b) => b.attained);
  if (!attained.length) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {attained.map((badge) => (
        <span
          key={badge.id}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium"
          style={{ background: THEME_BG[badge.theme], color: THEME_TEXT[badge.theme] }}
        >
          <BadgeGlyph theme={badge.theme} size={14} glow={false} />
          {badge.shortLabel}
        </span>
      ))}
    </div>
  );
}
