import { useState } from "react";
import {
  User, IdCard, Bell, Mail, Shield, Lock, CreditCard, Link2,
  Users, Receipt, HelpCircle, Palette, Camera, AtSign, Smartphone, Megaphone,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";

interface SettingsItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SETTINGS_ITEMS: SettingsItem[] = [
  { id: "account",     label: "Account",            icon: User },
  { id: "profile",     label: "Profile",            icon: IdCard },
  { id: "notifications", label: "Notifications",    icon: Bell },
  { id: "email",       label: "Email Preferences",  icon: Mail },
  { id: "security",    label: "Security",           icon: Shield },
  { id: "privacy",     label: "Privacy",            icon: Lock },
  { id: "payment",     label: "Payment Methods",    icon: CreditCard },
  { id: "connected",   label: "Connected Accounts", icon: Link2 },
  { id: "team",        label: "Team",               icon: Users },
  { id: "billing",     label: "Billing",            icon: Receipt },
  { id: "help",        label: "Help & Support",     icon: HelpCircle },
  { id: "appearance",  label: "Appearance",         icon: Palette },
];

function SettingsMenuRow({
  item,
  active,
  onClick,
}: {
  item: SettingsItem;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
        active ? "glass-strong" : "hover:bg-white/[0.03]"
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4 shrink-0",
          active ? "text-fg-primary" : "text-fg-tertiary"
        )}
      />
      <span
        className={cn(
          "flex-1 text-[14px]",
          active ? "text-fg-primary font-medium" : "text-fg-secondary"
        )}
      >
        {item.label}
      </span>
      {active && (
        <span aria-hidden className="text-fg-primary text-lg leading-none animate-blink">
          |
        </span>
      )}
    </button>
  );
}

function CardSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.06] p-6",
        className
      )}
      style={{ background: "rgb(8 10 16 / 0.7)" }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function AccountInformation() {
  return (
    <CardSection>
      <div className="text-[15px] font-semibold text-fg-primary">Account Information</div>
      <div className="text-[12.5px] text-fg-tertiary mt-1">
        Update your personal informations.
      </div>

      <div className="mt-6 grid grid-cols-[auto_1fr_1fr_1fr_1fr] gap-6 items-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-white/10 grid place-items-center overflow-hidden">
            <span className="text-[20px] font-semibold text-white">D</span>
          </div>
          <button
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-bg-elevated border border-white/[0.10] grid place-items-center hover:bg-bg-card transition-colors"
            aria-label="Change avatar"
          >
            <Camera className="w-3.5 h-3.5 text-fg-secondary" />
          </button>
        </div>
        <Field label="Full Name" value="Dee Captain" />
        <Field label="Username" value="@deecaptain" />
        <Field label="Email Address" value="captain@creatorfi.com" trailing={
          <span
            className="ml-2 px-2 py-0.5 rounded-full text-[10.5px] font-medium border"
            style={{
              backgroundColor: "rgb(var(--success) / 0.15)",
              borderColor: "rgb(var(--success) / 0.25)",
              color: "rgb(var(--success))",
            }}
          >
            Verified
          </span>
        } />
        <Field label="Member Since" value="Jan 20, 2026" />
      </div>
    </CardSection>
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

function PasswordSection() {
  return (
    <CardSection>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[15px] font-semibold text-fg-primary">Password</div>
          <div className="text-[12.5px] text-fg-tertiary mt-1">
            Change a password to secure your account
          </div>
        </div>
        <button className="text-[13px] text-fg-primary hover:text-brand transition-colors">
          Change password
        </button>
      </div>
      <div className="mt-5 text-[15px] text-fg-tertiary tracking-widest">
        ************************
      </div>
      <div className="mt-2 text-[12px] text-fg-tertiary">
        Last changed on Apr 24, 2026
      </div>
    </CardSection>
  );
}

function TwoFactorSection() {
  return (
    <CardSection>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[15px] font-semibold text-fg-primary">
            Two Factor Authentication
          </div>
          <div className="text-[12.5px] text-fg-tertiary mt-1">
            Add an extra layer of security to your account
          </div>
        </div>
        <span
          className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border"
          style={{
            backgroundColor: "rgb(var(--success) / 0.15)",
            borderColor: "rgb(var(--success) / 0.25)",
            color: "rgb(var(--success))",
          }}
        >
          Enabled
        </span>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <div className="grid place-items-center w-9 h-9 rounded-lg bg-bg-elevated border border-white/[0.06]">
          <Shield className="w-4 h-4 text-fg-secondary" />
        </div>
        <div className="leading-tight">
          <div className="text-[13.5px] text-fg-primary">Authenticator App</div>
          <div className="text-[11.5px] text-fg-tertiary mt-0.5">
            Added on Apr 15, 2026
          </div>
        </div>
      </div>
    </CardSection>
  );
}

function NotificationPrefs() {
  const items = [
    { icon: AtSign,    title: "Email Notification",    sub: "Recieve updates and alerts via email" },
    { icon: Smartphone, title: "Push Notification",     sub: "Recieve push notification on your devices." },
    { icon: Megaphone,  title: "Campaign Oppurtunities", sub: "Get notified about new campaigns that match your profile" },
  ];
  return (
    <CardSection>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="text-[15px] font-semibold text-fg-primary">
            Notification Preference
          </div>
          <div className="text-[12.5px] text-fg-tertiary mt-1">
            Choose how you want to be notified
          </div>
        </div>
        <button className="text-[13px] text-fg-secondary hover:text-fg-primary transition-colors">
          Manage
        </button>
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
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border"
              style={{
                backgroundColor: "rgb(var(--success) / 0.15)",
                borderColor: "rgb(var(--success) / 0.25)",
                color: "rgb(var(--success))",
              }}
            >
              Enabled
            </span>
          </div>
        ))}
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
            Permanently delet your account and all associated data
          </div>
        </div>
        <button className="text-[13px] text-danger hover:opacity-90 transition-opacity">
          Delete Account
        </button>
      </div>
    </CardSection>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState("account");

  return (
    <div className="pb-12">
      {/* Header */}
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

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 mt-8">
        {/* Settings menu (left) */}
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-white/[0.06] p-3 self-start"
          )}
          style={{ background: "rgb(8 10 16 / 0.7)" }}
        >
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)",
            }}
          />
          <div className="relative space-y-1">
            {SETTINGS_ITEMS.map((item) => (
              <SettingsMenuRow
                key={item.id}
                item={item}
                active={active === item.id}
                onClick={() => setActive(item.id)}
              />
            ))}
          </div>
        </div>

        {/* Content (right) */}
        <div className="space-y-4">
          <AccountInformation />
          <PasswordSection />
          <TwoFactorSection />
          <NotificationPrefs />
          <DangerZone />
        </div>
      </div>
    </div>
  );
}
