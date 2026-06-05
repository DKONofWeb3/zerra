import { useState, useEffect } from "react";
import { Search, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/cn";

function getTabsForRoute(pathname: string): readonly [string, string] {
  if (pathname.startsWith("/influence")) return ["Top Creators", "Top Performing"];
  if (pathname.startsWith("/explore")) return ["Active Campaigns", "Past Campaigns"];
  return ["Update", "Dashboard"];
}

export function TopBar() {
  const location = useLocation();
  const tabs = getTabsForRoute(location.pathname);
  const [activeTab, setActiveTab] = useState<string>(tabs[1]);

  // Reset active tab when route changes
  useEffect(() => {
    const newTabs = getTabsForRoute(location.pathname);
    setActiveTab(newTabs[1]);
  }, [location.pathname]);

  return (
    <div className="flex items-center justify-between gap-6 px-10 pt-6 pb-2">
      {/* Tabs */}
      <div className="flex items-baseline gap-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
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
            placeholder="Next Payout"
            className={cn(
              "glass h-12 pl-12 pr-6 w-[400px] rounded-full",
              "text-[14px] text-fg-primary placeholder:text-fg-tertiary",
              "focus:outline-none focus:border-white/[0.12]"
            )}
          />
        </div>

        {/* Notifications */}
        <button className={cn(
          "glass h-12 pl-4 pr-5 rounded-full flex items-center gap-3",
          "transition-colors hover:border-white/[0.12]"
        )}>
          <span className="relative">
            <Bell className="w-5 h-5 text-fg-secondary" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-danger ring-2 ring-bg-card" />
          </span>
          <span className="text-[13px] text-fg-secondary">2 new</span>
        </button>

        {/* Date stepper */}
        <div className="glass h-12 px-3 rounded-full flex items-center gap-2">
          <button aria-label="Previous day" className="grid place-items-center w-7 h-7 rounded-full text-fg-tertiary hover:text-fg-primary transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[13px] text-fg-primary px-1 whitespace-nowrap font-medium">
            Today, Apr 8
          </span>
          <button aria-label="Next day" className="grid place-items-center w-7 h-7 rounded-full text-fg-tertiary hover:text-fg-primary transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}