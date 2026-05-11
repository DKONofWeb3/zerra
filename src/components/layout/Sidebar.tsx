import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  MessageSquareText,
  Compass,
  TrendingUp,
  Wallet,
  ChevronRight,
  Flame,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { currentUser } from "@/lib/mock-data";
import { SubNavFlyout, YAP_SUB_NAV } from "./SubNavFlyout";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  /** When set, this row owns a flyout sub-nav; the chevron toggles its pinned state. */
  hasFlyout?: boolean;
}

const accountItems: NavItem[] = [
  { to: "/portfolio", label: "Portfolio", icon: Briefcase, badge: 10 },
  { to: "/yap", label: "Yap", icon: MessageSquareText, hasFlyout: true },
  { to: "/explore", label: "Explore", icon: Compass, badge: 10 },
];

const activityItems: NavItem[] = [
  { to: "/market", label: "Market", icon: TrendingUp, badge: 10 },
  { to: "/wallet", label: "Wallet", icon: Wallet },
];

/** Whether a path is anywhere in the yap area (parent or subroute). */
function yapActiveStatic(path: string): boolean {
  return path === "/yap" || path.startsWith("/yap/");
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 mb-3 text-[11px] uppercase tracking-[0.12em] font-medium text-fg-muted">
      {children}
    </div>
  );
}

function DashboardRow() {
  return (
    <NavLink
      to="/"
      end
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-3 rounded-2xl pl-2 pr-3 py-2 transition-all",
          isActive ? "glass-strong" : "hover:bg-white/[0.03]"
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "grid place-items-center w-10 h-10 rounded-xl transition-all",
              isActive
                ? "bg-bg-base/80 text-fg-primary border border-white/[0.08] shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.08)]"
                : "border border-stroke bg-bg-card text-fg-secondary group-hover:text-fg-primary"
            )}
          >
            <LayoutDashboard className="w-[18px] h-[18px]" />
          </span>
          <span
            className={cn(
              "flex-1 text-[15px] font-medium",
              isActive ? "text-fg-primary" : "text-fg-secondary"
            )}
          >
            Dashboard
          </span>
          {isActive && (
            <span
              aria-hidden
              className="text-fg-primary text-lg leading-none animate-blink"
            >
              |
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

interface NavRowProps {
  item: NavItem;
  /** Called when the chevron is clicked — only meaningful for flyout rows. */
  onChevronClick?: (e: React.MouseEvent) => void;
  /** Called when pointer enters the row — for hover-flyout. */
  onPointerEnter?: () => void;
  /** Called when pointer leaves the row — for hover-flyout. */
  onPointerLeave?: () => void;
  /** Override the active-state detection (so /yap/foo still highlights /yap). */
  forceActive?: boolean;
  /** Whether the flyout for this row is currently pinned open (rotates chevron). */
  isPinned?: boolean;
  /** Forwarded ref to capture DOM position. */
  rowRef?: React.RefObject<HTMLAnchorElement>;
}

function NavRow({
  item,
  onChevronClick,
  onPointerEnter,
  onPointerLeave,
  forceActive,
  isPinned,
  rowRef,
}: NavRowProps) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      ref={rowRef}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={({ isActive }) => {
        const active = forceActive ?? isActive;
        return cn(
          "group relative flex items-center gap-3 rounded-2xl pl-2 pr-3 py-1.5 transition-all",
          active ? "glass-strong" : "hover:bg-white/[0.03]"
        );
      }}
    >
      {({ isActive }) => {
        const active = forceActive ?? isActive;
        return (
          <>
            <span
              className={cn(
                "grid place-items-center w-10 h-10 rounded-xl transition-all",
                active
                  ? "bg-bg-base/80 text-fg-primary border border-white/[0.08] shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.08)]"
                  : "border border-stroke bg-bg-card/60 text-fg-secondary group-hover:text-fg-primary group-hover:bg-bg-card"
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
            </span>
            <span
              className={cn(
                "flex-1 text-[15px] font-medium",
                active ? "text-fg-primary" : "text-fg-secondary"
              )}
            >
              {item.label}
            </span>
            {item.badge !== undefined && (
              <span
                className={cn(
                  "min-w-[22px] h-[22px] px-1.5 grid place-items-center rounded-full",
                  "text-[11px] font-semibold text-white tabular-nums",
                  "bg-danger shadow-[0_0_10px_rgb(var(--danger)/0.45)]"
                )}
              >
                {item.badge}
              </span>
            )}
            {/*
              For flyout rows, the chevron is a separate clickable button
              (not part of the NavLink). Stop propagation so clicking it
              doesn't trigger navigation.
            */}
            {item.hasFlyout ? (
              <button
                type="button"
                aria-label={isPinned ? "Close sub-menu" : "Open sub-menu"}
                aria-expanded={isPinned}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChevronClick?.(e);
                }}
                className={cn(
                  "shrink-0 grid place-items-center w-6 h-6 rounded-md",
                  "transition-all hover:bg-white/[0.06]",
                  isPinned && "bg-white/[0.06]"
                )}
              >
                <ChevronRight
                  className={cn(
                    "w-4 h-4 transition-transform",
                    active ? "text-fg-secondary" : "text-fg-muted",
                    isPinned && "rotate-90"
                  )}
                />
              </button>
            ) : (
              <ChevronRight
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  active ? "text-fg-secondary" : "text-fg-muted group-hover:text-fg-tertiary"
                )}
              />
            )}
          </>
        );
      }}
    </NavLink>
  );
}

export function Sidebar() {
  const location = useLocation();

  // Yap flyout state.
  // Three signals control visibility:
  //   1. hover state (row OR flyout panel)
  //   2. pinned state (chevron clicked, "stick open")
  //   3. manually-closed state (chevron clicked while pinned/auto-open, "force close")
  // The auto-open behavior (open when on a /yap/* subroute) is bypassed
  // when the user has manually closed.
  const [hoveringYap, setHoveringYap] = useState(false);
  const [hoveringFlyout, setHoveringFlyout] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [manuallyClosed, setManuallyClosed] = useState(false);
  const yapRowRef = useRef<HTMLAnchorElement>(null);
  const [flyoutTop, setFlyoutTop] = useState(0);

  const onYapSubroute =
    location.pathname.startsWith("/yap/") && location.pathname !== "/yap";

  // Reset state only when navigating AWAY from yap entirely (to a different
  // top-level route). Don't reset within yap subroute navigation — that lets
  // the user's flyout-close decision stick across sub-page clicks.
  const wasInYapRef = useRef(yapActiveStatic(location.pathname));
  useEffect(() => {
    const inYap = yapActiveStatic(location.pathname);
    if (wasInYapRef.current && !inYap) {
      // Left the yap area — fully reset
      setManuallyClosed(false);
      setPinned(false);
    }
    wasInYapRef.current = inYap;
  }, [location.pathname]);

  // Show flyout if hovering, pinned, or on a subroute (unless manually closed)
  const showFlyout =
    hoveringYap ||
    hoveringFlyout ||
    pinned ||
    (onYapSubroute && !manuallyClosed);

  // Update flyout vertical position when it opens
  const updateFlyoutPosition = () => {
    if (!yapRowRef.current) return;
    const rect = yapRowRef.current.getBoundingClientRect();
    setFlyoutTop(rect.top);
  };

  const handleYapEnter = () => {
    updateFlyoutPosition();
    setHoveringYap(true);
  };
  const handleYapLeave = () => setHoveringYap(false);
  const handleFlyoutEnter = () => setHoveringFlyout(true);
  const handleFlyoutLeave = () => setHoveringFlyout(false);

  const handleChevronClick = () => {
    updateFlyoutPosition();
    if (showFlyout) {
      // Currently open — close it
      setPinned(false);
      setManuallyClosed(true);
      setHoveringYap(false);
      setHoveringFlyout(false);
    } else {
      // Currently closed — open and pin it
      setPinned(true);
      setManuallyClosed(false);
    }
  };

  // Close flyout when user picks a sub-nav item
  const handleSubNavClick = () => {
    setPinned(false);
    setManuallyClosed(false);
    setHoveringYap(false);
    setHoveringFlyout(false);
  };

  const yapActive = location.pathname === "/yap" || onYapSubroute;

  return (
    <aside className="relative w-[320px] shrink-0 h-screen flex flex-col bg-bg-sidebar">
      {/* User header */}
      <div className="px-5 pt-6 pb-6 flex items-start gap-3">
        <Link
          to="/settings"
          className="relative shrink-0 group"
          aria-label="Open settings"
        >
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/[0.06] bg-bg-elevated transition-all group-hover:border-white/[0.15]">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        <div className="flex-1 min-w-0 pt-0.5">
          <div className="text-[15px] font-semibold text-fg-primary truncate leading-tight">
            {currentUser.name}
          </div>
          <div className="text-[12px] text-fg-tertiary mt-1 truncate">
            TikTok account:{" "}
            <span className="text-fg-secondary">
              {currentUser.tiktokLinked ? "Linked" : "Not linked"}
            </span>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2">
          <div
            className={cn(
              "h-7 px-2 flex items-center gap-1 rounded-lg",
              "bg-bg-elevated border border-white/[0.06]"
            )}
          >
            <span className="text-[11px] font-semibold text-fg-primary leading-none">
              {currentUser.streakDays} days
            </span>
            <Flame className="w-3.5 h-3.5 text-streak fill-streak" />
          </div>
        </div>

        <Link
          to="/settings"
          aria-label="Settings"
          className="shrink-0 grid place-items-center w-7 h-7 rounded-lg border border-white/[0.06] bg-bg-elevated text-fg-secondary hover:text-fg-primary transition-colors mt-2.5"
        >
          <SettingsIcon className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="px-5">
        <div className="h-px bg-stroke" />
      </div>

      {/* Welcome block */}
      <div className="px-5 pt-7 pb-6">
        <h1 className="font-display font-light text-[44px] leading-[0.98] tracking-[-0.02em] text-fg-primary">
          Welcome
          <br />
          Back, {currentUser.name}
        </h1>
        <p className="mt-3.5 text-[12px] text-fg-tertiary">
          Just Logged in: 1 Jan 2026
        </p>
      </div>

      <div className="px-5">
        <div className="h-px bg-stroke" />
      </div>

      {/* Standalone Dashboard (above the groups, deliberately) */}
      <div className="px-3 pt-6 pb-2">
        <p className="px-3 mb-3 text-[12px] text-fg-tertiary">
          Just Logged in: 1 Jan 2026
        </p>
        <DashboardRow />
      </div>

      {/* Nav groups */}
      <nav className="px-3 pt-6 flex-1 overflow-y-auto pb-6">
        <SectionLabel>Account</SectionLabel>
        <div className="space-y-1">
          {accountItems.map((item) => {
            if (item.hasFlyout && item.to === "/yap") {
              return (
                <NavRow
                  key={item.to}
                  item={item}
                  rowRef={yapRowRef}
                  onPointerEnter={handleYapEnter}
                  onPointerLeave={handleYapLeave}
                  onChevronClick={handleChevronClick}
                  forceActive={yapActive}
                  isPinned={pinned || onYapSubroute}
                />
              );
            }
            return <NavRow key={item.to} item={item} />;
          })}
        </div>

        <div className="h-6" />

        <SectionLabel>Activities</SectionLabel>
        <div className="space-y-1">
          {activityItems.map((item) => (
            <NavRow key={item.to} item={item} />
          ))}
        </div>
      </nav>

      {/* Yap sub-nav flyout — fixed positioned next to sidebar */}
      {showFlyout && (
        <div
          className="fixed z-40"
          style={{ left: 320, top: flyoutTop }}
        >
          <SubNavFlyout
            topOffset={0}
            items={YAP_SUB_NAV}
            onPointerEnter={handleFlyoutEnter}
            onPointerLeave={handleFlyoutLeave}
            onItemClick={handleSubNavClick}
          />
        </div>
      )}
    </aside>
  );
}
