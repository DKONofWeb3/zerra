import { LayoutDashboard, ClipboardList, TrendingUp, Trophy, Settings } from "lucide-react";

/**
 * Primary navigation (desktop top bar + mobile bottom bar), per the Bloom
 * dashboard design. Tasks / Trending / Leaderboard point at the closest
 * existing pages until their own designs land. Other pages live in the avatar
 * menu (see MENU_LINKS).
 */
export const PRIMARY_NAV = [
  { to: "/dashboard",           label: "Dashboard",   short: "Home",        icon: LayoutDashboard },
  { to: "/explore",             label: "Tasks",       short: "Tasks",       icon: ClipboardList },
  { to: "/trending",            label: "Trending",    short: "Trending",    icon: TrendingUp },
  { to: "/explore/leaderboard", label: "Leaderboard", short: "Leaderboard", icon: Trophy },
  { to: "/settings",            label: "Settings",    short: "Settings",    icon: Settings },
] as const;

export function isNavActive(to: string, pathname: string): boolean {
  if (to === "/explore") return pathname === "/explore";
  return pathname === to || pathname.startsWith(to + "/");
}

// Portfolio, Market, Wallet and Influence are hidden from the menu for now (the
// pages and routes still exist). Add them back here when they return.
export const MENU_LINKS = [
  { to: "/referrals", label: "Referrals" },
  { to: "/readiness", label: "Smart Readiness" },
] as const;
