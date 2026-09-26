import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { MobileIdentityHeader } from "./MobileIdentityHeader";

export function AppLayout() {
  // The dashboard is the creator profile now, and that header already shows
  // name + badge + TikTok — so the mobile identity row would be redundant
  // there. It still runs on every other page, where it's the only place
  // mobile shows who you're signed in as.
  const onDashboard = useLocation().pathname.startsWith("/dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="atmosphere-root flex h-screen overflow-hidden bg-bg-base text-fg-primary">
      <div aria-hidden className="atmosphere-base-glow" />
      <div aria-hidden className="atmosphere-glow" />
      <div className="atmosphere-content flex w-full h-full overflow-hidden">

        {/* Sidebar — desktop only */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <TopBar onMenuClick={() => setMobileNavOpen(true)} />
          {!onDashboard && <MobileIdentityHeader />}
          <div
            className="flex-1 min-w-0 overflow-y-auto"
            style={{ padding: "24px 16px calc(24px + env(safe-area-inset-bottom))" }}
          >
            {/* Desktop padding override */}
            <style>{`@media (min-width: 768px) { .app-content { padding: 24px 40px 24px !important; } }`}</style>
            <div className="app-content" style={{ padding: "24px 16px calc(24px + env(safe-area-inset-bottom))" }}>
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Nav drawer — mobile only. Replaces the old fixed bottom nav, which
          only had room for 5 of the app's 7 destinations (Portfolio and
          Wallet never fit); this shows every tab. */}
      <MobileNavDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </div>
  );
}