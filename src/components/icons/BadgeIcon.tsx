/**
 * The two badge glyphs used across the dashboard's claim flow:
 *  - "ember"  → scalloped ribbon seal with a "1" ribbon, for Early Creator
 *  - "violet" → circular verified checkmark, for Influencer Badge
 * Both render at any size and carry their own glow so they read
 * correctly whether shown small (card row) or large (claim modal).
 */

export function EmberSealIcon({ size = 56, glow = true }: { size?: number; glow?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="ember-fill" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff8a7a" />
          <stop offset="1" stopColor="#e8504f" />
        </linearGradient>
        <radialGradient id="ember-glow" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#ff6b5e" stopOpacity={glow ? 0.55 : 0} />
          <stop offset="100%" stopColor="#ff6b5e" stopOpacity="0" />
        </radialGradient>
      </defs>
      {glow && <circle cx="32" cy="32" r="32" fill="url(#ember-glow)" />}
      {/* 12-point scalloped seal */}
      <path
        d="M32 2 L37.5 8.5 L45.5 6 L48 14 L56 16.5 L54.5 24.7 L61 30 L56 37 L60 44 L52.3 47.3 L52 56 L43.7 55 L40 62 L32 57.5 L24 62 L20.3 55 L12 56 L11.7 47.3 L4 44 L8 37 L3 30 L9.5 24.7 L8 16.5 L16 14 L18.5 6 L26.5 8.5 Z"
        fill="url(#ember-fill)"
        stroke="#ffffff"
        strokeOpacity="0.25"
        strokeWidth="0.75"
      />
      <circle cx="32" cy="27" r="14" fill="#ffffff" fillOpacity="0.14" />
      <circle cx="32" cy="27" r="14" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.5" fill="none" />
      {/* ribbon "1" */}
      <path d="M30 21h2.4v12H30z" fill="#ffffff" />
      <path d="M30 21l-2.6 1.9V25l2.6-1.7z" fill="#ffffff" />
    </svg>
  );
}

export function VerifiedSealIcon({ size = 56, glow = true }: { size?: number; glow?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <radialGradient id="violet-glow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#6e7cff" stopOpacity={glow ? 0.6 : 0} />
          <stop offset="100%" stopColor="#6e7cff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="violet-fill" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7d8cff" />
          <stop offset="1" stopColor="#4f5fe0" />
        </linearGradient>
      </defs>
      {glow && <circle cx="32" cy="32" r="32" fill="url(#violet-glow)" />}
      <circle cx="32" cy="32" r="26" fill="url(#violet-fill)" />
      <circle cx="32" cy="32" r="26" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1" fill="none" />
      {/* scalloped seal edge, subtle */}
      <path
        d="M32 6 L36 10 L41.5 8.3 L43 14 L48.7 15.5 L47 21 L51 25 L47 29 L51 35 L45.4 36.8 L44.5 42.7 L38.6 41.5 L36 47 L32 43.5 L28 47 L25.4 41.5 L19.5 42.7 L18.6 36.8 L13 35 L17 29 L13 25 L17 21 L15.3 15.5 L21 14 L22.5 8.3 L28 10 Z"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.12"
        strokeWidth="1"
      />
      {/* check mark */}
      <path
        d="M23.5 32.5l5.5 5.5 11.5-12.5"
        stroke="#ffffff"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function BadgeGlyph({
  theme, size = 56, glow = true,
}: { theme: "ember" | "violet"; size?: number; glow?: boolean }) {
  return theme === "ember"
    ? <EmberSealIcon size={size} glow={glow} />
    : <VerifiedSealIcon size={size} glow={glow} />;
}
