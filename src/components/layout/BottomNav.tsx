import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Star, Compass, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { to: "/dashboard",  label: "Home",      icon: LayoutDashboard },
  { to: "/influence",  label: "Influence", icon: Star },
  { to: "/explore",    label: "Explore",   icon: Compass },
  { to: "/referrals",  label: "Referrals", icon: Users },
  { to: "/market",     label: "Market",    icon: TrendingUp },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/[0.06] md:hidden"
      style={{ background: "rgb(6 8 14)", height: 64, paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
        const isActive = to === "/influence"
          ? location.pathname === "/influence" || location.pathname.startsWith("/influence/")
          : location.pathname === to || location.pathname.startsWith(to + "/");

        return (
          <NavLink
            key={to}
            to={to}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors"
          >
            <Icon
              className={cn("w-5 h-5 transition-colors", isActive ? "text-brand" : "text-fg-muted")}
              strokeWidth={isActive ? 2.5 : 1.8}
            />
            <span className={cn("text-[10px] font-medium transition-colors", isActive ? "text-brand" : "text-fg-muted")}>
              {label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}