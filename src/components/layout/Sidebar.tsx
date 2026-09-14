import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, MessageSquareText,
  Compass, TrendingUp, Wallet, ChevronRight,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const accountItems: NavItem[] = [
  { to: "/portfolio",  label: "Portfolio",  icon: Briefcase },
  { to: "/influence",  label: "Influence",  icon: MessageSquareText },
  { to: "/explore",    label: "Explore",    icon: Compass },
  { to: "/referrals",  label: "Referrals",  icon: Users },
];

const activityItems: NavItem[] = [
  { to: "/market", label: "Market", icon: TrendingUp },
  { to: "/wallet", label: "Wallet", icon: Wallet },
];

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
      to="/dashboard"
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
          <span className={cn(
            "grid place-items-center w-10 h-10 rounded-xl transition-all",
            isActive
              ? "bg-bg-base/80 text-fg-primary border border-white/[0.08] shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.08)]"
              : "border border-stroke bg-bg-card text-fg-secondary group-hover:text-fg-primary"
          )}>
            <LayoutDashboard className="w-[18px] h-[18px]" />
          </span>
          <span className={cn("flex-1 text-[15px] font-medium", isActive ? "text-fg-primary" : "text-fg-secondary")}>
            Dashboard
          </span>
        </>
      )}
    </NavLink>
  );
}

function NavRow({ item }: { item: NavItem }) {
  const Icon = item.icon;
  const location = useLocation();
  const forceActive = item.to === "/influence"
    ? location.pathname === "/influence" || location.pathname.startsWith("/influence/")
    : undefined;

  return (
    <NavLink
      to={item.to}
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
            <span className={cn(
              "grid place-items-center w-10 h-10 rounded-xl transition-all",
              active
                ? "bg-bg-base/80 text-fg-primary border border-white/[0.08] shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.08)]"
                : "border border-stroke bg-bg-card/60 text-fg-secondary group-hover:text-fg-primary group-hover:bg-bg-card"
            )}>
              <Icon className="w-[18px] h-[18px]" />
            </span>
            <span className={cn("flex-1 text-[15px] font-medium", active ? "text-fg-primary" : "text-fg-secondary")}>
              {item.label}
            </span>
            <ChevronRight className={cn(
              "w-4 h-4 shrink-0 transition-colors",
              active ? "text-fg-secondary" : "text-fg-muted group-hover:text-fg-tertiary"
            )} />
          </>
        );
      }}
    </NavLink>
  );
}

export function Sidebar() {
  const { user }           = useCurrentUser();
  const firstName          = user?.name?.split(" ")[0] ?? "Creator";
  const { session }        = useAuth();
  const loginTime          = session?.user?.last_sign_in_at
    ? new Date(session.user.last_sign_in_at).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : null;

  return (
    <aside className="relative w-[320px] shrink-0 h-screen flex flex-col bg-bg-sidebar">
      {/* The name / badge / TikTok block that used to sit here was redundant
          with the dashboard profile header, which now carries all three. */}

      {/* Welcome block */}
      <div className="px-5 pt-7 pb-6">
        <h1 className="font-display font-light text-[44px] leading-[0.98] tracking-[-0.02em] text-fg-primary">
          Welcome
          <br />
          Back, {firstName}
        </h1>
        {loginTime && (
          <p className="mt-3.5 text-[12px] text-fg-tertiary">Last login: {loginTime}</p>
        )}
      </div>

      <div className="px-5">
        <div className="h-px bg-stroke" />
      </div>

      {/* Dashboard row */}
      <div className="px-3 pt-6 pb-2">
        <DashboardRow />
      </div>

      {/* Nav groups */}
      <nav className="px-3 pt-6 flex-1 overflow-y-auto pb-6">
        <SectionLabel>Account</SectionLabel>
        <div className="space-y-1">
          {accountItems.map((item) => (
            <NavRow key={item.to} item={item} />
          ))}
        </div>

        <div className="h-6" />

        <SectionLabel>Activities</SectionLabel>
        <div className="space-y-1">
          {activityItems.map((item) => (
            <NavRow key={item.to} item={item} />
          ))}
        </div>
      </nav>
    </aside>
  );
}