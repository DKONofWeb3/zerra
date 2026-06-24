import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api/client";
import { BADGE_DEFS, FOLLOWER_THRESHOLD } from "@/lib/badges";
import type { BadgeState } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

/** "early-creator" is always eligible (membership-based). "verified-influencer" requires real follower data >= FOLLOWER_THRESHOLD. */
function computeEligible(badgeId: string, followerCount: number | null): boolean {
  if (badgeId !== "verified-influencer") return true;
  return followerCount != null && followerCount >= FOLLOWER_THRESHOLD;
}

/**
 * Badge eligibility/attained state — now backed by the real
 * GET /me/badges and POST /me/badges/:id/claim endpoints, which read
 * and write to the badge_claims table in Supabase.
 *
 * The backend is live (BADGE_DEFS + FOLLOWER_THRESHOLD now exist on
 * the backend, and it independently re-checks follower-count
 * eligibility server-side). The old localStorage fallback is removed
 * — it was masking the missing backend by storing claims only in the
 * browser, which is why claims never survived a different browser or
 * a hard refresh after cache clear: nothing was ever saved server-side.
 *
 * followerCount is still passed in from the caller (sourced from
 * useSocialAccounts) purely so the UI can show correct eligibility
 * optimistically before the network response lands — the backend's
 * response is always the source of truth once it arrives.
 */
export function useBadges(followerCount: number | null = null) {
  const { session } = useAuth();
  const [badges, setBadges] = useState<BadgeState[]>(
    BADGE_DEFS.map((b) => ({ ...b, eligible: computeEligible(b.id, followerCount), attained: false }))
  );
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) { setLoading(false); return; }

    apiGet<{ badges: BadgeState[] }>("/me/badges")
      .then((d) => {
        if (Array.isArray(d?.badges) && d.badges.length) setBadges(d.badges);
      })
      .catch((err) => {
        console.error("Failed to load badges:", err);
      })
      .finally(() => setLoading(false));
  }, [session]);

  const claim = useCallback(async (id: string) => {
    setClaimingId(id);
    try {
      const res = await apiPost<{ badge: BadgeState }>(`/me/badges/${id}/claim`);
      setBadges((prev) => prev.map((b) => (b.id === id ? res.badge : b)));
    } catch (err) {
      console.error("Failed to claim badge:", err);
      // Don't fake success locally anymore — if the save (or the
      // backend's eligibility re-check) failed, the UI should reflect
      // that rather than showing a claim that didn't actually persist.
    } finally {
      setClaimingId(null);
    }
  }, []);

  return { badges, loading, claim, claimingId };
}