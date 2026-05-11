/**
 * Domain types for the Yap dashboard.
 * Keep these in sync with the backend API contract once that lands.
 */

export type TrendDirection = "up" | "down" | "flat";

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  postsThisWeek?: number;
}

/** A row in the top user activity marquee. Either a user post or a bounty announcement. */
export type ActivityItem =
  | {
      kind: "user";
      id: string;
      name: string;
      avatarUrl: string;
      postsThisWeek: number;
    }
  | {
      kind: "bounty";
      id: string;
      projectName: string;
      tokenIconUrl: string;
      bountyUsdc: number;
    };

export interface PriceCardData {
  id: string;
  pair: string; // e.g. "BTC/USDT"
  assetName: string; // e.g. "Bitcoin"
  tokenIconUrl: string;
  price: number;
  changePercent: number; // signed
  trend: TrendDirection;
  /** Sparkline points, normalized 0..1 on the y-axis is fine for now. */
  sparkline: { x: number; y: number; label?: string }[];
  /**
   * Optional CoinGecko id. When present, the card's price/change/sparkline
   * are replaced with live data fetched from CoinGecko. When absent (e.g.
   * Hoot Dog, which isn't a real coin), the mock data above is shown as-is.
   */
  coinGeckoId?: "bitcoin" | "solana" | "ethereum";
}

export interface YapBountyItem {
  id: string;
  projectName: string;
  tokenIconUrl: string;
  bountyUsdc: number;
  description: string;
  /** Optional accent phrase rendered in muted color inline. */
  accentPhrase?: string;
}

export type ProjectStatus = "sold" | "stacked" | "pending";

export interface ProjectRow {
  rank: number;
  name: string;
  projectId: string;
  projectIconUrl: string;
  date: string; // ISO date string
  allocations: string; // pre-formatted, since the design shows weird suffixes (B/K/F)
  status: ProjectStatus;
}

export interface CurrentUser {
  name: string;
  avatarUrl: string;
  tiktokLinked: boolean;
  streakDays: number;
  lastLogin: string; // ISO date string
}

/**
 * A live yap campaign.
 *
 * The full visual (info panel, hero artwork, glow, dotted texture, all of it)
 * is exported from Figma as a single image at /public/campaigns/{id}.{ext}.
 * That image IS the card — the React component just renders it.
 *
 * Add metadata fields back here later when you need them for search,
 * filtering, or a detail page.
 */
export interface Campaign {
  id: string;
  name: string;
}

/* ============================================================
   PORTFOLIO PAGE
   ============================================================ */

export type EarningsTab = "total" | "avg" | "completed" | "pending";

/** A single point on the Overview chart. */
export interface EarningsPoint {
  /** Display label like "Mar 9", "Apr 5". */
  label: string;
  /** Raw numeric earnings for that period. */
  value: number;
}

/** A single line item under "This Month" earnings breakdown. */
export interface EarningsBreakdownItem {
  id: string;
  /** Lucide icon name to render at the start of the row. */
  iconName: "users" | "clock" | "presentation" | "badge-check" | "hash";
  label: string;
  amount: number;
}

/** A "My top projects" row. Same shape as ProjectRow but kept separate so
 *  Portfolio can diverge later without affecting Dashboard. */
export interface PortfolioProjectRow {
  rank: number;
  name: string;
  projectId: string;
  date: string;
  allocations: string;
  status: ProjectStatus;
}

/* ============================================================
   EXPLORE PAGE
   ============================================================ */

/** A row in the "Projects to Talk About" table. */
export interface TalkProjectRow {
  id: string;
  /** Project name shown next to its icon. */
  name: string;
  /** Confusingly labeled "User ID" in the design but it's a date string. */
  userId: string;
  /** Date column, distinct from userId. */
  date: string;
  /** Trailing status pill. */
  status: ProjectStatus;
}

export type OpportunityType = "campaigns" | "branddeals" | "projects";

/* ============================================================
   YAP SUB-PAGES — TOP CREATORS + TOP PERFORMING CONTENT
   ============================================================ */

/** Platform a creator/content lives on. */
export type Platform = "tiktok" | "youtube" | "instagram" | "x";

/** A row in the Top Creators leaderboard table. */
export interface CreatorRow {
  rank: number;
  /** Local image id; resolves to /creators/{id}.{ext}. */
  id: string;
  handle: string;
  role: string;
  platform: Platform;
  /** "Score" column — currently shown as platform name in the design. */
  scoreLabel: string;
  views: string;
  engagementRate: number; // 0..100
  earnings: number;
}

/** Aggregate stats shown in the bar at the top of Top Creators. */
export interface TopCreatorsStats {
  totalCreators: string;
  totalCampaigns: string;
  totalView: string;
  totalPayouts: string;
}

/** A featured creator card on Top Performing. */
export interface FeaturedCreator {
  id: string;
  name: string;
  caption: string;
  /** Sparkline color theme. */
  trend: "red" | "green";
  /** Tier badge text — e.g. "Top 100". */
  tierLabel: string;
}

/** Content type tag shown under a video title. */
export type ContentType = "Video" | "Reel" | "Short";

/** A row in the Top Performing Content table. */
export interface ContentRow {
  id: string;
  /** Local image id; resolves to /content-thumbs/{id}.{ext}. */
  thumbId: string;
  duration: string; // e.g. "2:00"
  contentType: ContentType;
  handle: string;
  role: string;
  platform: Platform;
  scoreLabel: string;
  views: string;
  engagementRate: number;
  watchTime: string;
  date: string;
}

/** A donut chart segment used in the Top Performing right column. */
export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}
