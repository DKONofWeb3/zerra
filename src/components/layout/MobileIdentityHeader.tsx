import { Link } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { useBadges } from "@/hooks/useBadges";
import { UserAvatar } from "./UserAvatar";
import { BadgeGlyph } from "@/components/icons/BadgeIcon";

/**
 * Identity row shown above page content on mobile only. On desktop
 * this information lives in the Sidebar, which is `hidden md:flex` —
 * mobile had no equivalent, so the user's name/avatar/TikTok-linked
 * status was invisible on small screens. Sourced from the same real
 * hooks Sidebar uses (useCurrentUser, useSocialAccounts) — no
 * duplicated or fabricated data.
 */
export function MobileIdentityHeader() {
  const { user } = useCurrentUser();
  const { accounts } = useSocialAccounts();
  const tiktokAccount = accounts.find((a) => a.platform === "tiktok");
  const { badges } = useBadges(tiktokAccount?.follower_count ?? null);
  const attainedBadges = badges.filter((b) => b.attained);

  return (
    <div className="flex md:hidden items-center gap-3 px-4 pt-3">
      <Link to="/settings" className="shrink-0" aria-label="Open settings">
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/[0.06] bg-bg-elevated">
          <UserAvatar name={user?.name ?? null} avatar={user?.avatar ?? null} />
        </div>
      </Link>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="text-[14px] font-semibold text-fg-primary truncate leading-tight">
            {user?.name ?? "—"}
          </p>
          {attainedBadges.length > 0 && (
            <span className="flex items-center gap-1 shrink-0" aria-label="Attained badges">
              {attainedBadges.map((b) => (
                <BadgeGlyph key={b.id} theme={b.theme} size={14} glow={false} />
              ))}
            </span>
          )}
        </div>
        <p className="text-[11.5px] text-fg-tertiary truncate mt-0.5">
          TikTok:{" "}
          <span className={tiktokAccount ? "text-[rgb(var(--success))]" : "text-fg-secondary"}>
            {tiktokAccount ? `@${tiktokAccount.username ?? "Connected"}` : "Not connected"}
          </span>
        </p>
      </div>
    </div>
  );
}