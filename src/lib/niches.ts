/**
 * The niches a creator can pick in Settings, and the ones Top Creators filters by.
 *
 * One shared list on purpose. Niche used to be a free-text field, so "Tech",
 * "tech" and "Technology" were three different niches: that split creators into
 * separate peer groups for the "Top X% in {niche}" ranking, and meant nothing a
 * creator typed could line up with the Top Creators filters.
 *
 * Order here is the order shown in both dropdowns. src/data/featuredCreators.ts
 * is typed against this list, so adding or renaming a niche here fails the type
 * check until that data is updated too.
 */
export const NICHES = [
  "AI & Technology",
  "Crypto & Web3",
  "Business & Entrepreneurship",
  "Finance & Investing",
  "Fashion",
  "Beauty & Skincare",
  "Lifestyle",
  "Entertainment",
  "Comedy",
  "Music",
  "Gaming & Esports",
  "Fitness & Wellness",
  "Health",
  "Food & Cooking",
  "Travel",
  "Education",
  "Sports",
  "Personal Development",
  "Career & Jobs",
  "Marketing & Social Media",
  "Luxury",
  "Automotive",
  "Real Estate",
  "Parenting & Family",
  "Relationships & Dating",
  "News & Current Affairs",
  "Politics",
  "Science",
  "Photography & Videography",
  "Art & Design",
] as const;

export type Niche = (typeof NICHES)[number];

const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();

/** Case/whitespace-insensitive match, so an older free-text "lifestyle" still lines up with "Lifestyle". */
export function sameNiche(a: string | null | undefined, b: string | null | undefined): boolean {
  return norm(a) !== "" && norm(a) === norm(b);
}

/** The listed spelling of a saved value, or null when it isn't one of the listed niches. */
export function canonicalNiche(value: string | null | undefined): Niche | null {
  return NICHES.find((n) => sameNiche(n, value)) ?? null;
}
