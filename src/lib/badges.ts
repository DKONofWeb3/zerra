import type { BadgeDef } from "@/lib/types";

/**
 * Static badge definitions.
 *
 * "Early creator badge" is membership-based — no metric to check, no
 * signup-date field exists, eligible is always true by design.
 *
 * "Influencer Badge" is gated on TikTok follower count ≥ 10,000 (see
 * useBadges.ts for the actual check). That field doesn't exist on the
 * backend yet — see the NOTE in useSocialAccounts.ts for exactly what
 * needs to change there.
 */
export const FOLLOWER_THRESHOLD = 10_000;

export const BADGE_DEFS: BadgeDef[] = [
  {
    id: "early-creator",
    name: "Early creator badge",
    shortLabel: "Early Adopter",
    description: "This badge is only for the Day1 Creators",
    theme: "ember",
    claimHeadline: "Congratulation",
    claimSubtext: "Thank you for being here early, we have something for you soon.",
  },
  {
    id: "verified-influencer",
    name: "Influencer Badge",
    shortLabel: "Verified Influencer",
    description: "Reach 10,000+ TikTok followers to unlock this badge",
    attainedDescription: "You've crossed 10,000 followers on TikTok",
    theme: "violet",
    claimHeadline: "You're Now an Influencer",
    claimSubtext: "You've crossed 10,000 followers on TikTok.",
  },
];