import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Overview",
  "/admin/campaigns": "Campaigns",
  "/admin/users": "Users",
  "/admin/trending": "Trending",
  "/admin/metrics": "AI Metrics",
  "/admin/audit-log": "Audit Log",
};

export function AdminTopBar() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? "Admin";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between gap-6 px-10 pt-6 pb-2">
        <h1 className="font-display text-[26px] font-medium tracking-tight text-fg-primary">{title}</h1>
        <div className="flex items-center gap-3">
          <button className="glass h-12 px-4 rounded-full flex items-center transition-colors hover:border-white/[0.12]">
            <Bell className="w-5 h-5 text-fg-secondary" />
          </button>
          <div className="glass h-12 px-5 rounded-full flex items-center">
            <span className="text-[13px] text-fg-primary font-medium whitespace-nowrap">{today}</span>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center justify-between px-4 pt-4 pb-2">
        <h1 className="font-display text-[19px] font-medium tracking-tight text-fg-primary">{title}</h1>
        <button className="glass h-9 w-9 rounded-full flex items-center justify-center transition-colors hover:border-white/[0.12]">
          <Bell className="w-4 h-4 text-fg-secondary" />
        </button>
      </div>
    </>
  );
}