import { useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ContentType } from "@/lib/types";

interface ContentThumbnailProps {
  thumbId: string;
  duration: string;
  contentType: ContentType;
  className?: string;
}

const EXTS = ["png", "jpg", "webp"] as const;

const TYPE_TINT: Record<ContentType, string> = {
  Video: "rgb(255 80 80 / 0.18)",
  Reel: "rgb(120 130 240 / 0.18)",
  Short: "rgb(80 220 130 / 0.18)",
};
const TYPE_TEXT: Record<ContentType, string> = {
  Video: "rgb(255 130 130)",
  Reel: "rgb(170 180 255)",
  Short: "rgb(130 230 170)",
};

/**
 * Small clickable video preview used in the Top Performing Content
 * table. Shows the thumbnail image, a play icon, the duration in the
 * bottom-left, and a content-type tag below the thumbnail.
 */
export function ContentThumbnail({
  thumbId,
  duration,
  contentType,
  className,
}: ContentThumbnailProps) {
  const [extIndex, setExtIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        className={cn(
          "relative w-[68px] h-[44px] rounded-md overflow-hidden",
          "border border-white/[0.06] bg-bg-elevated"
        )}
      >
        {!failed && (
          <img
            src={`/content-thumbs/${thumbId}.${EXTS[extIndex]}`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => {
              if (extIndex < EXTS.length - 1) setExtIndex(extIndex + 1);
              else setFailed(true);
            }}
          />
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 grid place-items-center bg-black/30">
          <Play className="w-3.5 h-3.5 text-white" fill="white" />
        </div>

        {/* Duration */}
        <span
          className={cn(
            "absolute bottom-1 left-1 px-1 rounded",
            "text-[9px] font-medium text-white",
            "bg-black/70"
          )}
        >
          {duration}
        </span>
      </div>

      {/* Content type tag */}
      <span
        className="self-start px-1.5 rounded text-[9.5px] font-medium leading-[14px]"
        style={{
          background: TYPE_TINT[contentType],
          color: TYPE_TEXT[contentType],
        }}
      >
        {contentType}
      </span>
    </div>
  );
}
