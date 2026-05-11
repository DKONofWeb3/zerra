import type { Platform } from "@/lib/types";

interface PlatformIconProps {
  platform: Platform;
  size?: number;
  className?: string;
}

/**
 * Small inline SVG glyphs for the supported social platforms. Used in
 * the Top Creators table and Top Performing Content table.
 */
export function PlatformIcon({ platform, size = 16, className }: PlatformIconProps) {
  switch (platform) {
    case "tiktok":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          className={className}
          aria-label="TikTok"
        >
          <path
            fill="currentColor"
            d="M22.6 6.5c.3 1.6 1 2.9 2.1 4 1 1 2.4 1.6 4 1.8v4c-2.4-.1-4.3-.9-5.9-2.4v8.6c0 5.5-4.5 10-10 10S3 28.1 3 22.6s4.5-10 10-10c.7 0 1.4.1 2 .2v4.3c-.6-.2-1.3-.3-2-.3-3.2 0-5.8 2.6-5.8 5.8s2.6 5.8 5.8 5.8 5.8-2.6 5.8-5.8V2h3.8z"
          />
        </svg>
      );
    case "youtube":
      return (
        <svg
          width={size}
          height={size * 0.7}
          viewBox="0 0 32 22"
          className={className}
          aria-label="YouTube"
        >
          <rect width="32" height="22" rx="5" fill="rgb(220 60 60)" />
          <path d="M13 7l8 4-8 4z" fill="white" />
        </svg>
      );
    case "instagram":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
          <rect x="2" y="2" width="20" height="20" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
      );
    case "x":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
          <path
            fill="currentColor"
            d="M18 3l-6 8 7 10h-5l-5-7-5 7H1l8-10L2 3h5l4 6 5-6z"
          />
        </svg>
      );
  }
}
