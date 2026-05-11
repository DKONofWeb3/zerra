import { useState } from "react";
import { cn } from "@/lib/cn";

interface TokenIconProps {
  name: string;
  variant?:
    | "btc"
    | "hootdog"
    | "sol"
    | "base"
    | "kaito"
    | "lifted"
    | "eth"
    | "default";
  size?: number;
  /** Square (rounded-square) or circle. Defaults to square. */
  shape?: "square" | "circle";
  /** Show small diamond marker in top-right corner (used in Yap Section). */
  withMarker?: boolean;
  className?: string;
  /** Override the auto-derived image filename (without extension). */
  imageId?: string;
}

const variantStyles: Record<
  NonNullable<TokenIconProps["variant"]>,
  { bg: string; ring: string; letter: string }
> = {
  btc: { bg: "rgb(247 147 26)", ring: "rgb(247 147 26 / 0.4)", letter: "₿" },
  hootdog: { bg: "rgb(232 122 60)", ring: "rgb(232 122 60 / 0.4)", letter: "🌭" },
  sol: {
    bg: "linear-gradient(135deg, rgb(20 200 200), rgb(160 80 230))",
    ring: "rgb(20 200 200 / 0.35)",
    letter: "S",
  },
  base: { bg: "rgb(0 82 255)", ring: "rgb(0 82 255 / 0.35)", letter: "B" },
  kaito: { bg: "rgb(0 220 180)", ring: "rgb(0 220 180 / 0.35)", letter: "K" },
  lifted: {
    bg: "rgb(120 130 240)",
    ring: "rgb(120 130 240 / 0.35)",
    letter: "▲",
  },
  eth: { bg: "rgb(99 110 220)", ring: "rgb(99 110 220 / 0.35)", letter: "Ξ" },
  default: { bg: "rgb(80 80 95)", ring: "rgb(80 80 95 / 0.35)", letter: "?" },
};

export function tokenVariantFromName(
  name: string
): NonNullable<TokenIconProps["variant"]> {
  const n = name.toLowerCase();
  if (n.includes("hoot")) return "hootdog";
  if (n.includes("btc") || n.includes("bitcoin")) return "btc";
  if (n.includes("sol")) return "sol";
  if (n.includes("kaito")) return "kaito";
  if (n.includes("lift")) return "lifted";
  if (n.includes("base")) return "base";
  if (n.includes("eth")) return "eth";
  return "default";
}

/** Convert a project name to the lookup id used for image filenames. */
function nameToImageId(name: string): string {
  return name
    .toLowerCase()
    .replace(/\//g, "")
    .replace(/\s+/g, "");
}

const IMAGE_EXTENSIONS = ["png", "jpg", "webp"] as const;

export function TokenIcon({
  name,
  variant,
  size = 36,
  shape = "square",
  withMarker = false,
  className,
  imageId,
}: TokenIconProps) {
  const v = variant ?? tokenVariantFromName(name);
  const style = variantStyles[v];
  const isCircle = shape === "circle";

  // Image lookup state — try png → jpg → webp, then fall back to CSS glyph
  const id = imageId ?? nameToImageId(name);
  const [extIndex, setExtIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className={cn(
          "relative overflow-hidden grid place-items-center font-semibold text-white border border-white/10",
          isCircle ? "rounded-full" : "rounded-xl",
          className
        )}
        style={{
          width: size,
          height: size,
          background: style.bg,
          boxShadow: `0 0 0 1px ${style.ring} inset, 0 4px 12px -4px ${style.ring}`,
          fontSize: size * 0.42,
        }}
        aria-label={name}
      >
        {!imageFailed ? (
          <img
            src={`/tokens/${id}.${IMAGE_EXTENSIONS[extIndex]}`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => {
              if (extIndex < IMAGE_EXTENSIONS.length - 1) {
                setExtIndex(extIndex + 1);
              } else {
                setImageFailed(true);
              }
            }}
          />
        ) : (
          <span className="leading-none">{style.letter}</span>
        )}
      </div>

      {withMarker && (
        <span
          aria-hidden
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rotate-45 rounded-[2px] border-2 border-white/85 bg-bg-card"
          style={{
            boxShadow: "0 0 6px rgb(255 255 255 / 0.25)",
          }}
        />
      )}
    </div>
  );
}
