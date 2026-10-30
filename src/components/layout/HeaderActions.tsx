import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuth } from "@/contexts/AuthContext";
import { MENU_LINKS } from "./navItems";
import "./topnav.css";

/** Bell + avatar from the Bloom header. The avatar opens a menu holding the pages the new primary nav doesn't list. */
export function HeaderActions({ size = 48 }: { size?: number }) {
  const { user } = useCurrentUser();
  const { session } = useAuth();
  const meta = (session?.user?.user_metadata ?? {}) as Record<string, string | undefined>;
  const avatar = user?.avatar || meta.avatar_url || meta.picture || null;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initial = (user?.name || meta.full_name || meta.name || user?.email || session?.user?.email || "Z").charAt(0).toUpperCase();

  return (
    <div className="hdr-actions" style={{ ["--hdr-size" as string]: `${size}px` }} ref={ref}>
      <button type="button" className="hdr-btn" aria-label="Notifications">
        <img src="/dash/bell.svg" alt="" />
      </button>
      <button type="button" className="hdr-btn hdr-avatar" aria-label="Account menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {avatar
          ? <img src={avatar} alt="" referrerPolicy="no-referrer" />
          : <span>{initial}</span>}
      </button>
      {open && (
        <div className="hdr-menu" role="menu">
          {user?.username && (
            <Link role="menuitem" to={`/creator/${user.username}`} onClick={() => setOpen(false)}>My profile</Link>
          )}
          {MENU_LINKS.map((l) => (
            <Link role="menuitem" key={l.to} to={l.to} onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
        </div>
      )}
    </div>
  );
}
