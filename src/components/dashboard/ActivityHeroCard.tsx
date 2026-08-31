import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { BadgesPanel } from "@/components/dashboard/BadgesCard";
import { AttainedBadgePills } from "@/components/dashboard/AttainedBadgePills";
import type { BadgeState } from "@/lib/types";

interface DropdownPillProps {
  label: string;
  options: string[];
}

function DropdownPill({ label, options }: DropdownPillProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(label);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] text-fg-secondary border border-white/[0.08] bg-black/20 hover:bg-black/30 transition-colors whitespace-nowrap"
      >
        <span className="italic">{selected}</span>
        <ChevronDown className="w-3 h-3 shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1.5 z-20 min-w-[140px] rounded-lg border border-white/[0.08] bg-bg-elevated shadow-lg overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { setSelected(opt); setOpen(false); }}
                className="block w-full text-left px-3.5 py-2 text-[12px] text-fg-secondary hover:bg-white/[0.06] transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface ActivityHeroCardProps {
  tiktokLinked: boolean;
  loading: boolean;
  hasData: boolean;
  postsSynced: number;
  badges: BadgeState[];
  claimingId: string | null;
  onClaim: (id: string) => void;
}

/**
 * The hero card. The "Total Reach / Engagement Rate / Total Likes" stats
 * block that used to live here has been removed — that data duplicated
 * what the Analytics tab already shows (Total Views, Avg Engagement, and
 * a Total Likes bar in Engagement Breakdown), so it only needs to exist
 * in one place. Badges now take the full-width row on both mobile and
 * desktop.
 */
export function ActivityHeroCard({
  tiktokLinked, loading, hasData, postsSynced,
  badges, claimingId, onClaim,
}: ActivityHeroCardProps) {
  const anyAttained = badges.some((b) => b.attained);

  return (
    <div
      className="relative overflow-hidden rounded-card border border-white/[0.06] p-5 md:p-8"
      style={{ background: "rgb(2 3 6)" }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: "85%",
          background: "linear-gradient(180deg, transparent 0%, rgb(35 48 88 / 0.55) 55%, rgb(58 78 132 / 0.85) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(120 150 255 / 0.5), transparent)" }}
      />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[12.5px] text-fg-tertiary">
            {tiktokLinked ? "TikTok account: Linked" : "Link your TikTok account."}
          </p>
          <div className="hidden md:flex gap-2.5 shrink-0">
            <DropdownPill label="Wallet Balance" options={["Wallet Balance", "USDC", "Points"]} />
            <DropdownPill label="Linked Socials" options={["Linked Socials", "TikTok", "Instagram", "X"]} />
          </div>
        </div>

        <h2 className="mt-2 font-display font-medium text-[28px] md:text-[36px] text-fg-primary tracking-[-0.02em] leading-tight">
          All Activity Update
        </h2>

        <div className="flex md:hidden gap-2.5 mt-3">
          <DropdownPill label="Wallet Balance" options={["Wallet Balance", "USDC", "Points"]} />
          <DropdownPill label="Linked Socials" options={["Linked Socials", "TikTok", "Instagram", "X"]} />
        </div>

        {!tiktokLinked ? (
          <a
            href="/settings?tab=connected"
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-medium text-fg-secondary border border-white/[0.08] bg-bg-elevated hover:bg-white/[0.06] transition-colors"
          >
            Link Socials <span className="text-fg-muted">›</span>
          </a>
        ) : (
          <div className="mt-3">
            <AttainedBadgePills badges={badges} />
            {!anyAttained && (
              <p className="text-[12px] text-fg-tertiary">
                {loading ? "…" : hasData ? `${postsSynced} posts synced` : "No posts synced yet"}
              </p>
            )}
          </div>
        )}

        {/* Mobile — badges panel only while unclaimed; once attained, BadgeTilesRow
            (rendered by the Dashboard page, md:hidden) takes over below the hero card. */}
        {!anyAttained && (
          <div className="md:hidden mt-5">
            <BadgesPanel badges={badges} claimingId={claimingId} onClaim={onClaim} />
          </div>
        )}

        {/* Desktop — badges panel always stays in the hero card, regardless of
            attained state; it never moves below like it does on mobile. */}
        <div className="hidden md:block mt-5">
          <BadgesPanel badges={badges} claimingId={claimingId} onClaim={onClaim} />
        </div>
      </div>
    </div>
  );
}
