import { apiGet, apiPost, apiGetPublic } from "./client";

// ——— Auth / User ———
export const getMe = () => apiGet<{ user: any }>("/me");

// ——— Bounties ———
export const getBounties = () =>
  apiGetPublic<{ bounties: any[] }>("/bounties");

export const getBounty = (id: string) =>
  apiGetPublic<{ bounty: any }>(`/bounties/${id}`);

export const claimBounty = (id: string) =>
  apiPost<{ claim: any }>(`/bounties/${id}/claim`);

// ——— Portfolio ———
export const getEarnings = () =>
  apiGet<{ earnings: any[] }>("/portfolio/earnings");

export const getPortfolioStats = () =>
  apiGet<{ stats: any }>("/portfolio/stats");

export const getClaims = () =>
  apiGet<{ claims: any[] }>("/portfolio/claims");

// ——— Analytics ———
export const syncTikTok = () =>
  apiPost<{ message: string; synced: number }>("/analytics/tiktok/sync");

export const getTikTokAnalytics = () =>
  apiGet<{ analytics: any }>("/analytics/tiktok");

export const getTopCreators = () =>
  apiGetPublic<{ creators: any[] }>("/analytics/top-creators");