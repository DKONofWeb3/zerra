import { useState, useEffect } from "react";
import {
  User, IdCard, Bell, Mail, Shield, Lock, CreditCard, Link2,
  Users, Receipt, HelpCircle, Palette, Camera, LogOut,
  Eye, EyeOff, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { useAuth } from "@/contexts/AuthContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import { updateProfile, updateNotifications, updatePrivacy, changePassword } from "@/lib/api";
import { apiDelete } from "@/lib/api/client";

interface SettingsItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SETTINGS_ITEMS: SettingsItem[] = [
  { id: "account",       label: "Account",            icon: User },
  { id: "profile",       label: "Profile",            icon: IdCard },
  { id: "notifications", label: "Notifications",      icon: Bell },
  { id: "email",         label: "Email Preferences",  icon: Mail },
  { id: "security",      label: "Security",           icon: Shield },
  { id: "privacy",       label: "Privacy",            icon: Lock },
  { id: "payment",       label: "Payment Methods",    icon: CreditCard },
  { id: "connected",     label: "Connected Accounts", icon: Link2 },
  { id: "team",          label: "Team",               icon: Users },
  { id: "billing",       label: "Billing",            icon: Receipt },
  { id: "help",          label: "Help & Support",     icon: HelpCircle },
  { id: "appearance",    label: "Appearance",         icon: Palette },
];

// Desktop menu row — unchanged behavior, just renders the row itself
function SettingsMenuRow({ item, active, onClick }: { item: SettingsItem; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
        active ? "glass-strong" : "hover:bg-white/[0.03]"
      )}
    >
      <Icon className={cn("w-4 h-4 shrink-0", active ? "text-fg-primary" : "text-fg-tertiary")} />
      <span className={cn("flex-1 text-[14px]", active ? "text-fg-primary font-medium" : "text-fg-secondary")}>
        {item.label}
      </span>
    </button>
  );
}

// Mobile menu row — drill-down list item, chevron-right instead of active-state styling
// since on mobile every tap navigates away rather than swapping content in place
function MobileMenuRow({ item, onClick }: { item: SettingsItem; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors text-left hover:bg-white/[0.03] active:bg-white/[0.05]"
    >
      <Icon className="w-4 h-4 shrink-0 text-fg-tertiary" />
      <span className="flex-1 text-[14.5px] text-fg-secondary">{item.label}</span>
      <ChevronRight className="w-4 h-4 text-fg-muted shrink-0" />
    </button>
  );
}

function CardSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl border border-white/[0.06] p-6", className)}
      style={{ background: "rgb(8 10 16 / 0.7)" }}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
      <div className="relative">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors shrink-0",
        checked ? "bg-brand" : "bg-bg-elevated border border-white/[0.10]"
      )}
    >
      <span className={cn(
        "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm",
        checked ? "translate-x-5" : "translate-x-0"
      )} />
    </button>
  );
}

// ── Account ────────────────────────────────────────────────────────────────
function AccountSection() {
  const { user } = useCurrentUser();
  const { session } = useAuth();

  const name       = user?.name ?? session?.user?.user_metadata?.full_name ?? "—";
  const email      = user?.email ?? session?.user?.email ?? "—";
  const avatar     = user?.avatar ?? session?.user?.user_metadata?.avatar_url ?? null;
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  return (
    <CardSection>
      <div className="text-[15px] font-semibold text-fg-primary">Account Information</div>
      <div className="text-[12.5px] text-fg-tertiary mt-1">Your account details.</div>
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-white/10 grid place-items-center overflow-hidden">
            {avatar
              ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
              : <span className="text-[20px] font-semibold text-white">{name.charAt(0).toUpperCase()}</span>
            }
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-bg-elevated border border-white/[0.10] grid place-items-center hover:bg-bg-card transition-colors" aria-label="Change avatar">
            <Camera className="w-3.5 h-3.5 text-fg-secondary" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 flex-1">
          <div>
            <div className="text-[11.5px] text-fg-tertiary">Full Name</div>
            <div className="text-[13.5px] text-fg-primary mt-1">{name}</div>
          </div>
          <div>
            <div className="text-[11.5px] text-fg-tertiary">Email Address</div>
            <div className="text-[13.5px] text-fg-primary mt-1 flex items-center gap-2">
              <span className="truncate">{email}</span>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-medium border shrink-0"
                style={{ backgroundColor: "rgb(var(--success) / 0.15)", borderColor: "rgb(var(--success) / 0.25)", color: "rgb(var(--success))" }}>
                Verified
              </span>
            </div>
          </div>
          <div>
            <div className="text-[11.5px] text-fg-tertiary">Member Since</div>
            <div className="text-[13.5px] text-fg-primary mt-1">{memberSince}</div>
          </div>
        </div>
      </div>
    </CardSection>
  );
}

// ── Profile ────────────────────────────────────────────────────────────────
function ProfileSection() {
  const { user } = useCurrentUser();
  const [name,     setName]     = useState("");
  const [username, setUsername] = useState("");
  const [saving,   setSaving]   = useState(false);
  const [message,  setMessage]  = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setUsername((user as any).username ?? "");
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile({ name, username });
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <CardSection>
      <div className="text-[15px] font-semibold text-fg-primary">Profile</div>
      <div className="text-[12.5px] text-fg-tertiary mt-1">Update your public profile information.</div>

      {message && (
        <div className={cn("mt-4 p-3 rounded-xl text-[13px]",
          message.type === "success"
            ? "bg-[rgb(var(--success)/0.08)] border border-[rgb(var(--success)/0.2)] text-[rgb(var(--success))]"
            : "bg-[rgb(var(--danger)/0.08)] border border-[rgb(var(--danger)/0.2)] text-[rgb(var(--danger))]"
        )}>
          {message.text}
        </div>
      )}

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-[12.5px] text-fg-tertiary mb-2">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-4 py-3 rounded-xl border border-white/[0.06] bg-bg-base/60 text-[14px] text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-white/[0.15] transition-colors"
          />
        </div>
        <div>
          <label className="block text-[12.5px] text-fg-tertiary mb-2">Username</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted text-[14px]">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              placeholder="yourhandle"
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-white/[0.06] bg-bg-base/60 text-[14px] text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-white/[0.15] transition-colors"
            />
          </div>
          <p className="mt-1.5 text-[11.5px] text-fg-muted">Only lowercase letters, numbers and underscores.</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-[13.5px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </CardSection>
  );
}

// ── Notifications ──────────────────────────────────────────────────────────
function NotificationsSection() {
  const { user } = useCurrentUser();
  const [prefs, setPrefs] = useState({ email: true, push: true, campaigns: true });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  useEffect(() => {
    if (user && (user as any).notifications_prefs) {
      setPrefs((user as any).notifications_prefs);
    }
  }, [user]);

  const handleToggle = async (key: keyof typeof prefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSaving(true);
    try {
      await updateNotifications(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const items = [
    { key: "email"     as const, title: "Email Notifications",    sub: "Receive updates and alerts via email" },
    { key: "push"      as const, title: "Push Notifications",     sub: "Receive push notifications on your devices" },
    { key: "campaigns" as const, title: "Campaign Opportunities", sub: "Get notified about new campaigns that match your profile" },
  ];

  return (
    <CardSection>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-[15px] font-semibold text-fg-primary">Notification Preferences</div>
          <div className="text-[12.5px] text-fg-tertiary mt-1">Choose how you want to be notified.</div>
        </div>
        {saved && <span className="text-[12px] text-[rgb(var(--success))]">Saved ✓</span>}
        {saving && <span className="text-[12px] text-fg-muted">Saving...</span>}
      </div>
      <div className="space-y-5">
        {items.map(({ key, title, sub }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[13.5px] text-fg-primary">{title}</div>
              <div className="text-[11.5px] text-fg-tertiary mt-0.5">{sub}</div>
            </div>
            <Toggle checked={prefs[key]} onChange={() => handleToggle(key)} />
          </div>
        ))}
      </div>
    </CardSection>
  );
}

// ── Security ───────────────────────────────────────────────────────────────
function SecuritySection() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [message,   setMessage]   = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (newPw.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await changePassword({ new_password: newPw });
      setMessage({ type: "success", text: "Password changed successfully." });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <CardSection>
      <div className="text-[15px] font-semibold text-fg-primary">Change Password</div>
      <div className="text-[12.5px] text-fg-tertiary mt-1">Update your password to keep your account secure.</div>

      {message && (
        <div className={cn("mt-4 p-3 rounded-xl text-[13px]",
          message.type === "success"
            ? "bg-[rgb(var(--success)/0.08)] border border-[rgb(var(--success)/0.2)] text-[rgb(var(--success))]"
            : "bg-[rgb(var(--danger)/0.08)] border border-[rgb(var(--danger)/0.2)] text-[rgb(var(--danger))]"
        )}>
          {message.text}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {[
          { label: "Current Password", value: currentPw, onChange: setCurrentPw },
          { label: "New Password",     value: newPw,     onChange: setNewPw },
          { label: "Confirm Password", value: confirmPw, onChange: setConfirmPw },
        ].map(({ label, value, onChange }) => (
          <div key={label}>
            <label className="block text-[12.5px] text-fg-tertiary mb-2">{label}</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 rounded-xl border border-white/[0.06] bg-bg-base/60 text-[14px] text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-white/[0.15] transition-colors"
              />
              {label === "Confirm Password" && (
                <button
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg-secondary transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleChangePassword}
          disabled={saving || !currentPw || !newPw || !confirmPw}
          className="px-6 py-2.5 rounded-xl text-[13.5px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors disabled:opacity-50"
        >
          {saving ? "Updating..." : "Update Password"}
        </button>
      </div>
    </CardSection>
  );
}

// ── Privacy ────────────────────────────────────────────────────────────────
function PrivacySection() {
  const { user } = useCurrentUser();
  const [publicProfile, setPublicProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  useEffect(() => {
    if (user && (user as any).privacy_settings) {
      setPublicProfile((user as any).privacy_settings.public_profile ?? true);
    }
  }, [user]);

  const handleToggle = async () => {
    const updated = !publicProfile;
    setPublicProfile(updated);
    setSaving(true);
    try {
      await updatePrivacy({ public_profile: updated });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CardSection>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-[15px] font-semibold text-fg-primary">Privacy Settings</div>
          <div className="text-[12.5px] text-fg-tertiary mt-1">Control your account visibility and data.</div>
        </div>
        {saved && <span className="text-[12px] text-[rgb(var(--success))]">Saved ✓</span>}
        {saving && <span className="text-[12px] text-fg-muted">Saving...</span>}
      </div>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[13.5px] text-fg-primary">Public Profile</div>
            <div className="text-[11.5px] text-fg-tertiary mt-0.5">
              Allow other users and crypto projects to discover your profile and analytics.
            </div>
          </div>
          <Toggle checked={publicProfile} onChange={handleToggle} />
        </div>
        <div className="flex items-center justify-between gap-4 opacity-50">
          <div>
            <div className="text-[13.5px] text-fg-primary">Analytics Sharing</div>
            <div className="text-[11.5px] text-fg-tertiary mt-0.5">
              Share your engagement metrics with campaign sponsors.
            </div>
          </div>
          <Toggle checked={true} onChange={() => {}} />
        </div>
      </div>
    </CardSection>
  );
}

// ── Connected Accounts ─────────────────────────────────────────────────────
function ConnectedAccountsSection() {
  const { accounts, connectTikTok, disconnect } = useSocialAccounts();
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const tiktok    = accounts.find((a) => a.platform === "tiktok");
  const instagram = accounts.find((a) => a.platform === "instagram");

  const handleDisconnect = async (id: string) => {
    setDisconnecting(id);
    await disconnect(id);
    setDisconnecting(null);
  };

  const platforms = [
    {
      key: "tiktok", label: "TikTok",
      description: "Connect your TikTok to track posts and engagement.",
      account: tiktok,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.15a8.16 8.16 0 0 0 4.77 1.52V7.22a4.85 4.85 0 0 1-1-.53z"/>
        </svg>
      ),
      onConnect: connectTikTok,
    },
    {
      key: "instagram", label: "Instagram",
      description: "Connect Instagram to track reels and engagement.",
      account: instagram,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      ),
      onConnect: null,
    },
  ];

  return (
    <CardSection>
      <div className="text-[15px] font-semibold text-fg-primary">Connected Accounts</div>
      <div className="text-[12.5px] text-fg-tertiary mt-1">Connect your social accounts to enable post tracking and analytics.</div>
      <div className="mt-6 space-y-4">
        {platforms.map(({ key, label, description, account, icon, onConnect }) => (
          <div key={key} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.05] bg-bg-base/40">
            <div className="grid place-items-center w-10 h-10 rounded-xl bg-bg-elevated border border-white/[0.06] text-fg-secondary shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-fg-primary">{label}</span>
                {account && (
                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-medium border"
                    style={{ backgroundColor: "rgb(var(--success) / 0.15)", borderColor: "rgb(var(--success) / 0.25)", color: "rgb(var(--success))" }}>
                    Connected
                  </span>
                )}
              </div>
              <div className="text-[12px] text-fg-tertiary mt-0.5">
                {account ? `@${account.username ?? "connected"}` : description}
              </div>
            </div>
            {account ? (
              <button onClick={() => handleDisconnect(account.id)} disabled={disconnecting === account.id}
                className="text-[12.5px] text-danger hover:opacity-80 transition-opacity disabled:opacity-40 shrink-0">
                {disconnecting === account.id ? "Disconnecting..." : "Disconnect"}
              </button>
            ) : onConnect ? (
              <button onClick={onConnect}
                className="px-4 py-2 rounded-xl text-[12.5px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors shrink-0">
                Connect
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-xl text-[12px] text-fg-muted border border-white/[0.04] bg-bg-base/40 shrink-0">
                Coming soon
              </span>
            )}
          </div>
        ))}
      </div>
    </CardSection>
  );
}

// ── Help & Support ─────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: "How do I earn USDC on Zerra?", a: "Connect your TikTok account, browse active campaigns in the Influence section, and claim bounties. Once you create qualifying content and it's verified, USDC is credited to your account." },
  { q: "How do I connect my TikTok account?", a: "Go to Settings → Connected Accounts and click Connect next to TikTok. You'll be redirected to TikTok to authorize Zerra. Once done, your posts will sync automatically." },
  { q: "When will I receive my USDC payout?", a: "Payouts are processed after campaign verification. Once a claim is marked as approved, funds are transferred within 3-5 business days." },
  { q: "Can I change my username?", a: "Yes — go to Settings → Profile and update your username. Usernames must be unique and can only contain lowercase letters, numbers, and underscores." },
  { q: "Is my TikTok data safe?", a: "Yes. We only access the data you authorize through TikTok's official Login Kit. We never store your TikTok password and you can disconnect at any time." },
  { q: "Why isn't my TikTok syncing?", a: "Make sure your TikTok account is connected under Settings → Connected Accounts. Then go to Influence → Top Performing and click Sync TikTok. If issues persist, try disconnecting and reconnecting." },
];

function HelpSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <CardSection>
        <div className="text-[15px] font-semibold text-fg-primary mb-1">Frequently Asked Questions</div>
        <div className="text-[12.5px] text-fg-tertiary mb-6">Quick answers to common questions.</div>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="border border-white/[0.05] rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-[13.5px] font-medium text-fg-primary">{item.q}</span>
                {open === i
                  ? <ChevronUp className="w-4 h-4 text-fg-tertiary shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-fg-tertiary shrink-0" />
                }
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-[13px] text-fg-tertiary leading-relaxed border-t border-white/[0.04]">
                  <div className="pt-3">{item.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardSection>

      <CardSection>
        <div className="text-[15px] font-semibold text-fg-primary mb-1">Contact Support</div>
        <div className="text-[12.5px] text-fg-tertiary mb-4">Can't find what you're looking for? Reach out to us.</div>
        <div className="flex items-center gap-4">
          <a
            href="mailto:support@zerra.pro"
            className="px-5 py-2.5 rounded-xl text-[13px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors"
          >
            Email Support
          </a>
          <span className="text-[12.5px] text-fg-tertiary">support@zerra.pro · We reply within 24 hours</span>
        </div>
      </CardSection>
    </div>
  );
}

// ── Sign Out & Danger ──────────────────────────────────────────────────────
function SignOutSection() {
  const { signOut } = useAuth();
  return (
    <CardSection>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[15px] font-semibold text-fg-primary">Sign Out</div>
          <div className="text-[12.5px] text-fg-tertiary mt-1">Sign out of your Zerra account on this device.</div>
        </div>
        <button onClick={signOut} className="flex items-center gap-2 text-[13px] text-fg-secondary hover:text-fg-primary transition-colors">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </CardSection>
  );
}

// Account deletion — now with a real confirmation flow and a real
// backend call instead of doing nothing. Requires typing "delete"
// before the actual delete action becomes clickable.
function DangerZone() {
  const { signOut } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canConfirm = confirmText.trim().toLowerCase() === "delete";

  const handleDelete = async () => {
    if (!canConfirm) return;
    setDeleting(true);
    setError(null);
    try {
      await apiDelete("/me");
      await signOut();
    } catch (err: any) {
      setError(err.message ?? "Failed to delete account. Please try again or contact support.");
      setDeleting(false);
    }
  };

  if (confirming) {
    return (
      <CardSection>
        <div className="text-[15px] font-semibold text-fg-primary">Confirm account deletion</div>
        <div className="text-[12.5px] text-fg-tertiary mt-1 leading-relaxed">
          This permanently deletes your account, TikTok connection, campaign history, badges,
          and all associated data. This cannot be undone.
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl text-[13px] bg-[rgb(var(--danger)/0.08)] border border-[rgb(var(--danger)/0.2)] text-[rgb(var(--danger))]">
            {error}
          </div>
        )}

        <div className="mt-5">
          <label className="block text-[12.5px] text-fg-tertiary mb-2">
            Type <span className="font-semibold text-fg-secondary">delete</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="delete"
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-[rgb(var(--danger)/0.3)] bg-bg-base/60 text-[14px] text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-[rgb(var(--danger)/0.5)] transition-colors"
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => { setConfirming(false); setConfirmText(""); setError(null); }}
            disabled={deleting}
            className="px-5 py-2.5 rounded-xl text-[13.5px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!canConfirm || deleting}
            className="px-5 py-2.5 rounded-xl text-[13.5px] font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: "rgb(var(--danger))" }}
          >
            {deleting ? "Deleting account..." : "Permanently delete my account"}
          </button>
        </div>
      </CardSection>
    );
  }

  return (
    <CardSection>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[15px] font-semibold text-fg-primary">Account Deletion</div>
          <div className="text-[12.5px] text-fg-tertiary mt-1">Permanently delete your account and all associated data.</div>
        </div>
        <button
          onClick={() => setConfirming(true)}
          className="text-[13px] text-danger hover:opacity-90 transition-opacity shrink-0"
        >
          Delete Account
        </button>
      </div>
    </CardSection>
  );
}

// ── Coming Soon Panel ──────────────────────────────────────────────────────
function ComingSoonPanel({ label }: { label: string }) {
  return (
    <CardSection>
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-white/[0.06] grid place-items-center">
          <HelpCircle className="w-5 h-5 text-fg-muted" />
        </div>
        <p className="text-[14px] font-medium text-fg-primary">{label}</p>
        <p className="text-[12.5px] text-fg-tertiary">This section is coming soon.</p>
      </div>
    </CardSection>
  );
}

// ── Content Router ─────────────────────────────────────────────────────────
function SettingsContent({ active }: { active: string }) {
  switch (active) {
    case "account":
      return <><AccountSection /><SignOutSection /><DangerZone /></>;
    case "profile":
      return <ProfileSection />;
    case "notifications":
      return <NotificationsSection />;
    case "security":
      return <SecuritySection />;
    case "privacy":
      return <PrivacySection />;
    case "connected":
      return <ConnectedAccountsSection />;
    case "help":
      return <HelpSection />;
    default: {
      const item = SETTINGS_ITEMS.find((i) => i.id === active);
      return <ComingSoonPanel label={item?.label ?? "Settings"} />;
    }
  }
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  usePageTitle("Zerra · Settings");

  const params = new URLSearchParams(window.location.search);
  const connected = params.get("connected");
  const tabParam  = params.get("tab");
  const initial   = connected ? "connected" : tabParam ?? "account";
  const [activeTab, setActiveTab] = useState(initial);

  // Mobile drill-down state: null = showing the menu list, a string =
  // showing that section full-screen with a back button. Desktop is
  // unaffected by this — it always shows menu + content side by side
  // regardless of this value.
  const [mobileView, setMobileView] = useState<string | null>(
    connected ? "connected" : null
  );

  return (
    <div className="pb-12">
      {/* Header — hidden on mobile while drilled into a section, so the
          back button + section title (below) takes its place instead
          of stacking on top of it */}
      <div className={cn("pt-2", mobileView && "hidden md:block")}>
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">Manage your account, preferences and payment method</span>
        </div>
        <h2 className={cn(
          "mt-4 font-display font-medium tracking-[-0.03em]",
          "text-[40px] md:text-[64px] leading-[0.95]",
          "bg-clip-text text-transparent",
          "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
        )}>
          My Settings
        </h2>
      </div>

      {/* Mobile drill-down header — back button + section name, only
          shown once a section has been tapped into */}
      {mobileView && (
        <div className="md:hidden flex items-center gap-3 pt-2 pb-2">
          <button
            onClick={() => setMobileView(null)}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-white/[0.08] bg-bg-elevated text-fg-secondary hover:text-fg-primary transition-colors shrink-0"
            aria-label="Back to settings"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>
          <h2 className="text-[20px] font-display font-medium text-fg-primary">
            {SETTINGS_ITEMS.find((i) => i.id === mobileView)?.label ?? "Settings"}
          </h2>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 mt-8 md:mt-8">
        {/* Menu — on mobile only rendered while mobileView is null (i.e.
            user hasn't drilled in yet). On desktop always rendered. */}
        <div className={cn(
          "relative overflow-hidden rounded-2xl border border-white/[0.06] p-3 self-start",
          mobileView ? "hidden md:block" : "block"
        )}
          style={{ background: "rgb(8 10 16 / 0.7)" }}>
          <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
          <div className="relative space-y-1">
            {SETTINGS_ITEMS.map((item) => (
              <div key={item.id}>
                {/* Desktop row — swaps content in place, no navigation */}
                <div className="hidden md:block">
                  <SettingsMenuRow item={item} active={activeTab === item.id} onClick={() => setActiveTab(item.id)} />
                </div>
                {/* Mobile row — drills into a full-screen section */}
                <div className="md:hidden">
                  <MobileMenuRow item={item} onClick={() => { setActiveTab(item.id); setMobileView(item.id); }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content — on mobile only rendered while drilled into a
            section; on desktop always rendered beside the menu */}
        <div className={cn(
          "space-y-4",
          mobileView ? "block" : "hidden md:block"
        )}>
          <SettingsContent active={mobileView ?? activeTab} />
        </div>
      </div>
    </div>
  );
}