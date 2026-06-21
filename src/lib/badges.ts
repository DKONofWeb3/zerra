import type { BadgeDef } from "@/lib/types";

/**
 * Static badge definitions. Eligibility/attained status comes from
 * the backend (or local fallback) — see useBadges().
 */
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
    description: "You have obtained 1.6M+ Views",
    theme: "violet",
    claimHeadline: "You're Now an Influencer",
    claimSubtext: "You have obtained 1.6M+ Views",
  },
];
