import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

/**
 * Top-level page shell.
 *
 * Scrolling model:
 *  - The outer container fills the viewport with no scrollbar.
 *  - The sidebar is fixed at the top of the viewport (h-screen, sticky).
 *  - The main column is the ONLY scroll container — its TopBar sticks
 *    to the top of that scroll area so navigation stays visible.
 *
 * Result: page content scrolls beneath the sidebar and topbar; the
 * sidebar and topbar themselves don't move.
 */
export function AppLayout() {
  return (
    <div className="atmosphere-root flex h-screen bg-bg-base text-fg-primary overflow-hidden">
      {/* Layer 1: base blue glow baked into the upper-left area */}
      <div aria-hidden className="atmosphere-base-glow" />

      {/* Layer 2: white plus-lighter ellipse — the diagonal reflective ray */}
      <div aria-hidden className="atmosphere-glow" />

      <div className="atmosphere-content flex w-full h-full">
        {/* Sidebar — stays put. Internally it sets h-screen, here we just
            make sure it sits in the flex row and doesn't shrink. */}
        <div className="sticky top-0 h-screen shrink-0 z-30">
          <Sidebar />
        </div>

        {/* Main column — owns the scroll. TopBar sticks to its top. */}
        <main className="flex-1 min-w-0 h-screen overflow-y-auto">
          <div className="sticky top-0 z-20 bg-bg-base/80 backdrop-blur-md">
            <TopBar />
          </div>
          <div className="px-10 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}