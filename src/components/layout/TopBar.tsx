import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search, Bell } from "lucide-react";
import { cn } from "@/lib/cn";
import { useState, useCallback } from "react";

interface TabConfig {
  tabs: readonly string[];
  activeTab: string;
  onTabClick: (tab: string) => void;
}

function useTabConfig(): TabConfig {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const pathname  = location.pathname;

  if (pathname.startsWith("/influence")) {
    const activeTab = pathname.startsWith("/influence/top-performing") ? "Top Performing" : "Top Creators";
    return {
      tabs: ["Top Creators", "Top Performing"],
      activeTab,
      onTabClick: (tab) => tab === "Top Creators" ? navigate("/influence") : navigate("/influence/top-performing"),
    };
  }
  if (pathname.startsWith("/explore")) {
    const activeTab = searchParams.get("tab") === "past" ? "Past Campaigns" : "Active Campaigns";
    return {
      tabs: ["Active Campaigns", "Past Campaigns"],
      activeTab,
      onTabClick: (tab) => tab === "Past Campaigns" ? setSearchParams({ tab: "past" }) : setSearchParams({}),
    };
  }
  if (pathname.startsWith("/portfolio")) {
    const activeTab = searchParams.get("tab") === "payments" ? "Payments" : "Overview";
    return {
      tabs: ["Overview", "Payments"],
      activeTab,
      onTabClick: (tab) => tab === "Payments" ? setSearchParams({ tab: "payments" }) : setSearchParams({}),
    };
  }
  if (pathname.startsWith("/dashboard")) {
    const activeTab = searchParams.get("tab") === "analytics" ? "Analytics" : "Overview";
    return {
      tabs: ["Overview", "Analytics"],
      activeTab,
      onTabClick: (tab) => tab === "Analytics" ? setSearchParams({ tab: "analytics" }) : setSearchParams({}),
    };
  }
  if (pathname.startsWith("/market"))   return { tabs: ["Market"],   activeTab: "Market",   onTabClick: () => {} };
  if (pathname.startsWith("/wallet"))   return { tabs: ["Wallet"],   activeTab: "Wallet",   onTabClick: () => {} };
  if (pathname.startsWith("/settings")) return { tabs: ["Settings"], activeTab: "Settings", onTabClick: () => {} };
  return { tabs: ["Overview"], activeTab: "Overview", onTabClick: () => {} };
}

// Pages where the search bar actually filters content
// We broadcast via a custom event so each page can listen independently
function useSearch() {
  const location = useLocation();
  const searchablePages = ["/influence", "/explore", "/creators", "/market"];
  const isSearchable = searchablePages.some((p) => location.pathname.startsWith(p));

  const handleSearch = useCallback((value: string) => {
    window.dispatchEvent(new CustomEvent("zerra:search", { detail: { query: value } }));
  }, []);

  return { isSearchable, handleSearch };
}

export function TopBar() {
  const { tabs, activeTab, onTabClick } = useTabConfig();
  const { isSearchable, handleSearch }  = useSearch();
  const [query, setQuery] = useState("");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    handleSearch(e.target.value);
  };

  return (
    <>
      {/* ── DESKTOP TopBar ── */}
      <div className="hidden md:flex items-center justify-between gap-6 px-10 pt-6 pb-2">
        <div className="flex items-baseline gap-8">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => onTabClick(tab)}
              className={cn(
                "font-display text-[30px] font-medium tracking-tight transition-colors",
                tabs.length === 1
                  ? "text-fg-primary cursor-default"
                  : activeTab === tab
                    ? "text-fg-primary"
                    : "text-fg-muted hover:text-fg-secondary"
              )}>
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {/* Search — only shown on searchable pages */}
          {isSearchable && (
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-tertiary pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={onSearchChange}
                placeholder="Search..."
                className={cn(
                  "glass h-12 pl-12 pr-6 w-[280px] rounded-full",
                  "text-[14px] text-fg-primary placeholder:text-fg-tertiary",
                  "focus:outline-none focus:border-white/[0.12] transition-colors"
                )}
              />
            </div>
          )}
          <button className="glass h-12 px-4 rounded-full flex items-center transition-colors hover:border-white/[0.12]">
            <Bell className="w-5 h-5 text-fg-secondary" />
          </button>
          <div className="glass h-12 px-5 rounded-full flex items-center">
            <span className="text-[13px] text-fg-primary font-medium whitespace-nowrap">{today}</span>
          </div>
        </div>
      </div>

      {/* ── MOBILE TopBar ── */}
      <div className="flex md:hidden items-center justify-between px-4 pt-4 pb-2 gap-3">
        <div className="flex items-baseline gap-4 min-w-0">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => onTabClick(tab)}
              className={cn(
                "font-display text-[22px] font-medium tracking-tight transition-colors truncate",
                tabs.length === 1
                  ? "text-fg-primary cursor-default"
                  : activeTab === tab
                    ? "text-fg-primary"
                    : "text-fg-muted"
              )}>
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isSearchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-fg-tertiary pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={onSearchChange}
                placeholder="Search..."
                className={cn(
                  "glass h-9 pl-9 pr-3 w-[140px] rounded-full",
                  "text-[13px] text-fg-primary placeholder:text-fg-tertiary",
                  "focus:outline-none focus:border-white/[0.12] transition-all",
                  "focus:w-[180px]"
                )}
              />
            </div>
          )}
          <button className="glass h-9 w-9 rounded-full flex items-center justify-center transition-colors hover:border-white/[0.12]">
            <Bell className="w-4 h-4 text-fg-secondary" />
          </button>
        </div>
      </div>
    </>
  );
}