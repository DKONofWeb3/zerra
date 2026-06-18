import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { apiGet, apiPut } from "@/lib/api/client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Search, MoreVertical, ShieldOff, Ban, ShieldCheck } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role: "creator" | "admin" | "project";
  account_status: "active" | "restricted" | "banned";
  restricted_reason: string | null;
  created_at: string;
}

const STATUS_STYLE: Record<string, string> = {
  active:     "text-success border-success/30 bg-[rgb(var(--success)/0.08)]",
  restricted: "text-warning border-warning/30 bg-[rgb(var(--warning)/0.08)]",
  banned:     "text-danger border-danger/30 bg-[rgb(var(--danger)/0.08)]",
};

function UserActionsMenu({ user, onAction }: { user: User; onAction: (id: string, action: "restrict" | "ban" | "unban", reason?: string) => void }) {
  const [open, setOpen] = useState(false);

  const handleRestrict = () => {
    const reason = prompt("Reason for restricting this account:");
    if (reason) onAction(user.id, "restrict", reason);
    setOpen(false);
  };

  const handleBan = () => {
    const reason = prompt("Reason for banning this account:");
    if (reason && confirm("Are you sure? This will immediately revoke their access.")) {
      onAction(user.id, "ban", reason);
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((p) => !p)}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-fg-tertiary hover:text-fg-primary hover:bg-white/[0.04] transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-xl border border-white/[0.08] overflow-hidden"
            style={{ background: "rgb(10 12 20)" }}>
            {user.account_status !== "active" && (
              <button onClick={() => { onAction(user.id, "unban"); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left text-[12.5px] text-success hover:bg-[rgb(var(--success)/0.08)] transition-colors">
                <ShieldCheck className="w-3.5 h-3.5" /> Restore Account
              </button>
            )}
            {user.account_status === "active" && (
              <button onClick={handleRestrict}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left text-[12.5px] text-warning hover:bg-[rgb(var(--warning)/0.08)] transition-colors">
                <ShieldOff className="w-3.5 h-3.5" /> Restrict
              </button>
            )}
            {user.account_status !== "banned" && (
              <button onClick={handleBan}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left text-[12.5px] text-danger hover:bg-[rgb(var(--danger)/0.08)] transition-colors">
                <Ban className="w-3.5 h-3.5" /> Ban
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function UserRow({ user, onAction }: { user: User; onAction: (id: string, action: "restrict" | "ban" | "unban", reason?: string) => void }) {
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-white/[0.04] last:border-0">
      <div className="w-9 h-9 rounded-full overflow-hidden bg-bg-elevated border border-white/[0.06] shrink-0">
        {user.avatar ? (
          <img src={user.avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[13px] font-semibold text-fg-secondary">
            {(user.name ?? user.email).charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-medium text-fg-primary truncate">{user.name ?? "Unnamed"}</p>
        <p className="text-[12px] text-fg-tertiary truncate">{user.email}</p>
      </div>
      <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10.5px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-tertiary capitalize shrink-0">
        {user.role}
      </span>
      <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-medium border capitalize shrink-0", STATUS_STYLE[user.account_status])}>
        {user.account_status}
      </span>
      <UserActionsMenu user={user} onAction={onAction} />
    </div>
  );
}

export default function AdminUsersPage() {
  usePageTitle("Zerra Admin · Users");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter !== "all") params.set("role", roleFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);

    apiGet<{ users: User[] }>(`/admin/users?${params.toString()}`)
      .then((d) => setUsers(d.users ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [search, roleFilter, statusFilter]);

  const handleAction = async (id: string, action: "restrict" | "ban" | "unban", reason?: string) => {
    try {
      await apiPut(`/admin/users/${id}/${action}`, reason ? { reason } : undefined);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pb-12 space-y-6 md:space-y-8">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">{users.length} users</span>
        </div>
        <h2 className={cn(
          "mt-4 font-display font-medium tracking-[-0.03em] leading-[0.95]",
          "text-[36px] md:text-[56px]",
          "bg-clip-text text-transparent",
          "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
        )}>
          Users
        </h2>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-tertiary" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-white/[0.06] bg-bg-elevated text-[13.5px] text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-white/[0.15]" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-white/[0.06] bg-bg-elevated text-[13px] text-fg-primary focus:outline-none">
          <option value="all">All Roles</option>
          <option value="creator">Creator</option>
          <option value="project">Project</option>
          <option value="admin">Admin</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-white/[0.06] bg-bg-elevated text-[13px] text-fg-primary focus:outline-none">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="restricted">Restricted</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-16 rounded-xl border border-white/[0.06] animate-pulse" style={{ background: "rgb(var(--bg-card))" }} />
          ))}
        </div>
      ) : users.length > 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] px-4 md:px-5 py-1" style={{ background: "rgb(var(--bg-card))" }}>
          <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
          {users.map((u) => <UserRow key={u.id} user={u} onAction={handleAction} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] p-10 text-center" style={{ background: "rgb(var(--bg-card))" }}>
          <p className="text-[14px] text-fg-tertiary">No users found.</p>
        </div>
      )}
    </div>
  );
}