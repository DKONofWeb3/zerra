import { cn } from "@/lib/cn";
import { TokenIcon, tokenVariantFromName } from "./TokenIcon";
import { UsdcCoinIcon } from "@/components/icons/UsdcCoinIcon";
import type { YapBountyItem } from "@/lib/types";

interface YapSectionProps {
  bounties: YapBountyItem[];
}

/** Map a bounty's project name to its accent strip color. */
function accentColorFor(projectName: string): { rgb: string; glow: string } {
  const n = projectName.toLowerCase();
  if (n.includes("hoot")) {
    return { rgb: "255 140 60", glow: "255 170 90" }; // orange
  }
  if (n.includes("sol")) {
    return { rgb: "180 120 255", glow: "200 150 255" }; // purple
  }
  return { rgb: "100 145 255", glow: "120 165 255" }; // brand blue fallback
}

function BountyEntry({ bounty }: { bounty: YapBountyItem }) {
  const accent = accentColorFor(bounty.projectName);

  return (
    <div className="relative">
      {/* Per-bounty accent strip on the LEFT edge of the outer card */}
      <div
        aria-hidden
        className="absolute -left-7 top-2 w-[3px] h-[60px] rounded-r-sm"
        style={{
          background: `rgb(${accent.rgb})`,
          boxShadow: `0 0 16px 2px rgb(${accent.glow} / 0.7)`,
        }}
      />

      <div className="space-y-4">
        {/* Header: round token icon w/ marker + name + bounty meta */}
        <div className="flex items-center gap-3.5">
          <TokenIcon
            name={bounty.projectName}
            variant={tokenVariantFromName(bounty.projectName)}
            size={48}
            shape="circle"
            withMarker
          />
          <div className="leading-tight">
            <div className="text-[17px] font-semibold text-fg-primary">
              {bounty.projectName}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[12.5px] tabular-nums">
              <UsdcCoinIcon size={13} />
              <span className="text-fg-tertiary">{bounty.bountyUsdc}</span>
              <span className="text-fg-secondary font-medium">USDC</span>
              <span className="text-fg-tertiary">Yap bounty</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <p className="text-[15px] leading-[1.55] text-fg-primary">
          {bounty.description}
          {bounty.accentPhrase && (
            <span style={{ color: "rgb(var(--brand-glow))" }}>
              {" "}
              {bounty.accentPhrase}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

export function YapSection({ bounties }: YapSectionProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card",
        "border border-white/[0.06]",
        "shadow-card",
        "min-h-[420px]"
      )}
      style={{ background: "rgb(var(--bg-card))" }}
    >
      {/* Top inner highlight border — the "rim" */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.15), transparent)",
        }}
      />

      {/* Top inner gradient sheen */}
      <div
        className="absolute inset-x-0 top-0 h-1/4 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgb(255 255 255 / 0.025) 0%, transparent 100%)",
        }}
      />

      <div className="relative px-7 py-8 space-y-9">
        {bounties.map((b) => (
          <BountyEntry key={b.id} bounty={b} />
        ))}
      </div>
    </div>
  );
}
