// src/components/project/ProjectLayout.tsx
import { Outlet } from "react-router-dom";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/cn";
import { LayoutGrid, Trophy, Video, Users, LogOut } from "lucide-react";
import { supabase } from "@/lib/api/supabase";

const NAV = [
  { to: "/project",              label: "Overview",     icon: LayoutGrid, end: true },
  { to: "/project/leaderboard",  label: "Leaderboard",  icon: Trophy },
  { to: "/project/videos",       label: "Videos",       icon: Video },
  { to: "/project/participants", label: "Participants",  icon: Users },
];

function NavItem({ to, label, icon: Icon, end }: typeof NAV[0]) {
  return (
    <NavLink to={to} end={end}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors",
        isActive
          ? "bg-brand/10 text-brand border border-brand/20"
          : "text-fg-tertiary hover:text-fg-secondary hover:bg-white/[0.03] border border-transparent"
      )}>
      <Icon className="w-[17px] h-[17px]" strokeWidth={1.8} />
      {label}
    </NavLink>
  );
}

function BottomNavItem({ to, label, icon: Icon, end }: typeof NAV[0]) {
  return (
    <NavLink to={to} end={end} className="flex-1 flex flex-col items-center gap-1 py-1.5">
      {({ isActive }: { isActive: boolean }) => (
        <>
          <Icon className={cn("w-5 h-5", isActive ? "text-brand" : "text-fg-muted")} strokeWidth={isActive ? 2.5 : 1.8} />
          <span className={cn("text-[10px] font-medium", isActive ? "text-brand" : "text-fg-muted")}>{label}</span>
        </>
      )}
    </NavLink>
  );
}

export function ProjectLayout() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="atmosphere-root flex h-screen overflow-hidden bg-bg-base text-fg-primary">
      <div aria-hidden className="atmosphere-base-glow" />
      <div aria-hidden className="atmosphere-glow" />
      <div className="atmosphere-content flex w-full h-full overflow-hidden">

        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-[240px] shrink-0 flex-col border-r border-white/[0.06] h-full">
          <div className="px-6 pt-7 pb-6">
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-display font-bold tracking-[1.5px] uppercase text-brand">ZERRA</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/[0.08] bg-bg-elevated text-fg-tertiary uppercase tracking-wider">Project</span>
            </div>
          </div>
          <nav className="flex-1 px-3 space-y-1">
            {NAV.map((item) => <NavItem key={item.to} {...item} />)}
          </nav>
          <div className="px-4 py-5 border-t border-white/[0.06]">
            <button onClick={handleSignOut}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-fg-tertiary hover:text-danger hover:bg-[rgb(var(--danger)/0.06)] transition-colors w-full">
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-w-0 overflow-y-auto" style={{ padding: "24px 16px 80px" }}>
            <style>{`@media (min-width: 768px) { .proj-content { padding: 24px 40px 24px !important; } }`}</style>
            <div className="proj-content" style={{ padding: "24px 16px 80px" }}>
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] border-t border-white/[0.06]"
        style={{ background: "rgb(8 9 14 / 0.92)", backdropFilter: "blur(16px)" }}>
        {NAV.map((item) => <BottomNavItem key={item.to} {...item} />)}
      </nav>
    </div>
  );
}