import { useState } from "react";
import { cn } from "@/lib/cn";

interface CreatorAvatarProps {
  /** Used to look up `/creators/{id}.{ext}`. */
  id: string;
  /** Display name for accessibility. */
  name?: string;
  size?: number;
  className?: string;
  /** Square or circle. */
  shape?: "square" | "circle";
}

const EXTS = ["png", "jpg", "webp"] as const;

const FALLBACK_BG = [
  "rgb(74 125 255)",  // blue
  "rgb(232 80 80)",   // red
  "rgb(80 220 130)",  // green
  "rgb(180 120 255)", // purple
  "rgb(255 140 60)",  // orange
];

function pickFallback(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return FALLBACK_BG[Math.abs(h) % FALLBACK_BG.length];
}

export function CreatorAvatar({
  id,
  name = "",
  size = 36,
  className,
  shape = "circle",
}: CreatorAvatarProps) {
  const [extIndex, setExtIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const isCircle = shape === "circle";

  const initial = (name.replace(/^@/, "")[0] || id[0] || "?").toUpperCase();

  return (
    <div
      className={cn(
        "shrink-0 overflow-hidden border border-white/[0.08] grid place-items-center",
        isCircle ? "rounded-full" : "rounded-xl",
        className
      )}
      style={{
        width: size,
        height: size,
        background: pickFallback(id),
      }}
      aria-label={name || id}
    >
      {!failed ? (
        <img
          src={`/creators/${id}.${EXTS[extIndex]}`}
          alt=""
          className="w-full h-full object-cover"
          onError={() => {
            if (extIndex < EXTS.length - 1) setExtIndex(extIndex + 1);
            else setFailed(true);
          }}
        />
      ) : (
        <span
          className="font-semibold text-white"
          style={{ fontSize: size * 0.4 }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}
