import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/cn";
import { PRIMARY_NAV, isNavActive } from "./navItems";

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-start justify-between border-t border-white/[0.05] md:hidden"
      style={{
        background: "rgba(6,8,14,0.82)",
        backdropFilter: "blur(3.35px)",
        WebkitBackdropFilter: "blur(3.35px)",
        padding: "4px 4px 0",
        paddingBottom: "max(env(safe-area-inset-bottom), 12px)",
        fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      {PRIMARY_NAV.map(({ to, short, icon: Icon }) => {
        const isActive = isNavActive(to, pathname);
        return (
          <NavLink
            key={to}
            to={to}
            className="flex flex-col items-center justify-center gap-1 flex-1 p-2 transition-colors"
          >
            <Icon
              className={cn("w-5 h-5 transition-colors", isActive ? "text-[#4a7dff]" : "text-[#6e6e6e]")}
              strokeWidth={isActive ? 2.5 : 1.8}
            />
            <span className={cn("text-[12px] leading-4 font-medium transition-colors", isActive ? "text-[#4a7dff]" : "text-[#6e6e6e]")}>
              {short}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
