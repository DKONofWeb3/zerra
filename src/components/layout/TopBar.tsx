import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search, Bell } from "lucide-react";
import { cn } from "@/lib/cn";

interface TabConfig {
  tabs: readonly [string, string];
  activeTab: string;
  onTabClick: (tab: string) => void;
}

function useTabConfig(): TabConfig {
  const location   = useLocation();
  const navigate   = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const pathname   = location.pathname;

  if (pathname.startsWith("/influence")) {
    const activeTab = pathname.startsWith("/influence/top-performing")
      ? "Top Performing" : "Top Creators";
    return {
      tabs: ["Top Creators", "Top Performing"],
      activeTab,
      onTabClick: (tab) => {
        if (tab === "Top Creators") navigate("/influence");
        else navigate("/influence/top-performing");
      },
    };
  }

  if (pathname.startsWith("/explore")) {
    const activeTab = searchParams.get("tab") === "past"
      ? "Past Campaigns" : "Active Campaigns";
    return {
      tabs: ["Active Campaigns", "Past Campaigns"],
      activeTab,
      onTabClick: (tab) => {
        if (tab === "Past Campaigns") setSearchParams({ tab: "past" });
        else setSearchParams({});
      },
    };
  }

  if (pathname.startsWith("/portfolio")) {
    const activeTab = searchParams.get("tab") === "payments"
      ? "Payments" : "Overview";
    return {
      tabs: ["Overview", "Payments"],
      activeTab,
      onTabClick: (tab) => {
        if (tab === "Payments") setSearchParams({ tab: "payments" });
        else setSearchParams({});
      },
    };
  }

  return {
    tabs: ["Overview", "Analytics"],
    activeTab: "Overview",
    onTabClick: () => {},
  };
}

export function TopBar() {
  const { tabs, activeTab, onTabClick } = useTabConfig();

  // Real current date
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-center justify-between gap-6 px-10 pt-6 pb-2">
      {/* Tabs */}
      <div className="flex items-baseline gap-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabClick(tab)}
            className={cn(
              "font-display text-[30px] font-medium tracking-tight transition-colors",
              activeTab === tab
                ? "text-fg-primary"
                : "text-fg-muted hover:text-fg-secondary"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-tertiary pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className={cn(
              "glass h-12 pl-12 pr-6 w-[300px] rounded-full",
              "text-[14px] text-fg-primary placeholder:text-fg-tertiary",
              "focus:outline-none focus:border-white/[0.12]"
            )}
          />
        </div>

        {/* Notifications */}
        <button className={cn(
          "glass h-12 px-4 rounded-full flex items-center gap-3",
          "transition-colors hover:border-white/[0.12]"
        )}>
          <Bell className="w-5 h-5 text-fg-secondary" />
        </button>

        {/* Real date */}
        <div className="glass h-12 px-5 rounded-full flex items-center">
          <span className="text-[13px] text-fg-primary font-medium whitespace-nowrap">
            {today}
          </span>
        </div>
      </div>
    </div>
  );
}