import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api/client";
import { BADGE_DEFS } from "@/lib/badges";
import type { BadgeState } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

const LOCAL_KEY = "zerra:claimed-badges";

function readLocalClaims(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeLocalClaim(id: string) {
  const claims = readLocalClaims();
  claims[id] = new Date().toISOString();
  localStorage.setItem(LOCAL_KEY, JSON.stringify(claims));
}

/**
 * Badge eligibility/attained state.
 *
 * Tries GET /me/badges first. That endpoint doesn't exist on the
 * backend yet — when it 404s/errors we fall back to a client-side
 * derivation (eligible = true for both, attained = read from
 * localStorage) so the claim flow is fully usable in the meantime.
 *
 * Once the backend ships /me/badges + POST /me/badges/:id/claim,
 * delete the fallback branch and this just becomes a thin wrapper.
 */
export function useBadges() {
  const { session } = useAuth();
  const [badges, setBadges] = useState<BadgeState[]>(
    BADGE_DEFS.map((b) => ({ ...b, eligible: true, attained: false }))
  );
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const loadFallback = useCallback(() => {
    const claims = readLocalClaims();
    setBadges(
      BADGE_DEFS.map((b) => ({
        ...b,
        eligible: true,
        attained: Boolean(claims[b.id]),
        attainedAt: claims[b.id],
      }))
    );
  }, []);

  useEffect(() => {
    if (!session) { setLoading(false); loadFallback(); return; }

    apiGet<{ badges: BadgeState[] }>("/me/badges")
      .then((d) => {
        if (Array.isArray(d?.badges) && d.badges.length) setBadges(d.badges);
        else loadFallback();
      })
      .catch(() => loadFallback())
      .finally(() => setLoading(false));
  }, [session, loadFallback]);

  const claim = useCallback(async (id: string) => {
    setClaimingId(id);
    try {
      const res = await apiPost<{ badge: BadgeState }>(`/me/badges/${id}/claim`);
      setBadges((prev) => prev.map((b) => (b.id === id ? res.badge : b)));
    } catch {
      // Backend route not live yet — persist locally so the UI still reflects the claim.
      writeLocalClaim(id);
      setBadges((prev) =>
        prev.map((b) => (b.id === id ? { ...b, attained: true, attainedAt: new Date().toISOString() } : b))
      );
    } finally {
      setClaimingId(null);
    }
  }, []);

  return { badges, loading, claim, claimingId };
}
