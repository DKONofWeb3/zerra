/**
 * The "Last Update" / "Live Update" diamond gem indicator.
 * A small faceted crystal icon used as a meta-label marker.
 */
export function DiamondIcon({
  className = "",
  size = 14,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="gem-grad" x1="7" y1="0" x2="7" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgb(var(--brand-glow))" stopOpacity="0.95" />
          <stop offset="1" stopColor="rgb(var(--brand))" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="gem-shine" x1="3" y1="2" x2="7" y2="7" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="white" stopOpacity="0.7" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* outer diamond */}
      <path
        d="M7 0.5 L13.5 7 L7 13.5 L0.5 7 Z"
        fill="url(#gem-grad)"
        stroke="rgb(var(--brand-glow))"
        strokeWidth="0.5"
      />
      {/* upper-left facet shine */}
      <path
        d="M7 0.5 L13.5 7 L7 7 Z"
        fill="url(#gem-shine)"
        opacity="0.6"
      />
      {/* center horizontal facet line */}
      <path
        d="M0.5 7 L13.5 7"
        stroke="white"
        strokeOpacity="0.25"
        strokeWidth="0.5"
      />
    </svg>
  );
}
