/**
 * Small circular USDC coin icon shown inline before bounty amounts.
 */
export function UsdcCoinIcon({
  size = 14,
  className = "",
}: {
  size?: number;
  className?: string;
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
      <circle cx="7" cy="7" r="7" fill="#2775CA" />
      <path
        d="M7 3.2c.55 0 1 .45 1 1v.32c.92.27 1.6 1.12 1.6 2.13h-.96c0-.66-.53-1.2-1.2-1.2h-.88c-.4 0-.72.32-.72.72 0 .35.25.65.6.71l1.5.27c.81.15 1.4.86 1.4 1.69 0 .87-.64 1.6-1.48 1.74V11c0 .55-.45 1-1 1s-1-.45-1-1v-.32c-.92-.27-1.6-1.12-1.6-2.13h.96c0 .66.54 1.2 1.2 1.2h.88c.4 0 .72-.32.72-.72 0-.35-.25-.65-.6-.71l-1.5-.27a1.72 1.72 0 0 1-1.4-1.69c0-.87.64-1.6 1.48-1.74V4.2c0-.55.45-1 1-1Z"
        fill="white"
      />
    </svg>
  );
}
