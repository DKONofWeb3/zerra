import { LayoutDashboard, ClipboardList, TrendingUp, Trophy, Settings } from "lucide-react";

/**
 * Primary navigation (desktop top bar + mobile bottom bar), per the Bloom
 * dashboard design. Tasks / Trending / Leaderboard point at the closest
 * existing pages until their own designs land. Everything that used to live
 * in the sidebar and isn't here (Portfolio, Referrals, Market, Wallet) is
 * reachable from the avatar menu.
 */
export const PRIMARY_NAV = [
  { to: "/dashboard",           label: "Dashboard",   short: "Home",        icon: LayoutDashboard },
  { to: "/explore",             label: "Tasks",       short: "Tasks",       icon: ClipboardList },
  { to: "/influence",           label: "Trending",    short: "Trending",    icon: TrendingUp },
  { to: "/explore/leaderboard", label: "Leaderboard", short: "Leaderboard", icon: Trophy },
  { to: "/settings",            label: "Settings",    short: "Settings",    icon: Settings },
] as const;

export function isNavActive(to: string, pathname: string): boolean {
  if (to === "/explore") return pathname === "/explore";
  return pathname === to || pathname.startsWith(to + "/");
}

export const MENU_LINKS = [
  { to: "/portfolio", label: "Portfolio" },
  { to: "/referrals", label: "Referrals" },
  { to: "/market",    label: "Market" },
  { to: "/wallet",    label: "Wallet" },
] as const;
