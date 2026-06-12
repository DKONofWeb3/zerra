import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileLock } from "../MobileLock";

export function AppLayout() {
  return (
    <div className="atmosphere-root flex h-screen overflow-hidden bg-bg-base text-fg-primary">
      <MobileLock />
      <div aria-hidden className="atmosphere-base-glow" />
      <div aria-hidden className="atmosphere-glow" />
      <div className="atmosphere-content flex w-full h-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <TopBar />
          <div className="flex-1 min-w-0 px-10 py-6 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}