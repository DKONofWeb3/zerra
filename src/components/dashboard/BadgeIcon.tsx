/**
 * The two badge images used across the dashboard's claim flow.
 * Replaced the earlier hand-drawn SVG approximations with the real
 * badge artwork provided by the founder — same files used everywhere
 * a badge renders, small (card row) or large (claim modal).
 */

const BADGE_SRC: Record<"ember" | "violet", string> = {
  ember: "/badges/early-creator.png",
  violet: "/badges/verified-influencer.png",
};

const BADGE_ALT: Record<"ember" | "violet", string> = {
  ember: "Early Creator badge",
  violet: "Verified Influencer badge",
};

export function BadgeGlyph({
  theme, size = 56, glow = true,
}: { theme: "ember" | "violet"; size?: number; glow?: boolean }) {
  const glowColor = theme === "ember" ? "rgb(232 100 90 / 0.45)" : "rgb(110 124 255 / 0.5)";
  return (
    <span
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      {glow && (
        <span
          aria-hidden
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size * 1.5,
            height: size * 1.5,
            background: `radial-gradient(circle, ${glowColor}, transparent 70%)`,
          }}
        />
      )}
      <img
        src={BADGE_SRC[theme]}
        alt={BADGE_ALT[theme]}
        width={size}
        height={size}
        className="relative object-contain"
        style={{ width: size, height: size }}
      />
    </span>
  );
}