import { apiGet, apiPost, apiGetPublic, apiPut, apiDelete } from "./client";


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

// ——— Profile ———
export const updateProfile = (body: { name?: string; username?: string }) =>
  apiPut<{ user: any }>("/me/profile", body);

// ——— Notifications ———
export const updateNotifications = (body: { email: boolean; push: boolean; campaigns: boolean }) =>
  apiPut<{ user: any }>("/me/notifications", body);

// ——— Privacy ———
export const updatePrivacy = (body: { public_profile: boolean }) =>
  apiPut<{ user: any }>("/me/privacy", body);

// ——— Password ———
export const changePassword = (body: { new_password: string }) =>
  apiPut<{ success: boolean }>("/me/password", body);

export const clearWallet = () =>
  apiDelete<{ user: any }>("/me/wallet");

// ——— Wallet ———
export const saveWallet = (body: { wallet_address: string; wallet_chain?: string }) =>
  apiPut<{ user: any }>("/me/wallet", body);