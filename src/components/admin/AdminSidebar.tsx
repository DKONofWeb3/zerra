import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";
import {
  LayoutGrid, Megaphone, Users, BarChart3, TrendingUp, ShieldAlert,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin",            label: "Overview",   icon: LayoutGrid },
  { to: "/admin/campaigns",  label: "Campaigns",   icon: Megaphone },
  { to: "/admin/users",      label: "Users",       icon: Users },
  { to: "/admin/trending",   label: "Trending",    icon: TrendingUp },
  { to: "/admin/metrics",    label: "AI Metrics",  icon: BarChart3 },
  { to: "/admin/audit-log",  label: "Audit Log",   icon: ShieldAlert },
];

export function AdminSidebar() {
  return (
    <aside className="w-[240px] shrink-0 flex flex-col border-r border-white/[0.06] h-full">
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-center gap-2">
          <span className="text-[17px] font-display font-bold tracking-[1.5px] uppercase text-brand">
            ZERRA
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/[0.08] bg-bg-elevated text-fg-tertiary uppercase tracking-wider">
            Admin
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors",
                isActive
                  ? "bg-brand/10 text-brand border border-brand/20"
                  : "text-fg-tertiary hover:text-fg-secondary hover:bg-white/[0.03] border border-transparent"
              )
            }
          >
            <Icon className="w-[17px] h-[17px]" strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-5 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 px-2">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-[11.5px] text-fg-tertiary">All systems operational</span>
        </div>
      </div>
    </aside>
  );
}