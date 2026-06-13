import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";

export function AppLayout() {
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
          <TopBar />
          <div
            className="flex-1 min-w-0 overflow-y-auto"
            style={{ padding: "24px 16px 80px", }}
          >
            {/* Desktop padding override */}
            <style>{`@media (min-width: 768px) { .app-content { padding: 24px 40px 24px !important; } }`}</style>
            <div className="app-content" style={{ padding: "24px 16px 80px" }}>
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