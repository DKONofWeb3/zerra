import { useState } from "react";
import { cn } from "@/lib/cn";
import type { Campaign } from "@/lib/types";

interface CampaignCardProps {
  campaign: Campaign;
  onClick?: () => void;
}

/**
 * A campaign card. The entire visual is one image exported from Figma
 * (info panel + hero + glow + dotted texture, all baked in).
 *
 * Image is loaded from /public/campaigns/{id}.{ext}. Tries png → jpg →
 * webp in order; if all fail, shows a labeled placeholder so it's
 * obvious which file to drop in.
 *
 * The aspect ratio matches the Figma source — taller than wide.
 */
const EXTENSIONS = ["png", "jpg", "webp"] as const;

export function CampaignCard({ campaign, onClick }: CampaignCardProps) {
  const [extIndex, setExtIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative block w-full overflow-hidden rounded-card",
        "aspect-[1/1.05] bg-bg-card border border-white/[0.06]",
        "transition-all duration-200",
        "hover:border-white/[0.12] hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      )}
      aria-label={`${campaign.name} campaign`}
    >
      {failed ? (
        <PlaceholderPanel campaign={campaign} />
      ) : (
        <img
          src={`/campaigns/${campaign.id}.${EXTENSIONS[extIndex]}`}
          alt={`${campaign.name} campaign`}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => {
            if (extIndex < EXTENSIONS.length - 1) {
              setExtIndex(extIndex + 1);
            } else {
              setFailed(true);
            }
          }}
        />
      )}
    </button>
  );
}

function PlaceholderPanel({ campaign }: { campaign: Campaign }) {
  return (
    <div
      className="absolute inset-0 grid place-items-center p-8"
      style={{
        background:
          "linear-gradient(180deg, rgb(var(--bg-elevated)) 0%, rgb(var(--bg-base)) 100%)",
      }}
    >
      {/* Subtle dotted texture so it's not totally flat */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(rgb(255 255 255 / 0.06) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />

      <div className="relative text-center">
        <div className="text-fg-primary text-2xl font-display font-medium mb-3">
          {campaign.name}
        </div>
        <div className="text-fg-muted text-[11px] uppercase tracking-wider mb-2">
          Campaign asset
        </div>
        <div className="text-fg-tertiary text-sm">
          Drop{" "}
          <code className="text-fg-secondary text-xs">
            public/campaigns/{campaign.id}.png
          </code>
        </div>
      </div>
    </div>
  );
}
