// Smart Account Readiness Score: our own estimate, NOT Kaito's classification.
// Targets and weights are proposed product thresholds from the founder's spec.

export const TARGETS = { smartFollowers: 1000, engagementPerPost: 50, posts: 12 } as const;
const WEIGHTS = { followers: 0.4, engagement: 0.4, consistency: 0.2 } as const;

export interface ReadinessInput {
  smartFollowers: number;
  /** Avg distinct Smart Followers engaging per post (30d). null = the data source can't provide it. */
  engagementPerPost: number | null;
  /** Qualifying posts in the last 30 days. */
  posts: number;
}

export type SignalKey = "followers" | "engagement" | "consistency";

export interface Signal {
  key: SignalKey;
  label: string;
  value: number | null;
  target: number;
  /** 0-100, capped. null when the input is unavailable. */
  score: number | null;
  weight: number;
}

export interface Tier { name: string; min: number; advice: string }

export interface Readiness {
  score: number;
  /** True when a signal was unavailable and the remaining weights were rescaled. */
  partial: boolean;
  tier: Tier;
  signals: Signal[];
  /** The signal losing the most weighted points, or null if every target is met. */
  weakest: Signal | null;
}

export const TIERS: Tier[] = [
  { name: "Emerging",            min: 0,  advice: "Build a relevant audience and establish consistent publishing." },
  { name: "Gaining Recognition", min: 40, advice: "Grow your network of Smart Followers and earn more meaningful engagement." },
  { name: "Near Target",         min: 60, advice: "Find your weakest metric and focus on improving it." },
  { name: "High Readiness",      min: 80, advice: "Strong against our targets. Official Kaito classification is a separate check." },
];

const pct = (v: number, t: number) => 100 * Math.min(Math.max(v, 0) / t, 1);

export function computeReadiness(i: ReadinessInput): Readiness {
  const signals: Signal[] = [
    { key: "followers",   label: "Smart Follower network",    value: i.smartFollowers,    target: TARGETS.smartFollowers,    score: pct(i.smartFollowers, TARGETS.smartFollowers), weight: WEIGHTS.followers },
    { key: "engagement",  label: "Smart engagement per post", value: i.engagementPerPost, target: TARGETS.engagementPerPost, score: i.engagementPerPost == null ? null : pct(i.engagementPerPost, TARGETS.engagementPerPost), weight: WEIGHTS.engagement },
    { key: "consistency", label: "Posting consistency",       value: i.posts,             target: TARGETS.posts,             score: pct(i.posts, TARGETS.posts), weight: WEIGHTS.consistency },
  ];
  const live = signals.filter((s) => s.score != null);
  const totalW = live.reduce((s, x) => s + x.weight, 0);
  const score = live.reduce((s, x) => s + (x.score as number) * x.weight, 0) / totalW;
  const tier = [...TIERS].reverse().find((t) => score >= t.min) ?? TIERS[0];
  const lost = (x: Signal) => (100 - (x.score as number)) * x.weight;
  const weakest = live.reduce<Signal | null>((w, x) => (!w || lost(x) > lost(w) ? x : w), null);
  return {
    score: Math.round(score * 10) / 10,
    partial: live.length < signals.length,
    tier,
    signals,
    weakest: weakest && lost(weakest) > 0 ? weakest : null,
  };
}
