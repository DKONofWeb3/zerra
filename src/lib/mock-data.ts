import type {
  ActivityItem,
  CurrentUser,
  PriceCardData,
  ProjectRow,
  InfluenceBountyItem,
} from "./types";

const dicebear = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

export const currentUser: CurrentUser = {
  name: "Adam",
  avatarUrl: dicebear("Adam"),
  tiktokLinked: true,
  streakDays: 12,
  lastLogin: "2026-01-01T10:00:00Z",
};

export const activityFeed: ActivityItem[] = [
  { kind: "user", id: "u1", name: "Emma Thompson", avatarUrl: dicebear("Emma"), postsThisWeek: 9 },
  { kind: "user", id: "u2", name: "Sarah Chen", avatarUrl: dicebear("Sarah"), postsThisWeek: 10 },
  { kind: "user", id: "u3", name: "Marcus Rodriguez", avatarUrl: dicebear("Marcus"), postsThisWeek: 12 },
  { kind: "bounty", id: "b1", projectName: "Ethereum", tokenIconUrl: "/tokens/eth.svg", bountyUsdc: 1000 },
  { kind: "user", id: "u4", name: "Sarah Chen", avatarUrl: dicebear("Sarah2"), postsThisWeek: 10 },
  { kind: "user", id: "u5", name: "Marcus Rodriguez", avatarUrl: dicebear("Marcus2"), postsThisWeek: 12 },
  { kind: "user", id: "u6", name: "Liam Park", avatarUrl: dicebear("Liam"), postsThisWeek: 7 },
  { kind: "user", id: "u7", name: "Aisha Okafor", avatarUrl: dicebear("Aisha"), postsThisWeek: 14 },
];

const sparkline = (
  pattern: number[],
  highlight?: { index: number; label: string }
): PriceCardData["sparkline"] =>
  pattern.map((y, i) => ({
    x: i,
    y,
    label: highlight && highlight.index === i ? highlight.label : undefined,
  }));

export const priceCards: PriceCardData[] = [
  {
    id: "btc",
    pair: "BTC/USDT",
    assetName: "Bitcoin",
    tokenIconUrl: "/tokens/btc.svg",
    coinGeckoId: "bitcoin",
    price: 109685.9,
    changePercent: 1.9,
    trend: "up",
    sparkline: sparkline(
      [0.38, 0.42, 0.35, 0.50, 0.44, 0.58, 0.52, 0.67, 0.61, 0.72, 0.68, 0.80, 0.75, 0.85, 0.82, 0.90],
      { index: 13, label: "+1.9%" }
    ),
  },
  {
    id: "eth",
    pair: "ETH/USDT",
    assetName: "Ethereum",
    tokenIconUrl: "/tokens/eth.svg",
    coinGeckoId: "ethereum",
    price: 3485.9,
    changePercent: 2.4,
    trend: "up",
    sparkline: sparkline(
      [0.42, 0.38, 0.45, 0.52, 0.48, 0.55, 0.60, 0.57, 0.65, 0.70, 0.66, 0.74, 0.78, 0.72, 0.80, 0.85],
      { index: 14, label: "+2.4%" }
    ),
  },
  {
    id: "sol",
    pair: "SOL/USDT",
    assetName: "Solana",
    tokenIconUrl: "/tokens/sol.svg",
    coinGeckoId: "solana",
    price: 200.689,
    changePercent: 1.9,
    trend: "up",
    sparkline: sparkline(
      [0.50, 0.55, 0.48, 0.62, 0.57, 0.68, 0.63, 0.72, 0.68, 0.78, 0.74, 0.82, 0.78, 0.86, 0.82, 0.88],
      { index: 13, label: "+1.9%" }
    ),
  },
];

export const influenceBounties: InfluenceBountyItem[] = [
  {
    id: "y1",
    projectName: "Ethereum",
    tokenIconUrl: "/tokens/eth.svg",
    bountyUsdc: 500,
    description:
      "Great events deserve a system that does it all, from making tickets and smooth checkouts to helping you market",
    accentPhrase: "and tracking performances.",
  },
  {
    id: "y2",
    projectName: "Solana",
    tokenIconUrl: "/tokens/sol.svg",
    bountyUsdc: 1000,
    description:
      "Great events deserve a system that does it all, from making tickets and smooth checkouts to helping you market and tracking performances.",
  },
];

export const projectRows: ProjectRow[] = [
  { rank: 1, name: "Top 90",  projectId: "Base",     projectIconUrl: "/tokens/base.svg",  date: "2026-02-15", allocations: "1,000.000 B", status: "sold" },
  { rank: 2, name: "Top 50",  projectId: "Kaito",    projectIconUrl: "/tokens/kaito.svg", date: "2026-02-15", allocations: "7,000,000 K", status: "stacked" },
  { rank: 3, name: "Top 10",  projectId: "Lifted",   projectIconUrl: "/tokens/lifted.svg",date: "2026-02-15", allocations: "4,000,000 F", status: "pending" },
  { rank: 4, name: "Top 20",  projectId: "Lifted0.3",projectIconUrl: "/tokens/lifted.svg",date: "2026-02-15", allocations: "4,000,000 F", status: "pending" },
  { rank: 5, name: "Top 100", projectId: "BaseEth",  projectIconUrl: "/tokens/base.svg",  date: "2026-02-15", allocations: "4,000,000 F", status: "stacked" },
  { rank: 6, name: "Top 10",  projectId: "BaseBTC",  projectIconUrl: "/tokens/btc.svg",   date: "2026-02-15", allocations: "4,000,000 F", status: "sold" },
];

export const campaigns: import("./types").Campaign[] = [
  { id: "kaito",     name: "Kaito" },
  { id: "lifted",    name: "Lifted" },
  { id: "base",      name: "Base" },
  { id: "layer3",    name: "Layer3" },
  { id: "mimic",     name: "Mimic" },
  { id: "mantle",    name: "Mantle" },
  { id: "layerzero", name: "LayerZero" },
  { id: "artemis",   name: "Artemis" },
];

import type {
  EarningsBreakdownItem,
  EarningsPoint,
  PortfolioProjectRow,
} from "./types";

export const earningsChart: EarningsPoint[] = [
  { label: "Mar 9",  value: 1200 },
  { label: "Mar 14", value: 1450 },
  { label: "Mar 19", value: 2100 },
  { label: "Mar 24", value: 3000 },
  { label: "Mar 29", value: 5538.56 },
  { label: "Apr 3",  value: 7200 },
  { label: "Apr 5",  value: 8800 },
  { label: "Apr 9",  value: 7600 },
  { label: "Apr 14", value: 8400 },
  { label: "Apr 17", value: 6900 },
  { label: "Apr 19", value: 8100 },
  { label: "Apr 22", value: 9300 },
];

export const earningsHighlightIndex = 4;

export const earningsBreakdown: EarningsBreakdownItem[] = [
  { id: "campaigns",  iconName: "users",        label: "Campaigns",   amount: 12343.66 },
  { id: "branddeals", iconName: "clock",        label: "Brand Deals", amount: 7000 },
  { id: "projects",   iconName: "presentation", label: "Projects",    amount: 9003 },
  { id: "affiliate",  iconName: "badge-check",  label: "Affiliate",   amount: 10000 },
  { id: "others",     iconName: "hash",         label: "Others",      amount: 74959.9 },
];

export const portfolioTopProjects: PortfolioProjectRow[] = [
  { rank: 1, name: "Top 90",  projectId: "Base",     date: "2026-02-15", allocations: "1,000.000 B", status: "sold" },
  { rank: 2, name: "Top 50",  projectId: "Kaito",    date: "2026-02-15", allocations: "7,000,000 K", status: "stacked" },
  { rank: 3, name: "Top 10",  projectId: "Lifted",   date: "2026-02-15", allocations: "4,000,000 F", status: "pending" },
  { rank: 4, name: "Top 20",  projectId: "Lifted0.3",date: "2026-02-15", allocations: "4,000,000 F", status: "pending" },
  { rank: 5, name: "Top 100", projectId: "BaseEth",  date: "2026-02-15", allocations: "4,000,000 F", status: "stacked" },
  { rank: 6, name: "Top 10",  projectId: "BaseBTC",  date: "2026-02-15", allocations: "4,000,000 F", status: "sold" },
];

import type { TalkProjectRow } from "./types";

export const talkProjects: TalkProjectRow[] = [
  { id: "tp-base",     name: "Base",      userId: "02/15/2026", date: "02/15/2026", status: "sold" },
  { id: "tp-kaito",    name: "Kaito",     userId: "02/15/2026", date: "02/15/2026", status: "stacked" },
  { id: "tp-lifted",   name: "Lifted",    userId: "02/15/2026", date: "02/15/2026", status: "pending" },
  { id: "tp-lifted03", name: "Lifted0.3", userId: "02/15/2026", date: "02/15/2026", status: "pending" },
  { id: "tp-baseeth",  name: "BaseEth",   userId: "02/15/2026", date: "02/15/2026", status: "stacked" },
  { id: "tp-basebtc",  name: "BaseBTC",   userId: "02/15/2026", date: "02/15/2026", status: "sold" },
];

import type {
  CreatorRow,
  TopCreatorsStats,
  FeaturedCreator,
  ContentRow,
  DonutSegment,
} from "./types";

export const topCreatorsStats: TopCreatorsStats = {
  totalCreators: "2,555",
  totalCampaigns: "3,123",
  totalView: "25.67M",
  totalPayouts: "$1.57M",
};

export const topCreators: CreatorRow[] = Array.from({ length: 8 }).map((_, i) => ({
  rank: 1,
  id: `creator-${i + 1}`,
  handle: "@deecaptain",
  role: "Captain Designer",
  platform: "tiktok" as const,
  scoreLabel: "TikTok",
  views: "2.5M",
  engagementRate: 50.2,
  earnings: 70563,
}));

export const featuredCreators: FeaturedCreator[] = [
  { id: "adam-captain",  name: "Adam Captain",  caption: "10M+ Views last week", trend: "red",   tierLabel: "Top 100" },
  { id: "sarah-captain", name: "Sarah Captain", caption: "10M+ Views last week", trend: "green", tierLabel: "Top 100" },
];

export const topPerformingContent: ContentRow[] = [
  { id: "c1", thumbId: "creative-director-1", duration: "2:00", contentType: "Video", handle: "@deecaptain", role: "Captain Designer", platform: "youtube", scoreLabel: "TikTok", views: "2.5M", engagementRate: 50.2, watchTime: "32.4K hr", date: "May 28, 2024" },
  { id: "c2", thumbId: "work-fucking-hard",   duration: "2:00", contentType: "Video", handle: "@deecaptain", role: "Captain Designer", platform: "youtube", scoreLabel: "TikTok", views: "2.5M", engagementRate: 50.2, watchTime: "32.4K hr", date: "May 28, 2024" },
  { id: "c3", thumbId: "field-1",             duration: "0:30", contentType: "Reel",  handle: "@deecaptain", role: "Captain Designer", platform: "tiktok",  scoreLabel: "TikTok", views: "2.5M", engagementRate: 50.2, watchTime: "32.4K hr", date: "May 28, 2024" },
  { id: "c4", thumbId: "phone-1",             duration: "0:30", contentType: "Reel",  handle: "@deecaptain", role: "Captain Designer", platform: "tiktok",  scoreLabel: "TikTok", views: "2.5M", engagementRate: 50.2, watchTime: "32.4K hr", date: "May 28, 2024" },
  { id: "c5", thumbId: "creative-director-2", duration: "0:30", contentType: "Short", handle: "@deecaptain", role: "Captain Designer", platform: "tiktok",  scoreLabel: "TikTok", views: "2.5M", engagementRate: 50.2, watchTime: "32.4K hr", date: "May 28, 2024" },
  { id: "c6", thumbId: "phone-2",             duration: "0:30", contentType: "Short", handle: "@deecaptain", role: "Captain Designer", platform: "tiktok",  scoreLabel: "TikTok", views: "2.5M", engagementRate: 50.2, watchTime: "32.4K hr", date: "May 28, 2024" },
  { id: "c7", thumbId: "phone-3",             duration: "0:30", contentType: "Reel",  handle: "@deecaptain", role: "Captain Designer", platform: "tiktok",  scoreLabel: "TikTok", views: "2.5M", engagementRate: 50.2, watchTime: "32.4K hr", date: "May 28, 2024" },
  { id: "c8", thumbId: "creative-director-3", duration: "2:00", contentType: "Video", handle: "@deecaptain", role: "Captain Designer", platform: "youtube", scoreLabel: "TikTok", views: "2.5M", engagementRate: 50.2, watchTime: "32.4K hr", date: "May 28, 2024" },
];

export const topPerformingDonut: DonutSegment[] = [
  { label: "The Creator", value: 22, color: "rgb(255 255 255 / 0.85)" },
  { label: "The Creator", value: 28, color: "rgb(255 255 255 / 0.45)" },
  { label: "The Creator", value: 18, color: "rgb(80 220 130)" },
  { label: "The Creator", value: 14, color: "rgb(80 220 130 / 0.7)" },
  { label: "The Creator", value: 12, color: "rgb(80 220 130 / 0.45)" },
  { label: "The Creator", value: 6,  color: "rgb(255 255 255 / 0.15)" },
];