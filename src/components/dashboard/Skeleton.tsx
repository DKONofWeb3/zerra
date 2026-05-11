import { cn } from "@/lib/cn";

interface SkeletonProps {
  className?: string;
}

/**
 * Shimmering placeholder used while async data loads. Sized via className
 * (width/height); renders a subtle blue-grey gradient that animates
 * left-to-right.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn("rounded-md animate-shimmer", className)}
      style={{
        background:
          "linear-gradient(90deg, rgb(255 255 255 / 0.04) 0%, rgb(255 255 255 / 0.10) 50%, rgb(255 255 255 / 0.04) 100%)",
        backgroundSize: "200% 100%",
      }}
    />
  );
}
