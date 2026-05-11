import { NavLink } from "react-router-dom";
import { TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SubNavItem {
  to: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SubNavFlyoutProps {
  /** Vertical anchor in pixels from sidebar top — aligns flyout with parent row. */
  topOffset: number;
  /** Sub-nav items to render. */
  items: SubNavItem[];
  /** Pointer enter/leave for hover-tracking. */
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  /** Called when a sub-item is clicked — for collapsing the flyout. */
  onItemClick?: () => void;
}

/**
 * Translucent flyout panel that appears beside the sidebar showing
 * sub-navigation for a parent route (currently used for Yap children).
 *
 * Positioned absolutely within the AppLayout — sits to the right of the
 * 320px sidebar and anchors vertically to the parent nav row.
 *
 * Visuals match the design system: glassy translucent panel with a
 * brighter top rim, soft border, and a faint blur on whatever sits behind.
 */
export function SubNavFlyout({
  topOffset,
  items,
  onPointerEnter,
  onPointerLeave,
  onItemClick,
}: SubNavFlyoutProps) {
  return (
    <div
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={cn(
        "relative w-[280px]",
        "animate-[flyoutIn_180ms_cubic-bezier(0.2,0.8,0.2,1)]"
      )}
      style={{ top: topOffset }}
    >
      {/* Connector chevron pointing back to the sidebar row */}
      <div
        aria-hidden
        className="absolute -left-1.5 top-5 w-3 h-3 rotate-45"
        style={{
          background: "rgb(var(--bg-card) / 0.85)",
          borderLeft: "1px solid rgb(255 255 255 / 0.07)",
          borderBottom: "1px solid rgb(255 255 255 / 0.07)",
        }}
      />

      <div
        className={cn(
          "relative ml-3 rounded-2xl p-2",
          "border border-white/[0.07]",
          "shadow-[0_18px_50px_-12px_rgb(0_0_0_/_0.6)]",
          "backdrop-blur-xl"
        )}
        style={{
          background:
            "linear-gradient(180deg, rgb(255 255 255 / 0.04) 0%, rgb(255 255 255 / 0.01) 100%), rgb(var(--bg-card) / 0.85)",
        }}
      >
        {/* Top rim */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.16), transparent)",
          }}
        />

        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onItemClick}
                className={({ isActive }) =>
                  cn(
                    "group flex items-start gap-3 rounded-xl px-2.5 py-2.5",
                    "transition-colors",
                    isActive
                      ? "bg-white/[0.05]"
                      : "hover:bg-white/[0.03]"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "shrink-0 grid place-items-center w-9 h-9 rounded-lg transition-colors",
                        isActive
                          ? "bg-bg-base/80 border border-white/[0.10] text-fg-primary"
                          : "border border-white/[0.05] bg-white/[0.02] text-fg-tertiary group-hover:text-fg-secondary"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="flex-1 min-w-0 leading-tight">
                      <div
                        className={cn(
                          "text-[13.5px] font-medium",
                          isActive ? "text-fg-primary" : "text-fg-secondary"
                        )}
                      >
                        {item.label}
                      </div>
                      <div className="text-[11.5px] text-fg-muted mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** The Yap sub-nav children — exported so the Sidebar can wire them up. */
export const YAP_SUB_NAV: SubNavItem[] = [
  {
    to: "/yap/top-creators",
    label: "Top Creators",
    description: "Leaderboards & rankings",
    icon: Users,
  },
  {
    to: "/yap/top-performing",
    label: "Top Performing",
    description: "Highest-performing content",
    icon: TrendingUp,
  },
];
