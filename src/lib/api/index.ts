import { apiGet, apiPost, apiGetPublic, apiPut, apiDelete } from "./client";
import { supabase } from "./supabase";
import type { InfluenceRatingResponse, AnalyticsInsights, CreatorProfileResponse } from "../types";
import type { ReadinessComponents, ReadinessMetrics } from "../readiness";

// ——— Auth / User ———
export const getMe = () => apiGet<{ user: any }>("/me");

export const getInfluenceRating = () =>
  apiGet<InfluenceRatingResponse>("/me/influence-rating");

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

// Zerra leaderboard: points accumulated across campaigns (the general reach/
// engagement board is getTopCreators above).
export const getZerraLeaderboard = () =>
  apiGetPublic<{ leaderboard: any[] }>("/bounties/leaderboard");

export const getAnalyticsInsights = () =>
  apiGet<AnalyticsInsights>("/analytics/tiktok/insights");

// ——— Instagram ———
// Redirects the user to Meta's OAuth flow. The backend callback handles
// the token exchange and saves the connection to social_accounts.
export async function connectInstagram() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated");
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/instagram?token=${token}`;
}

export const getInstagramMedia = () =>
  apiGet<{ media: any[] }>("/auth/instagram/media");

export const getInstagramInsights = () =>
  apiGet<{ insights: any }>("/auth/instagram/insights");

export const publishToInstagram = (body: {
  image_url?: string;
  video_url?: string;
  caption?: string;
  media_type?: "IMAGE" | "VIDEO" | "REELS";
}) => apiPost<{ success: boolean; mediaId: string }>("/auth/instagram/publish", body);

// ——— Profile ———
export const updateProfile = (body: { name?: string; username?: string; bio?: string; location?: string; niche?: string }) =>
  apiPut<{ user: any }>("/me/profile", body);

// ——— Creator Profile ———
export const getCreatorProfile = (username: string) =>
  apiGet<CreatorProfileResponse>(`/creators/${encodeURIComponent(username)}`);

// ——— Twitter / X ———
// Same shape as connectInstagram — needs a real X Developer App registered
// (TWITTER_CLIENT_ID/SECRET/REDIRECT_URI in the backend env) before this
// actually completes; the redirect itself always works.
export async function connectTwitter() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated");
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/twitter?token=${token}`;
}

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
// ——— Smart Readiness ———
export interface ReadinessSnapshot {
  snapshot_date: string;
  followers_total: number;
  sampled: number;
  quality_followers: number;
  seed_followers: number;
  posts_30d: number;
  score: number;
  tier: string;
  created_at: string;
  algo_version: number | null;
  components: ReadinessComponents | null;
  metrics: ReadinessMetrics | null;
  niches: { niche: string; score: number; label: string; posts: number }[] | null;
}
export interface ReadinessVoice {
  niche: string;
  score: number;
  label: string;
  posts: number;
  rank: number;
  cohort: number;
  top_percent: number | null;
}
export interface ReadinessResponse {
  available: boolean;
  connected: boolean;
  username: string | null;
  latest: ReadinessSnapshot | null;
  voices: ReadinessVoice[];
  trend: { date: string; score: number }[];
}
export const getReadiness = () => apiGet<ReadinessResponse>("/readiness/me");
export const refreshReadiness = () => apiPost<{ ok: true }>("/readiness/me/refresh");

export interface SeedAccount { id: string; handle: string; note: string | null; created_at: string; name?: string | null; avatar?: string | null; followers?: number | null }
export const getSeedAccounts = () => apiGet<{ seeds: SeedAccount[] }>("/admin/readiness/seeds");
export interface XUserSuggestion { handle: string; name: string | null; avatar: string | null; followers: number | null; verified: boolean }
export const searchXUsers = (q: string) => apiGet<{ users: XUserSuggestion[] }>(`/admin/readiness/user-search?q=${encodeURIComponent(q)}`);
export const addSeedAccount = (u: XUserSuggestion) =>
  apiPost<{ added: number }>("/admin/readiness/seeds", { handle: u.handle, name: u.name, avatar: u.avatar, followers: u.followers });
export const addSeedAccounts = (handles: string[]) => apiPost<{ added: number }>("/admin/readiness/seeds", { handles });
export type CandidateStatus = "discovered" | "emerging" | "under_review";
export interface Candidate {
  handle: string; name: string | null; avatar: string | null; followers: number | null; status: CandidateStatus;
  niche_primary: string | null; niche_secondary: string | null;
  originals: number; quotes: number; active_days: number;
  median_views: number | null; median_er: number | null;
  discovery_score: number; coverage: number;
  authenticity: "High" | "Medium" | "Low" | null; data_confidence: "High" | "Medium" | "Low" | null;
  last_post_at: string | null;
}
export const getCandidates = () => apiGet<{ candidates: Candidate[]; approved: number; rejected: number }>("/admin/readiness/candidates");
export const decideCandidate = (c: Candidate, decision: "approved" | "rejected" | "under_review") =>
  apiPost<{ ok: true }>("/admin/readiness/candidates/decide", { handle: c.handle, decision, name: c.name, avatar: c.avatar, followers: c.followers });
export const deleteSeedAccount = (id: string) => apiDelete<{ ok: true }>(`/admin/readiness/seeds/${id}`);

// ——— Trending ———
export interface TrendingPost {
  id: string;
  title: string | null;
  cover_image_url: string | null;
  creator_name: string | null;
  creator_avatar: string | null;
  handle: string | null;
  niche: string | null;
  platform: string;
  views: number;
  engagement_rate: number;
  posted_at: string;
  url: string | null;
  topics: string[];
}
export interface TrendingTopic {
  topic: string;
  posts: number;
  views: number;
  sample: { title: string | null; handle: string } | null;
}
export interface TrendingResponse {
  updated_at: string | null;
  top: TrendingPost[];
  posts: TrendingPost[];
  topics: TrendingTopic[];
  niches: { niche: string; share: number }[];
}
export const getTrending = () => apiGetPublic<TrendingResponse>("/analytics/trending");

// ——— Creator Tasks ———
export interface CreatorTask { id: string; title: string; done: boolean }
export interface TaskWeekDay { date: string; active: boolean; future: boolean; today: boolean }
export type PlanKind = "reply" | "thread" | "article" | "post";
export interface TaskPlan {
  id: string; kind: PlanKind; per_week: number; unit: "weeks" | "months"; duration: number;
  start_date: string; end_date: string; week_index: number; total_weeks: number;
  this_week: number; weeks_met: number; ended: boolean;
}
export interface TasksState {
  plans: TaskPlan[];
  syncing: boolean;
  tasks: CreatorTask[];
  done: number;
  total: number;
  streak: number;
  week: TaskWeekDay[];
}
export const getTasks = (today: string) => apiGet<TasksState>(`/tasks?today=${today}&tz=${new Date().getTimezoneOffset()}`);
export const addPlan = (p: { kind: PlanKind; per_week: number; unit: "weeks" | "months"; duration: number; today: string }) =>
  apiPost<{ id: string }>("/tasks/plans", { ...p, tz: new Date().getTimezoneOffset() });
export const deletePlan = (id: string) => apiDelete<{ ok: true }>(`/tasks/plans/${id}`);
export const getTaskActivity = (from: string, to: string) =>
  apiGet<{ days: string[] }>(`/tasks/activity?from=${from}&to=${to}`);
export const addTask = (title: string) => apiPost<{ task: CreatorTask }>("/tasks", { title });
export const toggleTask = (id: string, day: string) => apiPost<{ done: boolean }>(`/tasks/${id}/toggle`, { day });
export const deleteTask = (id: string) => apiDelete<{ ok: true }>(`/tasks/${id}`);

// ——— X profile sync ———
// Pulls the connected X account's name and picture into the user's profile. Throttled server-side.
export const syncXProfileNow = () =>
  apiPost<{ ok: boolean; skipped?: boolean; reason?: string }>("/readiness/me/sync-profile");

// ——— Leaderboard ———
export interface LeaderboardEntry {
  rank: number;
  name: string | null;
  avatar: string | null;
  handle: string | null;
  score: number;
  followers: number;
}
export const getLeaderboard = () =>
  apiGetPublic<{ total: number; entries: LeaderboardEntry[] }>("/readiness/leaderboard");
