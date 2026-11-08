// Display side of the Smart Readiness score. The score itself is calculated on
// the backend (zerra-backend/src/lib/readiness/score.ts); keep the weights and
// tier thresholds here in sync with it.

export type ComponentKey = "reach" | "audience" | "engagement" | "activity" | "momentum";

export const COMPONENTS: { key: ComponentKey; label: string; weight: number }[] = [
  { key: "reach",      label: "Audience size",    weight: 0.2 },
  { key: "audience",   label: "Audience quality", weight: 0.2 },
  { key: "engagement", label: "Engagement",       weight: 0.25 },
  { key: "activity",   label: "Activity",         weight: 0.2 },
  { key: "momentum",   label: "Momentum",         weight: 0.15 },
];

export interface Tier { name: string; min: number; advice: string }

export const TIERS: Tier[] = [
  { name: "Emerging CT",   min: 0,  advice: "You're just getting started on CT. Build a real audience and post consistently. Everything compounds from there." },
  { name: "Discovered",    min: 30, advice: "People are finding you. Sharper engagement and steady posting will move you fastest." },
  { name: "Smart Account", min: 55, advice: "You're a Smart Account: a voice the right people listen to. Keep your cadence and keep growing the right audience." },
  { name: "Legend",        min: 80, advice: "Top of the board. Protect your consistency and your engagement." },
];

export const tierFor = (score: number): Tier => [...TIERS].reverse().find((t) => score >= t.min) ?? TIERS[0];

export interface ReadinessMetrics {
  followers: number;
  meanFollowerQuality: number;
  strongShare: number;
  knownCreators: number;
  posts30: number;
  posts60: number;
  daysSinceLastPost: number | null;
  erViews: number | null;
  viewsPerFollower: number | null;
  erTrend: number | null;
  followerGrowth: number | null;
  gate: number;
}

export type ReadinessComponents = Record<ComponentKey, number | null>;

const fmtNum = (n: number) =>
  n >= 1_000_000 ? `${parseFloat((n / 1_000_000).toFixed(1))}M` : n >= 1_000 ? `${parseFloat((n / 1_000).toFixed(1))}K` : String(Math.round(n));
const pct = (x: number, digits = 1) => `${(x * 100).toFixed(digits)}%`;
const signed = (x: number) => `${x >= 0 ? "+" : ""}${Math.round(x * 100)}%`;

/** One line of evidence behind a component's score. */
export function detail(key: ComponentKey, m: ReadinessMetrics): string {
  switch (key) {
    case "reach":
      return `${fmtNum(m.followers)} followers`;
    case "audience":
      return `${Math.round(m.strongShare * 100)}% of the followers we checked are strong accounts`;
    case "engagement":
      return m.erViews == null
        ? "No recent posts to measure"
        : `${pct(m.erViews)} of viewers engage` + (m.viewsPerFollower != null ? `, posts reach ${pct(m.viewsPerFollower, 0)} of your followers` : "");
    case "activity":
      return `${m.posts30} post${m.posts30 === 1 ? "" : "s"} in 30 days, ` +
        (m.daysSinceLastPost == null ? "none in the last 60" : m.daysSinceLastPost === 0 ? "last one today" : `last one ${m.daysSinceLastPost}d ago`);
    case "momentum": {
      const parts: string[] = [];
      if (m.erTrend != null) parts.push(m.erTrend <= -1 ? "went quiet vs last month" : `engagement ${signed(m.erTrend)} vs last month`);
      if (m.followerGrowth != null) parts.push(`followers ${signed(m.followerGrowth)} (30d)`);
      return parts.length ? parts.join(", ") : "Builds after a few days of history";
    }
  }
}

/** What to do about a weak component. */
export function tip(key: ComponentKey, m: ReadinessMetrics): string {
  switch (key) {
    case "reach":
      return "Grow your audience: reply early on big accounts in your niche, and share takes people want to repost.";
    case "audience":
      return "Followers with real history count more. Engage with active accounts in your niche so they find and follow you.";
    case "engagement":
      return "Write for replies and reposts: ask questions, share opinions people can answer. Aim for 2%+ of viewers engaging.";
    case "activity":
      return m.daysSinceLastPost == null || m.daysSinceLastPost > 14
        ? "You've gone quiet, and that holds your whole score down. Start posting again, even a few times a week."
        : "Post more regularly. Around 12 posts a month, spread across the week, is the sweet spot.";
    case "momentum":
      return "Your engagement or follower growth is slipping. Double down on the posts that worked best last month.";
  }
}

/** The component costing the most weighted points, with how many. */
export function biggestGaps(components: ReadinessComponents, count = 2): { key: ComponentKey; lost: number }[] {
  return COMPONENTS
    .filter((c) => components[c.key] != null)
    .map((c) => ({ key: c.key, lost: (100 - (components[c.key] as number)) * c.weight }))
    .filter((g) => g.lost > 1)
    .sort((a, b) => b.lost - a.lost)
    .slice(0, count);
}
