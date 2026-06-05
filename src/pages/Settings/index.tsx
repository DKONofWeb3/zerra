import { useState } from "react";
import {
  User, IdCard, Bell, Mail, Shield, Lock, CreditCard, Link2,
  Users, Receipt, HelpCircle, Palette, Camera, AtSign, Smartphone,
  Megaphone, LogOut,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { useAuth } from "@/contexts/AuthContext";
import { usePageTitle } from "@/hooks/usePageTitle";

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

function CardSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl border border-white/[0.06] p-6", className)}
      style={{ background: "rgb(8 10 16 / 0.7)" }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function Field({ label, value, trailing }: { label: string; value: string; trailing?: React.ReactNode }) {
  return (
    <div className="leading-tight min-w-0">
      <div className="text-[11.5px] text-fg-tertiary">{label}</div>
      <div className="text-[13.5px] text-fg-primary mt-1 flex items-center truncate">
        <span className="truncate">{value}</span>
        {trailing}
      </div>
    </div>
  );
}

function AccountInformation() {
  const { user } = useCurrentUser();
  const { session } = useAuth();

  const name = user?.name ?? session?.user?.user_metadata?.full_name ?? "—";
  const email = user?.email ?? session?.user?.email ?? "—";
  const avatar = user?.avatar ?? session?.user?.user_metadata?.avatar_url ?? null;
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  return (
    <CardSection>
      <div className="text-[15px] font-semibold text-fg-primary">Account Information</div>
      <div className="text-[12.5px] text-fg-tertiary mt-1">Update your personal information.</div>

      <div className="mt-6 grid grid-cols-[auto_1fr_1fr_1fr] gap-6 items-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-white/10 grid place-items-center overflow-hidden">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[20px] font-semibold text-white">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <button
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-bg-elevated border border-white/[0.10] grid place-items-center hover:bg-bg-card transition-colors"
            aria-label="Change avatar"
          >
            <Camera className="w-3.5 h-3.5 text-fg-secondary" />
          </button>
        </div>
        <Field label="Full Name" value={name} />
        <Field label="Email Address" value={email} trailing={
          <span
            className="ml-2 px-2 py-0.5 rounded-full text-[10.5px] font-medium border"
            style={{ backgroundColor: "rgb(var(--success) / 0.15)", borderColor: "rgb(var(--success) / 0.25)", color: "rgb(var(--success))" }}
          >
            Verified
          </span>
        } />
        <Field label="Member Since" value={memberSince} />
      </div>
    </CardSection>
  );
}

function ConnectedAccounts() {
  const { accounts, connectTikTok, disconnect } = useSocialAccounts();
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const tiktok = accounts.find((a) => a.platform === "tiktok");
  const instagram = accounts.find((a) => a.platform === "instagram");

  const handleDisconnect = async (id: string) => {
    setDisconnecting(id);
    await disconnect(id);
    setDisconnecting(null);
  };

  const platforms = [
    {
      key: "tiktok",
      label: "TikTok",
      description: "Connect your TikTok to track posts and engagement.",
      account: tiktok,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.15a8.16 8.16 0 0 0 4.77 1.52V7.22a4.85 4.85 0 0 1-1-.53z" />
        </svg>
      ),
      onConnect: connectTikTok,
    },
    {
      key: "instagram",
      label: "Instagram",
      description: "Connect Instagram to track reels and engagement.",
      account: instagram,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
      onConnect: null,
    },
  ];

  return (
    <CardSection>
      <div className="text-[15px] font-semibold text-fg-primary">Connected Accounts</div>
      <div className="text-[12.5px] text-fg-tertiary mt-1">
        Connect your social accounts to enable post tracking and analytics.
      </div>

      <div className="mt-6 space-y-4">
        {platforms.map(({ key, label, description, account, icon, onConnect }) => (
          <div key={key} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.05] bg-bg-base/40">
            <div className="grid place-items-center w-10 h-10 rounded-xl bg-bg-elevated border border-white/[0.06] text-fg-secondary shrink-0">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-fg-primary">{label}</span>
                {account && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[10.5px] font-medium border"
                    style={{ backgroundColor: "rgb(var(--success) / 0.15)", borderColor: "rgb(var(--success) / 0.25)", color: "rgb(var(--success))" }}
                  >
                    Connected
                  </span>
                )}
              </div>
              <div className="text-[12px] text-fg-tertiary mt-0.5">
                {account ? `@${account.username ?? "connected"}` : description}
              </div>
            </div>
            {account ? (
              <button
                onClick={() => handleDisconnect(account.id)}
                disabled={disconnecting === account.id}
                className="text-[12.5px] text-danger hover:opacity-80 transition-opacity disabled:opacity-40 shrink-0"
              >
                {disconnecting === account.id ? "Disconnecting..." : "Disconnect"}
              </button>
            ) : onConnect ? (
              <button
                onClick={onConnect}
                className="px-4 py-2 rounded-xl text-[12.5px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors shrink-0"
              >
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

function NotificationPrefs() {
  const items = [
    { icon: AtSign,     title: "Email Notification",      sub: "Receive updates and alerts via email" },
    { icon: Smartphone, title: "Push Notification",       sub: "Receive push notifications on your devices." },
    { icon: Megaphone,  title: "Campaign Opportunities",  sub: "Get notified about new campaigns that match your profile" },
  ];
  return (
    <CardSection>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="text-[15px] font-semibold text-fg-primary">Notification Preferences</div>
          <div className="text-[12.5px] text-fg-tertiary mt-1">Choose how you want to be notified</div>
        </div>
      </div>
      <div className="space-y-4">
        {items.map(({ icon: Icon, title, sub }, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center w-9 h-9 rounded-lg bg-bg-elevated border border-white/[0.06]">
                <Icon className="w-4 h-4 text-fg-secondary" />
              </div>
              <div className="leading-tight">
                <div className="text-[13.5px] text-fg-primary">{title}</div>
                <div className="text-[11.5px] text-fg-tertiary mt-0.5">{sub}</div>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border text-fg-tertiary border-white/[0.06]">
              Soon
            </span>
          </div>
        ))}
      </div>
    </CardSection>
  );
}

function SignOutSection() {
  const { signOut } = useAuth();
  return (
    <CardSection>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[15px] font-semibold text-fg-primary">Sign Out</div>
          <div className="text-[12.5px] text-fg-tertiary mt-1">Sign out of your Zerra account on this device.</div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-[13px] text-fg-secondary hover:text-fg-primary transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </CardSection>
  );
}

function DangerZone() {
  return (
    <CardSection>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[15px] font-semibold text-fg-primary">Account Deletion</div>
          <div className="text-[12.5px] text-fg-tertiary mt-1">
            Permanently delete your account and all associated data.
          </div>
        </div>
        <button className="text-[13px] text-danger hover:opacity-90 transition-opacity">
          Delete Account
        </button>
      </div>
    </CardSection>
  );
}

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

function SettingsContent({ active }: { active: string }) {
  if (active === "account") {
    return (
      <>
        <AccountInformation />
        <NotificationPrefs />
        <SignOutSection />
        <DangerZone />
      </>
    );
  }
  if (active === "connected") {
    return <ConnectedAccounts />;
  }
  const item = SETTINGS_ITEMS.find((i) => i.id === active);
  return <ComingSoonPanel label={item?.label ?? "Settings"} />;
}

export default function SettingsPage() {
  usePageTitle("Zerra · Settings");

  const params = new URLSearchParams(window.location.search);
  const connected = params.get("connected");
  const initialActive = connected ? "connected" : "account";
  const [activeTab, setActiveTab] = useState(initialActive);

  return (
    <div className="pb-12">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">Manage your account, preferences and payment method</span>
        </div>
        <h2
          className={cn(
            "mt-4 font-display font-medium tracking-[-0.03em]",
            "text-[64px] leading-[0.95]",
            "bg-clip-text text-transparent",
            "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
          )}
        >
          My Setting
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 mt-8">
        <div
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-3 self-start"
          style={{ background: "rgb(8 10 16 / 0.7)" }}
        >
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }}
          />
          <div className="relative space-y-1">
            {SETTINGS_ITEMS.map((item) => (
              <SettingsMenuRow
                key={item.id}
                item={item}
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <SettingsContent active={activeTab} />
        </div>
      </div>
    </div>
  );
}