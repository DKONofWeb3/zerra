import { Outlet, useLocation } from "react-router-dom";
import { TopNav } from "./TopNav";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { MobileIdentityHeader } from "./MobileIdentityHeader";

export function AppLayout() {
  // The dashboard draws its own header on mobile (title + bell + avatar) and
  // its own welcome row on desktop, so the generic page-title bar and the
  // mobile identity row would only repeat it. Every other page keeps them.
  const { pathname } = useLocation();
  const onDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/trending");

  return (
    <div className="atmosphere-root flex h-screen overflow-hidden bg-bg-base text-fg-primary">
      <div aria-hidden className="atmosphere-base-glow" />
      <div aria-hidden className="atmosphere-glow" />
      <div className="atmosphere-content flex w-full h-full overflow-hidden">
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Top navigation — desktop only (mobile uses the bottom bar) */}
          <TopNav />
          <TopBar />
          {!onDashboard && <MobileIdentityHeader />}
          <div
            className="flex-1 min-w-0 overflow-y-auto"
            style={{ padding: "24px 16px 80px", }}
          >
            {/* Desktop padding override */}
            <style>{`@media (min-width: 768px) { .app-content { padding: 24px 40px 24px !important; } .app-content--dash { padding: 0 32px 32px !important; } }`}</style>
            <div className={onDashboard ? "app-content app-content--dash" : "app-content"} style={{ padding: "24px 16px 80px" }}>
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  );
}
