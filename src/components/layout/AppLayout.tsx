import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppLayout() {
  return (
    <div className="atmosphere-root flex min-h-screen bg-bg-base text-fg-primary overflow-hidden">
      {/* Layer 1: base blue glow baked into the upper-left area
          (the gradient that's there even without the ellipse) */}
      <div aria-hidden className="atmosphere-base-glow" />

      {/* Layer 2: white plus-lighter ellipse — the diagonal reflective ray
          that brightens whatever is below it, picking up the blue cast
          from the base glow. */}
      <div aria-hidden className="atmosphere-glow" />

      <div className="atmosphere-content flex w-full">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col">
          <TopBar />
          <div className="flex-1 min-w-0 px-10 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
