import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";
import { LayoutGrid, Megaphone, Users, BarChart3, TrendingUp } from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin",           label: "Overview",  icon: LayoutGrid },
  { to: "/admin/campaigns", label: "Campaigns",  icon: Megaphone },
  { to: "/admin/users",     label: "Users",      icon: Users },
  { to: "/admin/trending",  label: "Trending",   icon: TrendingUp },
  { to: "/admin/metrics",   label: "Metrics",    icon: BarChart3 },
];

export function AdminBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] border-t border-white/[0.06]"
      style={{ background: "rgb(8 9 14 / 0.92)", backdropFilter: "blur(16px)" }}>
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/admin"}
          className="flex-1 flex flex-col items-center gap-1 py-1.5"
        >
          {({ isActive }: { isActive: boolean }) => (
            <>
              <Icon
                className={cn("w-[20px] h-[20px]", isActive ? "text-brand" : "text-fg-muted")}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={cn("text-[10px] font-medium", isActive ? "text-brand" : "text-fg-muted")}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}