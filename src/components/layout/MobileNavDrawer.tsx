import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "./UserAvatar";
import { SidebarNav } from "./Sidebar";

/**
 * Mobile replacement for the old fixed bottom nav. The bottom nav only had
 * room for 5 icons, so Portfolio and Wallet never fit on mobile at all —
 * this drawer reuses SidebarNav verbatim (same rows, same styling as
 * desktop), so every tab is visible on mobile too, opened from the
 * hamburger button in TopBar.
 */
export function MobileNavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user }     = useCurrentUser();
  const { session }  = useAuth();
  const firstName    = user?.name?.split(" ")[0] ?? "Creator";
  const loginTime    = session?.user?.last_sign_in_at
    ? new Date(session.user.last_sign_in_at).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : null;

  // Lock page scroll behind the drawer while it's open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <div
      className={cn("fixed inset-0 z-[70] md:hidden", !open && "pointer-events-none")}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0 }}
      />

      {/* Panel */}
      <aside
        className="absolute inset-y-0 left-0 w-[82vw] max-w-[320px] flex flex-col bg-bg-sidebar shadow-[8px_0_40px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out"
        style={{
          transform: open ? "translateX(0)" : "translateX(-100%)",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-center gap-3 px-5 pt-6 pb-5">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/[0.06] bg-bg-elevated shrink-0">
            <UserAvatar name={user?.name ?? null} avatar={user?.avatar ?? null} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-fg-primary truncate">
              Welcome back, {firstName}
            </p>
            {loginTime && (
              <p className="text-[11px] text-fg-tertiary mt-0.5">Last login: {loginTime}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="shrink-0 w-9 h-9 rounded-full grid place-items-center border border-stroke bg-bg-card/60 text-fg-secondary hover:text-fg-primary hover:bg-bg-card transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5">
          <div className="h-px bg-stroke" />
        </div>

        <SidebarNav onNavigate={onClose} />
      </aside>
    </div>
  );
}
