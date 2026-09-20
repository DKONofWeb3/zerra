/**
 * Ranking for the GENERAL leaderboard — real reach and engagement, not Zerra
 * points (those are the separate Zerra board, GET /bounties/leaderboard).
 *
 * Four log-scaled terms, weighted 35/45/20 to mirror the Influence Rating's own
 * Audience / Engagement / Impact split (zerra-backend/src/lib/influenceScore.ts):
 *
 *   followers                 0.35   audience
 *   engagement rate           0.20 ┐
 *   avg engagement per post   0.25 ┘ engagement (0.45 together)
 *   total views               0.20   reach
 *
 * A term with no data is NOT scored as zero — its weight is spread across the
 * terms that do have data, the same rule the Influence Rating uses. That matters
 * here because the hardcoded showcase creators on the Top Creators page have no
 * follower counts, and a missing number must never read as "0 followers".
 *
 * Log scaling keeps a 100M-follower creator well above a 5K one without letting
 * raw size flatten everything else: engagement rate alone would rank tiny
 * accounts first (small audiences engage at 15–20%, big ones at 5–9%).
 */

export interface GeneralScoreInput {
  followers?: number | null;
  avg_engagement_rate: number;
  avg_engagement_per_post?: number | null;
  total_views?: number | null;
  // Used to derive avg engagement per post when the source doesn't supply it
  total_likes?: number;
  total_comments?: number;
  total_shares?: number;
  post_count?: number;
}

const FOLLOWERS_CEILING = 100_000_000;
const VIEWS_CEILING = 1_000_000_000;
const AVG_ENGAGEMENT_CEILING = 1_000_000;
const ENGAGEMENT_RATE_CAP_PCT = 15;

function logScale(value: number, ceiling: number): number {
  const scaled = Math.log10(Math.max(0, value) + 1) / Math.log10(ceiling + 1);
  return Math.min(100, Math.max(0, scaled * 100));
}

export function avgEngagementPerPost(c: GeneralScoreInput): number | null {
  if (c.avg_engagement_per_post != null) return c.avg_engagement_per_post;
  const posts = c.post_count ?? 0;
  if (!posts) return null;
  return Math.round(((c.total_likes ?? 0) + (c.total_comments ?? 0) + (c.total_shares ?? 0)) / posts);
}

/** 0–100. */
export function generalScore(c: GeneralScoreInput): number {
  const perPost = avgEngagementPerPost(c);

  const terms: { weight: number; value: number | null }[] = [
    { weight: 0.35, value: c.followers != null ? logScale(c.followers, FOLLOWERS_CEILING) : null },
    { weight: 0.20, value: Math.min(100, Math.max(0, (c.avg_engagement_rate / ENGAGEMENT_RATE_CAP_PCT) * 100)) },
    { weight: 0.25, value: perPost != null ? logScale(perPost, AVG_ENGAGEMENT_CEILING) : null },
    { weight: 0.20, value: c.total_views != null ? logScale(c.total_views, VIEWS_CEILING) : null },
  ];

  const live = terms.filter((t) => t.value !== null);
  const totalWeight = live.reduce((s, t) => s + t.weight, 0);
  if (totalWeight === 0) return 0;

  return live.reduce((s, t) => s + (t.value as number) * t.weight, 0) / totalWeight;
}

/** Highest general score first; followers, then views, break ties. */
export function rankGeneral<T extends GeneralScoreInput>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const diff = generalScore(b) - generalScore(a);
    if (diff !== 0) return diff;
    const f = (b.followers ?? 0) - (a.followers ?? 0);
    if (f !== 0) return f;
    return (b.total_views ?? 0) - (a.total_views ?? 0);
  });
}
