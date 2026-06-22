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
 * Both badges are membership-based by design — eligible is always
 * true for a signed-in user; there's no view-count or signup-date
 * threshold to check (confirmed: being part of Zerra is what
 * qualifies someone, not hitting a metric). Don't reintroduce a
 * fabricated threshold here.
 *
 * NOTE: GET /me/badges and POST /me/badges/:id/claim don't exist on
 * the backend yet (confirmed 404). Rather than call a known-missing
 * route on every load — which just adds console noise without any
 * behavior change, since the catch always falls back to localStorage
 * anyway — we go straight to the local derivation. When the backend
 * ships these routes, swap BACKEND_BADGES_LIVE to true to restore the
 * network path below.
 */
const BACKEND_BADGES_LIVE = false;

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
    if (!session || !BACKEND_BADGES_LIVE) { loadFallback(); setLoading(false); return; }

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
    if (!BACKEND_BADGES_LIVE) {
      writeLocalClaim(id);
      setBadges((prev) =>
        prev.map((b) => (b.id === id ? { ...b, attained: true, attainedAt: new Date().toISOString() } : b))
      );
      setClaimingId(null);
      return;
    }
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