// src/pages/Referral/Dashboard/index.tsx
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { usePageTitle } from "@/hooks/usePageTitle";
import { apiGet } from "@/lib/api/client";
import { Copy, Check, Users, Gift } from "lucide-react";

interface ReferralData {
  referralCode:    string;
  referralLink:    string;
  totalReferrals:  number;
  referralPoints:  number;
  recentReferrals: {
    created_at:    string;
    reward_given:  boolean;
    reward_amount: number;
    referred: { name: string | null; email: string; created_at: string } | null;
  }[];
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function ReferralDashboardPage() {
  usePageTitle("Zerra · Referrals");
  const [data,    setData]    = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    apiGet<ReferralData>("/me/referral")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pb-12 space-y-6 md:space-y-8">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">Earn together</span>
        </div>
        <h2 className={cn(
          "mt-4 font-display font-medium tracking-[-0.03em] leading-[0.95]",
          "text-[36px] md:text-[64px]",
          "bg-clip-text text-transparent",
          "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
        )}>
          Referrals
        </h2>
        <p className="mt-3 text-[13.5px] text-fg-tertiary max-w-md">
          Share your referral link and grow the Zerra creator community. Rewards coming soon.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl border border-white/[0.06] animate-pulse"
              style={{ background: "rgb(var(--bg-card))" }} />
          ))}
        </div>
      ) : data && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-5"
              style={{ background: "rgb(var(--bg-card))" }}>
              <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
              <Users className="w-4 h-4 text-fg-tertiary mb-3" />
              <p className="text-[28px] font-display font-medium text-gradient">
                {data.totalReferrals}
              </p>
              <p className="text-[12px] text-fg-tertiary mt-1">Creators referred</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-5"
              style={{ background: "rgb(var(--bg-card))" }}>
              <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
              <Gift className="w-4 h-4 text-fg-tertiary mb-3" />
              <p className="text-[28px] font-display font-medium text-gradient">
                {data.referralPoints.toLocaleString()}
              </p>
              <p className="text-[12px] text-fg-tertiary mt-1">Referral points</p>
            </div>
          </div>

          {/* Referral link card */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-5 md:p-6"
            style={{ background: "rgb(var(--bg-card))" }}>
            <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
            <p className="text-[13px] font-semibold text-fg-primary mb-1">Your referral link</p>
            <p className="text-[12px] text-fg-tertiary mb-4">
              Share this link — anyone who signs up through it gets credited to you.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-white/[0.06] bg-bg-base/60">
                <p className="text-[13.5px] text-fg-primary truncate font-mono">
                  {data.referralLink}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors"
              >
                {copied
                  ? <><Check className="w-4 h-4 text-success" /> Copied</>
                  : <><Copy className="w-4 h-4" /> Copy</>
                }
              </button>
            </div>

            {/* Share buttons */}
            <div className="flex gap-2 mt-3">
              <a
                href={`https://twitter.com/intent/tweet?text=Join%20me%20on%20Zerra%20%E2%80%94%20the%20creator%20platform%20where%20you%20earn%20for%20your%20content%20%F0%9F%94%A5&url=${encodeURIComponent(data.referralLink)}`}
                target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-[12px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-secondary hover:text-fg-primary transition-colors"
              >
                Share on X
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Join me on Zerra — earn for your content 🔥 ${data.referralLink}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-[12px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-secondary hover:text-fg-primary transition-colors"
              >
                Share on WhatsApp
              </a>
            </div>
          </div>

          {/* Recent referrals */}
          <div>
            <p className="text-[13px] font-semibold text-fg-primary mb-3">Recent Referrals</p>
            {data.recentReferrals.length > 0 ? (
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] px-4 md:px-5 py-1"
                style={{ background: "rgb(var(--bg-card))" }}>
                <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
                {data.recentReferrals.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 py-3.5 border-b border-white/[0.04] last:border-0">
                    <div className="w-8 h-8 rounded-full bg-bg-elevated border border-white/[0.06] flex items-center justify-center text-[12px] font-semibold text-fg-secondary shrink-0">
                      {(r.referred?.name ?? r.referred?.email ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-medium text-fg-primary truncate">
                        {r.referred?.name ?? r.referred?.email?.split("@")[0] ?? "Creator"}
                      </p>
                      <p className="text-[12px] text-fg-tertiary">
                        Joined {timeAgo(r.created_at)}
                      </p>
                    </div>
                    <span className={cn(
                      "text-[11px] font-medium px-2.5 py-1 rounded-full border shrink-0",
                      r.reward_given
                        ? "text-success border-success/30 bg-[rgb(var(--success)/0.08)]"
                        : "text-fg-muted border-white/[0.06] bg-bg-elevated"
                    )}>
                      {r.reward_given ? "Rewarded" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.06] p-10 text-center"
                style={{ background: "rgb(var(--bg-card))" }}>
                <p className="text-[14px] text-fg-tertiary">No referrals yet</p>
                <p className="text-[12px] text-fg-muted mt-1">
                  Share your link above to start building your network.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}